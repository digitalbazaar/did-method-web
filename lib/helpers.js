/*!
 * Copyright (c) 2023-2024 Digital Bazaar, Inc. All rights reserved.
 */
import {assertDidWeb, assertHttpsUrl} from './assertions.js';
import {
  contextsBySuite,
  didFile,
  didPrefix,
  fileSuffix
} from './constants.js';

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
