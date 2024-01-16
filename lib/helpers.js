/*!
 * Copyright (c) 2023-2024 Digital Bazaar, Inc. All rights reserved.
 */
import {assertDidWeb, assertHttpsUrl} from './assertions.js';
import {
  contextsBySuite,
  DID_CONTEXT_URL,
  didFile,
  didPrefix,
  fileSuffix
} from './constants.js';
import {
  X25519KeyAgreementKey2019
} from '@digitalbazaar/x25519-key-agreement-key-2019';
import {
  X25519KeyAgreementKey2020
} from '@digitalbazaar/x25519-key-agreement-key-2020';

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
  const paths = _encodePaths(pathname);
  // preserve the params and hash aka fragment
  return base + paths + search + hash;
}

export function didToUrl(did) {
  assertDidWeb(did);
  const {
    pathname,
    hash,
    searchParams,
    search
  } = new URL(did);
  const ids = pathname.split(':');
  // remove the first id web
  ids.shift();
  const [domain, ...paths] = ids;
  const baseUrl = `https://${decodeURIComponent(domain)}/`;
  const fullUrl = `${baseUrl}${_decodePaths(paths)}${search}${hash}`;
  return {baseUrl, fullUrl, searchParams, search, fragment: hash, domain};
}

/**
 * Returns the public key object for a given key id fragment.
 *
 * @param {object} options - Options hashmap.
 * @param {object} options.didDocument - The DID Document to use when generating
 *   the id.
 * @param {string} options.keyIdFragment - The key identifier fragment.
 *
 * @returns {object} Returns the public key node, with `@context`.
 */
export function getKey({didDocument, keyIdFragment}) {
  // Determine if the key id fragment belongs to the "main" public key,
  // or the keyAgreement key
  const keyId = didDocument.id + '#' + keyIdFragment;
  let publicKey;
  if(didDocument.verificationMethod?.[0].id === keyId) {
    // Return the public key node for the main public key
    publicKey = didDocument.verificationMethod[0];
  } else {
    // Return the public key node for the X25519 key-agreement key
    publicKey = didDocument.keyAgreement[0];
  }

  if(!publicKey) {
    throw new Error(`Key not found ${keyId}`);
  }

  return {
    '@context': contextsBySuite.get(publicKey.type),
    ...publicKey
  };
}

export function getDid({keyPair}) {
  return keyPair.fingerprint ? `did:key:${keyPair.fingerprint()}` :
    `did:key:${keyPair.publicKeyMultibase}`;
}

export function setKeyPairId({keyPair, did}) {
  keyPair.id = keyPair.fingerprint ? `${did}#${keyPair.fingerprint()}` :
    `${did}#${keyPair.publicKeyMultibase}`;
}

export function getKeyAgreementKeyPair({contexts, verificationPublicKey}) {
  // The KAK pair will use the source key's controller, but may generate
  // its own .id
  let keyAgreementKeyPair;

  switch(verificationPublicKey.type) {
    case 'Ed25519VerificationKey2018': {
      keyAgreementKeyPair = X25519KeyAgreementKey2019
        .fromEd25519VerificationKey2018({keyPair: verificationPublicKey});
      contexts.push(X25519KeyAgreementKey2019.SUITE_CONTEXT);
      break;
    }
    case 'Ed25519VerificationKey2020': {
      keyAgreementKeyPair = X25519KeyAgreementKey2020
        .fromEd25519VerificationKey2020({keyPair: verificationPublicKey});
      contexts.push(X25519KeyAgreementKey2020.SUITE_CONTEXT);
      break;
    }
    case 'Multikey': {
      // FIXME: Add keyAgreementKeyPair interface for Multikey.
      break;
    }
    default: {
      throw new Error(
        `Cannot derive key agreement key from verification key type
          "${verificationPublicKey.type}".`);
    }
  }
  return {keyAgreementKeyPair};
}

export function getMultibaseMultikeyHeader({value}) {
  if(!value) {
    throw new TypeError('"publicKeyMultibase" must be a string.');
  }
  return value.slice(0, 4);
}

export function addKeyAgreementKeyContext({contexts, keyAgreementKeyPair}) {
  const {type} = keyAgreementKeyPair;
  switch(type) {
    case 'X25519KeyAgreementKey2019': {
      if(!contexts.includes(X25519KeyAgreementKey2019.SUITE_CONTEXT)) {
        contexts.push(X25519KeyAgreementKey2019.SUITE_CONTEXT);
      }
      break;
    }
    case 'X25519KeyAgreementKey2020': {
      if(!contexts.includes(X25519KeyAgreementKey2020.SUITE_CONTEXT)) {
        contexts.push(X25519KeyAgreementKey2020.SUITE_CONTEXT);
      }
      break;
    }
    default: {
      throw new Error(`Unsupported key agreement key type, "${type}".`);
    }
  }
}

export async function getKeyPair({
  fromMultibase, publicKeyMultibase, publicKeyDescription
} = {}) {
  let keyPair;
  if(fromMultibase && publicKeyMultibase) {
    keyPair = await fromMultibase({publicKeyMultibase});
  } else {
    keyPair = publicKeyDescription;
  }
  const {type} = keyPair;
  let keyAgreementKeyPair;
  if(type === 'X25519KeyAgreementKey2020' ||
    type === 'X25519KeyAgreementKey2019') {
    keyAgreementKeyPair = keyPair;
    keyPair = null;
  }
  return {keyPair, keyAgreementKeyPair};
}

/**
 * Converts key pair to a `did:web` method DID Document.
 *
 * @param {object} options - Options hashmap.
 * @param {object} options.keyPair - Key pair used to generate the DID document.
 * @param {object} [options.keyAgreementKeyPair] -  Optional
 *   keyAgreement key pair for generating did for keyAgreement.
 * @param {string} [options.did] - The DID for the did document, if not
 *   provided it will be autogenerated from the key pair.
 * @returns {Promise<{didDocument: object, keyPairs: Map}>}
 *   Resolves with the generated DID Document, along with the corresponding
 *   key pairs used to generate it (for storage in a KMS).
 */
export async function keyPairToDidDocument({
  keyPair, keyAgreementKeyPair, did
} = {}) {
  const keyPairs = new Map();
  let didDocument;
  let publicDhKey;
  const contexts = [DID_CONTEXT_URL];
  if(!keyPair && keyAgreementKeyPair) {
    addKeyAgreementKeyContext({contexts, keyAgreementKeyPair});
    const did = getDid({keyPair: keyAgreementKeyPair});
    keyAgreementKeyPair.controller = did;
    setKeyPairId({keyPair: keyAgreementKeyPair, did});
    publicDhKey = await keyAgreementKeyPair.export({publicKey: true});
    keyPairs.set(keyAgreementKeyPair.id, keyAgreementKeyPair);
    didDocument = {
      '@context': contexts,
      id: did,
      keyAgreement: [publicDhKey]
    };
    return {didDocument, keyPairs};
  }
  let {publicKeyMultibase} = keyPair;
  if(!publicKeyMultibase && keyPair.publicKeyBase58) {
    // handle backwards compatibility w/older key pair interfaces
    publicKeyMultibase = await keyPair.fingerprint();
  }
  // get the multibaseMultikeyHeader from the public key value
  const multibaseMultikeyHeader = getMultibaseMultikeyHeader({
    value: publicKeyMultibase
  });
  const fromMultibase = this._allowedKeyTypes.get(multibaseMultikeyHeader);
  if(!fromMultibase) {
    throw new Error(
      `Unsupported "multibaseMultikeyHeader", "${multibaseMultikeyHeader}".`);
  }
  const verificationKeyPair = await fromMultibase({publicKeyMultibase});

  did = did ?? getDid({keyPair: verificationKeyPair});
  verificationKeyPair.controller = did;
  // Now set the source key's id
  setKeyPairId({keyPair: verificationKeyPair, did});
  // get the public components of verification keypair
  const verificationPublicKey = await verificationKeyPair.export({
    publicKey: true,
    includeContext: true
  });
  contexts.push(verificationPublicKey['@context']);
  // delete context from verificationPublicKey
  delete verificationPublicKey['@context'];
  // get the keyAgreement keypair
  if(!keyAgreementKeyPair) {
    ({keyAgreementKeyPair} = await getKeyAgreementKeyPair({
      contexts, verificationPublicKey
    }));
  }

  // get the public components of keyAgreement keypair
  if(keyAgreementKeyPair) {
    addKeyAgreementKeyContext({contexts, keyAgreementKeyPair});
    const did = getDid({keyPair: keyAgreementKeyPair});
    if(!keyAgreementKeyPair.controller) {
      keyAgreementKeyPair.controller = did;
    }
    if(!keyAgreementKeyPair.id) {
      setKeyPairId({keyPair: keyAgreementKeyPair, did});
    }
    publicDhKey = await keyAgreementKeyPair.export({publicKey: true});
  }

  // Compose the DID Document
  didDocument = {
    // Note that did:web does not have its own method-specific context,
    // and only uses the general DID Core context, and key-specific contexts.
    '@context': contexts,
    id: did,
    verificationMethod: [verificationPublicKey],
    authentication: [verificationPublicKey.id],
    assertionMethod: [verificationPublicKey.id],
    capabilityDelegation: [verificationPublicKey.id],
    capabilityInvocation: [verificationPublicKey.id],
  };
  if(publicDhKey) {
    didDocument.keyAgreement = [publicDhKey];
  }
  // create the key pairs map
  keyPairs.set(verificationKeyPair.id, verificationKeyPair);
  if(keyAgreementKeyPair) {
    keyPairs.set(keyAgreementKeyPair.id, keyAgreementKeyPair);
  }

  return {didDocument, keyPairs};
}

/**
 * Takes in the pathname from URL, splits the paths
 * on "/", uri encodes them, & then rejoins them with ":".
 *
 * @param {string} paths - The paths to encode.
 *
 * @returns {string} The paths in did format.
 */
function _encodePaths(paths) {
  // remove the fileSuffix, then possibly did.json
  const basePaths = paths.replace(fileSuffix, '').replace(didFile, '');
  if(basePaths === '/') {
    return '';
  }
  // split on "/" & remove empty strings
  const _paths = basePaths.split('/').filter(Boolean);
  return ':' + _paths.map(encodeURIComponent).join(':');
}

/**
 * If no paths just return well-known/did.json else return paths with
 * did.json at the end.
 *
 * @private
 * @param {Array<string>} paths - Potential url paths.
 *
 * @returns {string} The resulting paths for the url.
 */
function _decodePaths(paths) {
  if(paths.length === 0) {
    return fileSuffix;
  }
  return `${paths.map(decodeURIComponent).join('/')}/${didFile}`;
}
