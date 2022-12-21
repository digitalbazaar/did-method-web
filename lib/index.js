/*!
 * Copyright (c) 2021-2022 Digital Bazaar, Inc. All rights reserved.
 */
import {didToUrl, urlToDid} from './helpers.js';
import {DidWebDriver} from './DidWebDriver.js';

/**
 * Helper method to match the `.driver()` API of other `did-io` plugins.
 *
 * @param {object} options - Options to use.
 * @param {object} [options.verificationSuite] - A verification suite to use.
 * @param {Array<string>} [options.allowList] - A list of allowed domains.
 * @param {object} options.fetchOptions - Options for the http client.
 *
 * @returns {DidWebDriver} Returns an instance of a did:web resolver driver.
 */
function driver({verificationSuite, allowList, fetchOptions} = {}) {
  return new DidWebDriver({verificationSuite, allowList, fetchOptions});
}

export {driver, DidWebDriver, didToUrl, urlToDid};
