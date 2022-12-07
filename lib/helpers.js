/*!
 * Copyright (c) 2021-2022 Digital Bazaar, Inc. All rights reserved.
 */
export function urlToDid(url) {
  assertHttpsUrl(url);
}

export function didToUrl(did) {
  assertDidWeb(did);

}

export function assertHttpsUrl(url) {
  if(url instanceof URL) {
    return assertHttps(url);
  }
  if(typeof url === 'string') {
    const _url = new URL(url);
    return assertHttps(_url);
  }
  throw new TypeError('"url" must be a string or a url');
}

export function assertHttps(url) {
  if(url.protocol && (url.protocol === 'https:')) {
    return true;
  }
  throw new TypeError(
    `"url" protocol must by "https:" received ${url.protocol}`);
}

export function assertDidWeb(did) {
  const didType = typeof did;
  if(didType !== 'string') {
    throw new TypeError(`Expected did to be a string received ${didType}`);
  }
  const [scheme, method, domain] = did.split(':');
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
}


