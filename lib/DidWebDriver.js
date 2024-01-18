/*!
 * Copyright (c) 2023-2024 Digital Bazaar, Inc. All rights reserved.
 */
import * as didIo from '@digitalbazaar/did-io';
import {
  didUrlToHttpsUrl,
  getNode,
  httpsUrlToDidUrl
} from './helpers.js';
import {assertDomain} from './assertions.js';
import {defaultFetchOptions} from './constants.js';
import {driver as DidKeyDriver} from '@digitalbazaar/did-method-key';
import {httpClient} from '@digitalbazaar/http-client';

export class DidWebDriver {
  /**
   * @param {object} options - Options object.
   * @param {object} [options.fetchOptions = defaultFetchOptions] - Options for
   *   the http client requests.
   * @param {Array<string>} [options.allowList = []] - A list of allowed
   *   domains.
   */
  constructor({
    fetchOptions = defaultFetchOptions,
    allowList = []
  } = {}) {
    // used by did-io to register drivers
    this.method = 'web';
    this.fetchOptions = fetchOptions;
    this.allowList = allowList;
    this.didKeyDriver = DidKeyDriver();
  }

  /**
   * Registers a multibase-multikey header and a multibase-multikey
   * deserializer that is allowed to handle data using that header.
   *
   * @param {object} options - Options hashmap.
   *
   * @param {string} options.multibaseMultikeyHeader - The multibase-multikey
   *   header to register.
   * @param {Function} options.fromMultibase - A function that converts a
   *  `{publicKeyMultibase}` value into a key pair interface.
   */
  use({multibaseMultikeyHeader, fromMultibase} = {}) {
    this.didKeyDriver.use({multibaseMultikeyHeader, fromMultibase});
  }

  /**
   * Generates a new `did:web` method DID Document from a KeyPair.
   *
   * @param {object} options - Options hashmap.
   * @param {URL} options.url - The HTTPS url of the DID document.
   * @param {object} options.verificationKeyPair - A verification KeyPair.
   * @param {object} [options.keyAgreementKeyPair] - A keyAgreement KeyPair.
   *
   * @returns {Promise<{didDocument: object, keyPairs: Map,
   *   methodFor: Function}>} Resolves with the generated DID Document, along
   *   with the corresponding key pairs used to generate it (for storage in a
   *   KMS).
   */
  async fromKeyPair({url, verificationKeyPair, keyAgreementKeyPair} = {}) {
    assertDomain({allowList: this.allowList, url});

    const {didDocument, keyPairs} = await this.didKeyDriver.fromKeyPair({
      verificationKeyPair, keyAgreementKeyPair
    });

    // update `didDocument` using url-based DID
    const {did} = httpsUrlToDidUrl(url);
    didDocument.id = did;

    // replace all other `did:key` occurrences
    for(const [key, value] of Object.entries(didDocument)) {
      if(Array.isArray(value)) {
        for(const [i, e] of value.entries()) {
          if(typeof e?.id === 'string' && e.id.startsWith('did:key:')) {
            e.id = _replaceDidKeyIdWithDidWebId(did, e.id);
            if(e?.controller?.startsWith('did:key:')) {
              e.controller = did;
            }
          } else if(typeof e === 'string' && e.startsWith('did:key:')) {
            value[i] = _replaceDidKeyIdWithDidWebId(did, e);
          }
        }
      } else if(value?.id === 'string' && value.id.startsWith('did:key:')) {
        value.id = _replaceDidKeyIdWithDidWebId(did, value.id);
        if(value?.controller?.startsWith('did:key:')) {
          value.controller = did;
        }
      } else if(typeof value === 'string' && value.startsWith('did:key:')) {
        didDocument[key] = _replaceDidKeyIdWithDidWebId(did, value);
      }
    }

    // update each `keyPair`
    const newKeyPairs = new Map();
    for(const [key, value] of keyPairs) {
      const fragmentIdx = key.indexOf('#');
      value.id = did + key.slice(fragmentIdx);
      value.controller = did;
      newKeyPairs.set(value.id, value);
    }

    // convenience function that returns the public/private key pair instance
    // for a given purpose (authentication, assertionMethod, keyAgreement, etc).
    const methodFor = ({purpose}) => {
      const {id: methodId} = this.publicMethodFor({didDocument, purpose});
      return newKeyPairs.get(methodId);
    };
    return {didDocument, keyPairs: newKeyPairs, methodFor};
  }

  /**
   * Returns the public key (verification method) object for a given DID
   * Document and purpose. Useful in conjunction with a `.get()` call.
   *
   * @example
   * const didDocument = await didWebDriver.get({did});
   * const authKeyData = didDriver.publicMethodFor({
   *   didDocument, purpose: 'authentication'
   * });
   * // you can then create a suite instance object to verify signatures etc.
   * const keyPair = await EcdsaMultikey.from(authKeyData);
   * const {verify} = authPublicKey.verifier();
   *
   * @param {object} options - Options object.
   * @param {object} options.didDocument - DID Document (retrieved via a
   *   `.get()` or from some other source).
   * @param {string} options.purpose - Verification method purpose, such as
   *   'authentication', 'assertionMethod', 'keyAgreement' and so on.
   *
   * @returns {object} Returns the public key object (obtained from the DID
   *   Document), without a `@context`.
   */
  publicMethodFor({didDocument, purpose} = {}) {
    if(!didDocument) {
      throw new TypeError('The "didDocument" parameter is required.');
    }
    if(!purpose) {
      throw new TypeError('The "purpose" parameter is required.');
    }

    const method = didIo.findVerificationMethod({doc: didDocument, purpose});
    if(!method) {
      throw new Error(`No verification method found for purpose "${purpose}"`);
    }
    return method;
  }

  /**
   * Returns a `did:web` method DID Document for a given DID, or a key document
   * for a given DID URL (key id).
   * Either a `did` or `url` param is required.
   *
   * @example
   * await resolver.get({did}); // -> did document
   * await resolver.get({url: keyId}); // -> public key node
   *
   * @param {object} options - Options object.
   * @param {string} [options.did] - DID URL (which can be a bare DID).
   * @param {string} [options.url] - Alias for the `did` url param, supported
   *   for better readability of invoking code.
   * @param {object} [options.fetchOptions = {}] - Options for the request.
   *
   * @returns {Promise<object>} Resolves to a DID Document or a
   *   public key node with context.
   */
  async get({did, url, fetchOptions = {}} = {}) {
    did = did || url;
    // checks the DID is a valid did:web url then produces an HTTPS url
    const {baseUrl, fragment} = didUrlToHttpsUrl(did);
    // ensures the domain is allowed
    assertDomain({allowList: this.allowList, url: baseUrl});
    // overwrite global options with request specific options
    const requestOptions = {...this.fetchOptions, ...fetchOptions};
    const {data} = await httpClient.get(baseUrl, requestOptions);
    // split on `?` query or `#` fragment
    const [didAuth] = did.split(/(?=[\?#])/);

    if(data?.id !== didAuth) {
      throw new Error(`DID document for DID "${did}" not found.`);
    }

    // FIXME: perform DID document validation
    // FIXME: handle URL query param / services
    const didDocument = data;

    // if a fragment was found use the fragment to dereference a subnode
    // in the did doc
    if(fragment) {
      const id = `${data.id}${fragment}`;
      return getNode({didDocument: data, id});
    }
    // resolve the full DID Document
    return didDocument;
  }
}

function _replaceDidKeyIdWithDidWebId(did, value) {
  const fragmentIdx = value.indexOf('#');
  return did + (fragmentIdx === -1 ? '' : value.slice(fragmentIdx));
}
