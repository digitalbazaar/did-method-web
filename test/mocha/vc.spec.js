/*!
 * Copyright (c) 2019-2022 Digital Bazaar, Inc. All rights reserved.
 */
import * as vc from '@digitalbazaar/vc';
import {
  TEST_DID,
  TEST_SEED,
  TEST_URL,
} from '../constants.js';
import chai from 'chai';
import {driver} from '../../lib/index.js';

chai.should();
const {expect} = chai;
const didWebDriver = driver();

describe('vc', function() {
  let signer;
  before(async function() {
    const seedBytes = (new TextEncoder()).encode(TEST_SEED).slice(0, 32);
    const {methodFor} = await didWebDriver.generate({
      seed: seedBytes,
      url: TEST_URL
    });
    signer = methodFor({purpose: ''});
  });
  describe('Sign', async function() {
    const issuedVC = await vc.issue({});
  });
  describe('Verify', function() {

  });
});

