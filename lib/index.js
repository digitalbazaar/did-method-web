/*!
 * Copyright (c) 2021-2022 Digital Bazaar, Inc. All rights reserved.
 */
import {didToUrl, urlToDid} from './helpers.js';
import {DidWebDriver} from './DidWebDriver.js';

/**
 * Helper method to match the `.driver()` API of other `did-io` plugins.
 *
 * @returns {DidWebDriver} Returns an instance of a did:web resolver driver.
 */
function driver({verificationSuite} = {}) {
  return new DidWebDriver({verificationSuite});
}

export {driver, DidWebDriver, didToUrl, urlToDid};
