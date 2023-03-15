/*!
 * Copyright (c) 2019-2023 Digital Bazaar, Inc. All rights reserved.
 */
import * as vc from '@digitalbazaar/vc';
import {
  TEST_DID,
  TEST_SEED,
  TEST_URL,
} from '../constants.js';
import chai from 'chai';
import {documentLoader} from '../documentLoader.js';
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
  issuer: TEST_DID,
  issuanceDate: '2010-01-01T19:23:24Z',
  credentialSubject: {id: TEST_DID}
};

describe('vc', function() {
  let key;
  let suite;
  before(async function() {
    const seedBytes = (new TextEncoder()).encode(TEST_SEED).slice(0, 32);
    const {methodFor} = await didWebDriver.generate({
      seed: seedBytes,
      url: TEST_URL
    });
    key = methodFor({purpose: 'assertionMethod'});
    suite = new Ed25519Signature2020({key});
  });
  describe('sign', async function() {
    it('should issue a Vc', async function() {
      const issuedVc = await vc.issue({suite, credential, documentLoader});
      expect(issuedVc).to.exist;
      expect(issuedVc).to.be.an('object');
      expect(issuedVc.proof).to.exist;
      expect(issuedVc.proof).to.be.an('object');
      expect(issuedVc.proof.verificationMethod).to.exist;
      expect(issuedVc.proof.verificationMethod).to.be.a('string');
      expect(issuedVc.proof.verificationMethod).to.equal(key.id);
    });
  });
  describe('Verify', function() {
    it('should verify a vc', async function() {
      const issuedVc = await vc.issue({suite, credential, documentLoader});
      expect(issuedVc).to.exist;
      const verifyResult = await vc.verifyCredential({
        suite: new Ed25519Signature2020(),
        credential,
        documentLoader
      });
      expect(verifyResult).to.exist;
      expect(verifyResult.verified).to.exist;
      expect(verifyResult.verified).to.equal(true);
    });
  });
});

