/*!
 * Copyright (c) 2021 Digital Bazaar, Inc. All rights reserved.
 */

import {DidWebDriver} from './DidWebDriver.js';

/**
 * Helper method to match the `.driver()` API of other `did-io` plugins.
 *
 * @returns {DidWebDriver} Returns an instance of a did:web resolver driver.
 */
function driver() {
  return new DidWebDriver();
}

export {driver, DidWebDriver};
