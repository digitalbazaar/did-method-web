/*!
 * Copyright (c) 2023-2024 Digital Bazaar, Inc. All rights reserved.
 */
import {didUrlToHttpsUrl, httpsUrlToDidUrl} from './helpers.js';
import {DidWebDriver} from './DidWebDriver.js';

// re-export `createFromMultibase` for `use` API
export {createFromMultibase} from '@digitalbazaar/did-method-key';

/**
 * Helper method to match the `.driver()` API of other `did-io` plugins.
 *
 * @param {object} options - Options to use.
 * @param {Array<string>} [options.allowList] - A list of allowed domains.
 * @param {object} options.fetchOptions - Options for the http client.
 *
 * @returns {DidWebDriver} Returns an instance of a did:web resolver driver.
 */
function driver({allowList, fetchOptions} = {}) {
  return new DidWebDriver({allowList, fetchOptions});
}

export {driver, DidWebDriver, didUrlToHttpsUrl, httpsUrlToDidUrl};
