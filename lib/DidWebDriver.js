/*!
 * Copyright (c) 2023-2024 Digital Bazaar, Inc. All rights reserved.
 */
import * as didIo from '@digitalbazaar/did-io';
import {
  didToUrl,
  getKey,
  keyPairToDidDocument,
  urlToDid
} from './helpers.js';
import {assertDomain} from './assertions.js';
import {defaultFetchOptions} from './constants.js';
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
    // FIXME: just use a did key driver internally for this
    this._allowedKeyTypes = new Map();
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
    if(!(multibaseMultikeyHeader &&
      typeof multibaseMultikeyHeader === 'string')) {
      throw new TypeError('"multibaseMultikeyHeader" must be a string.');
    }
    if(typeof fromMultibase !== 'function') {
      throw new TypeError('"fromMultibase" must be a function.');
    }
    this._allowedKeyTypes.set(multibaseMultikeyHeader, fromMultibase);
  }

  /**
   * Generates a new `did:web` method DID Document from a KeyPair.
   *
   * @param {object} options - Options hashmap.
   * @param {URL} options.url - The url of the DID document.
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
    if(!verificationKeyPair) {
      throw new TypeError('"verificationKeyPair" must be an object.');
    }
    // keyPairs is a map of keyId to key pair instance, that includes the
    // verificationKeyPair above and the keyAgreementKey pair that is
    // optionally passed or derived from the passed verification key pair
    const {didDocument, keyPairs} = await keyPairToDidDocument({
      did: urlToDid(url),
      keyPair: verificationKeyPair,
      keyAgreementKeyPair
    });

    // convenience function that returns the public/private key pair instance
    // for a given purpose (authentication, assertionMethod, keyAgreement, etc).
    const methodFor = ({purpose}) => {
      const {id: methodId} = this.publicMethodFor({
        didDocument, purpose
      });
      return keyPairs.get(methodId);
    };
    return {didDocument, keyPairs, methodFor};
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
   * @param {string} [options.did] - DID or a key id (either an ed25519 key
   *   or an x25519 key-agreement key id).
   * @param {string} [options.url] - Alias for the `did` url param, supported
   *   for better readability of invoking code.
   * @param {object} [options.fetchOptions = {}] - Options for the request.
   *
   * @returns {Promise<object>} Resolves to a DID Document or a
   *   public key node with context.
   */
  async get({did, url, fetchOptions = {}} = {}) {
    did = did || url;
    // checks the did is a valid did:web then produces a url
    const {fullUrl, fragment} = didToUrl(did);
    // ensures the domain is allowed
    assertDomain({allowList: this.allowList, url: fullUrl});
    // overwrite global options with request specific options
    const requestOptions = {...this.fetchOptions, ...fetchOptions};
    const {data} = await httpClient.get(fullUrl, requestOptions);
    const [publicKeyDescription] = data.verificationMethod;
    // split on `?` query or `#` fragment
    const [didAuth] = did.split(/(?=[\?#])/);
    const {didDocument} = await keyPairToDidDocument({
      did: didAuth,
      keyPair: publicKeyDescription,
      verificationSuite: this.verificationSuite
    });
    // if a fragment was found use the fragment to dereference a key
    // in the did doc
    if(fragment) {
      return getKey({didDocument, keyIdFragment: fragment});
    }
    // Resolve the full DID Document
    return didDocument;
  }
}
