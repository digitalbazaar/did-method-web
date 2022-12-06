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
  if(url.protocol === 'https:') {
    return true;
  }
  throw new TypeError(
    `"url" protocol must by "https:" received ${url.protocol}`);
}

export function urlToDid(url) {

}

export function didToUrl(did) {

}
