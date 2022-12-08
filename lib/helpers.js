/*!
 * Copyright (c) 2021-2022 Digital Bazaar, Inc. All rights reserved.
 */
import {assertDidWeb, assertHttpsUrl} from './assertions.js';
import {didPrefix} from './constants.js';

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

}
