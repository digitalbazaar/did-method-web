/*!
 * Copyright (c) 2023 Digital Bazaar, Inc. All rights reserved.
 */
export function assertHttpsUrl(url) {
  const _url = assertUrl(url);
  assertHttps(_url);
}

export function assertUrl(url) {
  if(url instanceof URL) {
    return url;
  }
  if(typeof url === 'string') {
    return new URL(url);
  }
  throw new TypeError('"url" must be a string or a URL');
}

export function assertHttps(url) {
  if(url.protocol === 'https:') {
    return true;
  }
  throw new TypeError(
    `"url" protocol must by "https:" received ${url.protocol}`);
}

export function assertDidWeb(did) {
  if(!did) {
    throw new TypeError('"did" must be a non-zero length string.');
  }
  const didType = typeof did;
  if(didType !== 'string') {
    throw new TypeError(`Expected DID to be a string received ${didType}`);
  }
  const [scheme, method, domain] = did.split(':', 3);
  if(scheme !== 'did') {
    const e = new Error(`Scheme must be "did" received ${scheme}`);
    e.code = 'invalidDid';
    throw e;
  }
  if(method !== 'web') {
    const e = new Error(`Did method must be "web" received ${method}`);
    e.code = 'methodNotSupported';
    throw e;
  }
  if(!domain) {
    throw new Error(
      `Expected domain to be a non-zero length string received ${domain}`);
  }
  if(domain.includes('/')) {
    throw new Error(
      `Expected domain to not contain a path "/" received ${domain}`);
  }
}

export function assertDomain({allowList, url}) {
  if(!allowList) {
    return;
  }
  if(allowList.length <= 0) {
    return;
  }
  const {host} = new URL(url);
  if(allowList.includes(host)) {
    return;
  }
  throw new Error(`Domain "${host}" is not allowed.`);
}
