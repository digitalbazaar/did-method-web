/*!
 * Copyright (c) 2019-2024 Digital Bazaar, Inc. All rights reserved.
 */
import * as vc from '@digitalbazaar/vc';
import {
  FILE_URL,
  TEST_DID,
  TEST_URL,
} from '../constants.js';
import chai from 'chai';
import {documentLoader} from '../documentLoader.js';
import {driver} from '../../lib/index.js';
import {Ed25519Signature2020} from '@digitalbazaar/ed25519-signature-2020';
import {Ed25519VerificationKey2020} from
  '@digitalbazaar/ed25519-verification-key-2020';
import {stubRequest} from '../helpers.js';

chai.should();
const {expect} = chai;
const didWebDriver = driver();
didWebDriver.use({
  multibaseMultikeyHeader: 'z6Mk',
  fromMultibase: Ed25519VerificationKey2020.from
});
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
  let signSuite;
  let stub;
  before(async function() {
    // eslint-disable-next-line max-len
    const publicKeyMultibase = 'z6MknCCLeeHBUaHu4aHSVLDCYQW9gjVJ7a63FpMvtuVMy53T';
    const privateKeyMultibase =
      'zrv2EET2WWZ8T1Jbg4fEH5cQxhbUS22XxdweypUbjWVzv1YD6VqYu' +
      'W6LH7heQCNYQCuoKaDwvv2qCWz3uBzG2xesqmf';
    const verificationKeyPair = await Ed25519VerificationKey2020.from({
      privateKeyMultibase,
      publicKeyMultibase
    });
    const {didDocument, methodFor} = await didWebDriver.fromKeyPair({
      url: TEST_URL,
      verificationKeyPair
    });
    key = methodFor({purpose: 'assertionMethod'});
    verificationKeyPair.id = key.id;
    verificationKeyPair.controller = didDocument.id;
    signSuite = new Ed25519Signature2020({
      signer: verificationKeyPair.signer()
    });

    stub = stubRequest({url: FILE_URL, data: didDocument});
  });
  after(async function() {
    stub.restore();
  });
  describe('sign', async function() {
    it('should issue a Vc', async function() {
      const issuedVc = await vc.issue({
        suite: signSuite, credential, documentLoader
      });
      expect(issuedVc).to.exist;
      expect(issuedVc).to.be.an('object');
      expect(issuedVc.proof).to.exist;
      expect(issuedVc.proof).to.be.an('object');
      expect(issuedVc.proof.verificationMethod).to.exist;
      expect(issuedVc.proof.verificationMethod).to.be.a('string');
      expect(issuedVc.proof.verificationMethod).to.equal(key.id);
    });
  });
  describe('verify', function() {
    it('should verify a vc', async function() {
      const issuedVc = await vc.issue({
        suite: signSuite, credential, documentLoader
      });
      expect(issuedVc).to.exist;
      const verifyResult = await vc.verifyCredential({
        suite: new Ed25519Signature2020(),
        credential,
        // use did:web driver within doc loader
        async documentLoader(url) {
          if(url.startsWith('did:web:')) {
            const didDocument = await didWebDriver.get({url});
            return {
              contextUrl: null,
              documentUrl: url,
              document: didDocument
            };
          }
          return documentLoader(url);
        }
      });
      expect(verifyResult).to.exist;
      expect(verifyResult.verified).to.exist;
      expect(verifyResult.verified).to.equal(true);
    });
  });
});
