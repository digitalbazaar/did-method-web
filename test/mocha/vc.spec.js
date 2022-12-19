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
import {Ed25519Signature2020} from '@digitalbazaar/ed25519-signature-2020';

chai.should();
const {expect} = chai;
const didWebDriver = driver();
const credential = {
  '@context': [
    'https://www.w3.org/2018/credentials/v1',
  ],
  id: 'https://example.com/credentials/1872',
  type: ['VerifiableCredential'],
  issuer: 'https://example.edu/issuers/565049',
  issuanceDate: '2010-01-01T19:23:24Z',
  credentialSubject: {id: 'urn:test:issue-did-web'}
};

describe.only('vc', function() {
  let suite;
  before(async function() {
    console.log('vc before');
    const seedBytes = (new TextEncoder()).encode(TEST_SEED).slice(0, 32);
    const {methodFor} = await didWebDriver.generate({
      seed: seedBytes,
      url: TEST_URL
    });
    const key = methodFor({purpose: 'assertionMethod'});
    suite = new Ed25519Signature2020({key});
  });
  describe('Sign', async function() {
    it('should issue a Vc', async function() {
      const issuedVc = await vc.issue({suite, credential});
      expect(issuedVc).to.exist;
    });
  });
  describe('Verify', function() {
    it('should verify a vc', async function() {
      const suite = new Ed25519Signature2020();
    });
  });
});

