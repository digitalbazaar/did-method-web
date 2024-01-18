/*!
 * Copyright (c) 2023-2024 Digital Bazaar, Inc. All rights reserved.
 */
import {assertDidWebUrl, assertHttpsUrl} from './assertions.js';
import {
  contextsBySuite,
  didFile,
  didPrefix,
  fileSuffix
} from './constants.js';
import {klona} from 'klona';

/**
 * Takes in an HTTPS (well-known) DID web url and returns a `did:web` DID URL.
 *
 * @param {URL|string} url - A url.
 *
 * @returns {string} A `did:web` URL.
 */
export function httpsUrlToDidUrl(url) {
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
  const did = base + paths;
  const fullUrl = did + search + hash;
  return {did, fullUrl};
}

export function didUrlToHttpsUrl(did) {
  assertDidWebUrl(did);
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
 * Returns the subnode of a DID document based on its `id`.
 *
 * @param {object} options - Options hashmap.
 * @param {object} options.didDocument - The DID Document that might contain
 *   the subnode identified by `id`.
 * @param {string} options.id - The identifier for the subnode.
 *
 * @returns {object} Returns the subnode, with `@context`.
 */
export function getNode({didDocument, id}) {
  // do verification method search first
  let match = didDocument?.verificationMethod?.find(vm => vm?.id === id);
  if(!match) {
    // check other top-level nodes
    for(const [key, value] of Object.entries(didDocument)) {
      if(key === '@context' || key === 'verificationMethod') {
        continue;
      }
      if(value?.id === id) {
        match = value;
      }
    }
  }

  if(!match) {
    throw new Error(`DID document entity with id "${id}" not found.`);
  }

  return {
    '@context': klona(
      contextsBySuite.get(match.type) ?? didDocument['@context']),
    ...klona(match)
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
