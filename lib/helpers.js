/*!
 * Copyright (c) 2021-2022 Digital Bazaar, Inc. All rights reserved.
 */
import {assertDidWeb, assertHttpsUrl} from './assertions.js';
import {
  contextsBySuite,
  DID_CONTEXT_URL,
  didPrefix,
  ED25519_KEY_2018_CONTEXT_URL
} from './constants.js';
import {
  Ed25519VerificationKey2020
} from '@digitalbazaar/ed25519-verification-key-2020';
import {
  X25519KeyAgreementKey2019
} from '@digitalbazaar/x25519-key-agreement-key-2019';
import {
  X25519KeyAgreementKey2020
} from '@digitalbazaar/x25519-key-agreement-key-2020';

/**
 * A Linked Data Key Pair.
 *
 * @typedef {object} LDKeyPair
 * @see https://github.com/digitalbazaar/crypto-ld/blob/main/lib/LDKeyPair.js
 *
*/

/**
 * Takes in an https url and returns a `did:web` identifier.
 *
 * @param {URL|string} url - A url.
 *
 * @returns {string} A `did:web` identifier.
 */
export function urlToDid(url) {
  assertHttpsUrl(url);
  const {
    host,
    hash,
    search,
    pathname
  } = new URL(url);
  const base = `${didPrefix}${encodeURIComponent(host)}`;
  // replace all / with :
  const paths = pathname.replace(/\//g, ':');
  // preserve the params and hash aka fragment
  return base + paths + search + hash;
}

export function didToUrl(did) {
  assertDidWeb(did);
  const {
    pathname,
    hash,
    searchParams
  } = new URL(did);
  const paths = pathname.split(':');
  // remove the first path web
  paths.shift();
  const [domain, ...path] = paths;
  const baseUrl = `https://${decodeURIComponent(domain)}/${path.join('/')}`;
  return {baseUrl, searchParams, fragment: hash};
}

/**
 * Converts an Ed25519KeyPair object to a `did:web` method DID Document.
 *
 * @param {object} options - Options object.
 * @param {LDKeyPair|object} options.keyPair - Key used to generate the DID
 *   document (either an LDKeyPair instance containing public key material,
 *   or a "key description" plain object (such as that generated from a KMS)).
 * @param {string} options.did - The did for the did document.
 * @param {object} options.verificationSuite - The verification suite.
 *
 * @returns {Promise<{didDocument: object, keyPairs: Map}>}
 *   Resolves with the generated DID Document, along with the corresponding
 *   key pairs used to generate it (for storage in a KMS).
 */
export async function keyPairToDidDocument({
  keyPair,
  did,
  verificationSuite
} = {}) {
  const verificationKeyPair = await verificationSuite.from({...keyPair});
  verificationKeyPair.controller = did;

  const contexts = [DID_CONTEXT_URL];

  // The KAK pair will use the source key's controller, but will generate
  // its own .id
  let keyAgreementKeyPair;
  if(verificationKeyPair.type === 'Ed25519VerificationKey2020') {
    keyAgreementKeyPair = X25519KeyAgreementKey2020
      .fromEd25519VerificationKey2020({keyPair: verificationKeyPair});
    contexts.push(Ed25519VerificationKey2020.SUITE_CONTEXT,
      X25519KeyAgreementKey2020.SUITE_CONTEXT);
  } else if(verificationKeyPair.type === 'Ed25519VerificationKey2018') {
    keyAgreementKeyPair = X25519KeyAgreementKey2019
      .fromEd25519VerificationKey2018({keyPair: verificationKeyPair});
    contexts.push(ED25519_KEY_2018_CONTEXT_URL,
      X25519KeyAgreementKey2019.SUITE_CONTEXT);
  } else {
    throw new Error(
      'Cannot derive key agreement key from verification key type "' +
        verificationKeyPair.type + '".'
    );
  }

  // Now set the source key's id
  verificationKeyPair.id = `${did}#${verificationKeyPair.fingerprint()}`;

  // get the public components of each keypair
  const publicEdKey = verificationKeyPair.export({publicKey: true});
  const publicDhKey = keyAgreementKeyPair.export({publicKey: true});

  // Compose the DID Document
  const didDocument = {
    // Note that did:web does not have its own method-specific context,
    // and only uses the general DID Core context, and key-specific contexts.
    '@context': contexts,
    id: did,
    verificationMethod: [publicEdKey],
    authentication: [publicEdKey.id],
    assertionMethod: [publicEdKey.id],
    capabilityDelegation: [publicEdKey.id],
    capabilityInvocation: [publicEdKey.id],
    keyAgreement: [publicDhKey]
  };

  // create the key pairs map
  const keyPairs = new Map();
  keyPairs.set(verificationKeyPair.id, verificationKeyPair);
  keyPairs.set(keyAgreementKeyPair.id, keyAgreementKeyPair);

  return {didDocument, keyPairs};
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
export function getKey({didDocument, keyIdFragment}) {
  // Determine if the key id fragment belongs to the "main" public key,
  // or the keyAgreement key
  const keyId = didDocument.id + keyIdFragment;
  const publicKey = _getPublicKey({didDocument, keyId});
  if(!publicKey) {
    throw new Error(`Key not found ${keyId}`);
  }
  return {
    '@context': contextsBySuite.get(publicKey.type),
    ...publicKey
  };
}

function _getPublicKey({didDocument, keyId}) {
  const verificationKey = didDocument.verificationMethod.find(
    k => k.id === keyId);
  if(verificationKey) {
    verificationKey;
  }
  return didDocument.keyAgreement.find(k => k.id === keyId);
}
