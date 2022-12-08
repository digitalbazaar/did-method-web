/*!
 * Copyright (c) 2021-2022 Digital Bazaar, Inc. All rights reserved.
 */
import * as didIo from '@digitalbazaar/did-io';
import {
  contextsBySuite,
  defaultFetchOptions,
} from './constants.js';
import {
  didToUrl,
  keyPairToDidDocument,
  urlToDid
} from './helpers.js';
import {
  Ed25519VerificationKey2020
} from '@digitalbazaar/ed25519-verification-key-2020';
import {httpClient} from '@digitalbazaar/http-client';

export class DidWebDriver {
  /**
   * @param {object} options - Options object.
   * @param {object} [options.verificationSuite=Ed25519VerificationKey2020] -
   *   Key suite for the signature verification key suite to use.
   * @param {object} [options.fetchOptions = defaultFetchOptions] - Options for
   *   the http client requests.
   * @param {Array<string>} [options.allowList = []] - A list of allowed
   *   domains.
   */
  constructor({
    verificationSuite = Ed25519VerificationKey2020,
    fetchOptions = defaultFetchOptions,
    allowList = []
  } = {}) {
    // used by did-io to register drivers
    this.method = 'web';
    this.verificationSuite = verificationSuite;
    this.fetchOptions = fetchOptions;
    this.allowList = allowList;
  }

  /**
   * Generates a new `did:web` method DID Document (optionally, from a
   * deterministic seed value).
   *
   * @param {object} options - Options object.
   * @param {URL} options.url - The url of the did document.
   * @param {Uint8Array} [options.seed] - A 32-byte array seed for a
   *   deterministic key.
   *
   * @returns {Promise<{didDocument: object, keyPairs: Map,
   *   methodFor: Function}>} Resolves with the generated DID Document, along
   *   with the corresponding key pairs used to generate it (for storage in a
   *   KMS).
   */
  async generate({url, seed} = {}) {
    // Public/private key pair of the main did:key signing/verification key
    const verificationKeyPair = await this.verificationSuite.generate({seed});

    // keyPairs is a map of keyId to key pair instance, that includes
    // the verificationKeyPair above, but also the keyAgreementKey pair that
    // is derived from the verification key pair.
    const {didDocument, keyPairs} = await keyPairToDidDocument({
      did: urlToDid(url),
      keyPair: verificationKeyPair,
      verificationSuite: this.verificationSuite
    });

    // Convenience function that returns the public/private key pair instance
    // for a given purpose (authentication, assertionMethod, keyAgreement, etc).
    const methodFor = ({purpose}) => {
      const {id: methodId} = didIo.findVerificationMethod({
        doc: didDocument, purpose
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
   * const didDocument = await didKeyDriver.get({did});
   * const authKeyData = didDriver.publicMethodFor({
   *   didDocument, purpose: 'authentication'
   * });
   * // You can then create a suite instance object to verify signatures etc.
   * const authPublicKey = await cryptoLd.from(authKeyData);
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
    if(!did) {
      throw new TypeError('"did" must be a non-zero length string.');
    }
    // overwrite global options with request specific options
    const requestOptions = {...this.fetchOptions, ...fetchOptions};
    const {data} = await httpClient.get(didToUrl(did), requestOptions);
    // Resolve the full DID Document
    return data;
  }
}

/**
 * Returns the public key object for a given key id fragment.
 *
 * @param {object} options - Options object.
 * @param {object} options.didDocument - The DID Document to use when generating
 *   the id.
 * @param {string} options.keyIdFragment - The key identifier fragment.
 *
 * @returns {object} Returns the public key node, with `@context`.
 */
export function _getKey({didDocument, keyIdFragment}) {
  // Determine if the key id fragment belongs to the "main" public key,
  // or the keyAgreement key
  const keyId = didDocument.id + '#' + keyIdFragment;
  let publicKey;

  if(didDocument.verificationMethod[0].id === keyId) {
    // Return the public key node for the main public key
    publicKey = didDocument.verificationMethod[0];
  } else {
    // Return the public key node for the X25519 key-agreement key
    publicKey = didDocument.keyAgreement[0];
  }

  return {
    '@context': contextsBySuite.get(publicKey.type),
    ...publicKey
  };
}
