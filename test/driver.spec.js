/*!
 * Copyright (c) 2019-2022 Digital Bazaar, Inc. All rights reserved.
 */
import chai from 'chai';
chai.should();
const {expect} = chai;

import {driver} from '../lib/index.js';
import {Ed25519VerificationKey2018} from
  '@digitalbazaar/ed25519-verification-key-2018';
import nock from 'nock';

const didWebDriver = driver();

// eslint-disable-next-line max-len
const TEST_SEED = '8c2114a150a16209c653817acc7f3e7e9c6c6290ae93d6689cbd61bb038cd31b';
const TEST_DID = 'did:web:w3c-ccg.github.io:user:alice';
const host = 'https://w3c-ccg.github.io';
const path = '/user/alice';
const TEST_URL = `${host}${path}`;

// TODO
//import EXPECTED_DID_DOC from './expected-did-doc.json' assert {type: 'json'};
import {
  expectedDidDoc as EXPECTED_DID_DOC,
  expectedDidDoc2018
} from './expected-data.js';

describe('did:web method driver', () => {
  describe('get', () => {
    it('should get the DID Document for a did:web DID', async () => {
      nock(host).get(path).reply(200, EXPECTED_DID_DOC);
      const didDocument = await didWebDriver.get({did: TEST_DID});
      expect(didDocument).to.eql(EXPECTED_DID_DOC);
    });

    it('should get the DID Doc in 2018 mode', async () => {
      nock(host).get(path).reply(200, expectedDidDoc2018);
      const didWebDriver2018 = driver({
        verificationSuite: Ed25519VerificationKey2018
      });
      const didDocument = await didWebDriver2018.get({did: TEST_DID});
      expect(didDocument).to.eql(expectedDidDoc2018);
    });

    it('should resolve an individual key within the DID Doc', async () => {
      const keyId = TEST_DID +
        '#z6LSgxJr5q1pwHPbiK7u8Pw1GvnfMTZSMxkhaorQ1aJYWFz3';
      nock(host).get(path).reply(200, EXPECTED_DID_DOC);
      const key = await didWebDriver.get({did: keyId});
      const [expectedKaK] = EXPECTED_DID_DOC.keyAgreement;
      expect(key).to.eql({
        '@context': 'https://w3id.org/security/suites/x25519-2020/v1',
        ...expectedKaK
      });
    });

    it('should resolve an individual key in 2018 mode', async () => {
      nock(host).get(path).reply(200, expectedDidDoc2018);
      const [vm] = expectedDidDoc2018.verificationMethod;
      const didWebDriver2018 = driver({
        verificationSuite: Ed25519VerificationKey2018
      });
      const key = await didWebDriver2018.get({did: vm.id});
      expect(key).to.eql({
        ...vm,
        '@context': 'https://w3id.org/security/suites/ed25519-2018/v1',
      });
    });

    it('should resolve an individual key agreement key', async () => {
      nock(host).get(path).reply(200, EXPECTED_DID_DOC);
      const kakKeyId =
        `${TEST_DID}#z6LSgxJr5q1pwHPbiK7u8Pw1GvnfMTZSMxkhaorQ1aJYWFz3`;
      const key = await didWebDriver.get({did: kakKeyId});
      const [expectedKak] = EXPECTED_DID_DOC.keyAgreement;
      expect(key).to.eql({
        '@context': 'https://w3id.org/security/suites/x25519-2020/v1',
        ...expectedKak
      });
    });

    it('should resolve an individual key agreement key (2018)', async () => {
      nock(host).get(path).reply(200, expectedDidDoc2018);
      const didWebDriver2018 = driver({
        verificationSuite: Ed25519VerificationKey2018
      });
      const kakKeyId =
        `${TEST_DID}#z6LSgxJr5q1pwHPbiK7u8Pw1GvnfMTZSMxkhaorQ1aJYWFz3`;
      const key = await didWebDriver2018.get({did: kakKeyId});
      const [expectedKak] = expectedDidDoc2018.keyAgreement;
      expect(key).to.eql({
        ...expectedKak,
        '@context': 'https://w3id.org/security/suites/x25519-2020/v1',
      });
    });
  });

  describe('generate', () => {
    it('should generate and get round trip', async () => {
      const {
        didDocument, keyPairs, methodFor
      } = await didWebDriver.generate({url: TEST_URL});
      const did = didDocument.id;
      expect(did).to.exist;
      expect(did).to.equal(TEST_DID);
      const keyId = didDocument.authentication[0];

      const verificationKeyPair = methodFor({purpose: 'assertionMethod'});
      const keyAgreementKeyPair = methodFor({purpose: 'keyAgreement'});

      expect(keyId).to.equal(verificationKeyPair.id);
      expect(keyAgreementKeyPair.type).to.equal('X25519KeyAgreementKey2020');

      expect(keyPairs.get(keyId).controller).to.equal(did);
      expect(keyPairs.get(keyId).id).to.equal(keyId);
      nock(host).get(path).reply(200, didDocument);

      const fetchedDidDoc = await didWebDriver.get({did});
      expect(fetchedDidDoc).to.eql(didDocument);
    });
    it('should generate a DID document from seed', async () => {
      const seedBytes = (new TextEncoder()).encode(TEST_SEED).slice(0, 32);
      const {didDocument} = await didWebDriver.generate({
        seed: seedBytes,
        url: TEST_URL
      });
      expect(didDocument).to.exist;
      expect(didDocument).to.have.keys([
        '@context', 'id', 'authentication', 'assertionMethod',
        'capabilityDelegation', 'capabilityInvocation', 'keyAgreement',
        'verificationMethod'
      ]);
      expect(didDocument).eql(EXPECTED_DID_DOC);
    });
  });

  describe('publicMethodFor', () => {
    it('should find a key for a did doc and purpose', async () => {
      const did = TEST_DID;
      nock(host).get(path).reply(200, EXPECTED_DID_DOC);
      // First, get the did document
      const didDocument = await didWebDriver.get({did});
      // Then publicMethodFor can be used to fetch key data
      const keyAgreementData = didWebDriver.publicMethodFor({
        didDocument, purpose: 'keyAgreement'
      });
      const [expectedKaK] = EXPECTED_DID_DOC.keyAgreement;
      expect(keyAgreementData).to.eql(expectedKaK);

      const authKeyData = didWebDriver.publicMethodFor({
        didDocument, purpose: 'authentication'
      });
      const [expectedVerificationKey] = EXPECTED_DID_DOC.verificationMethod;
      expect(authKeyData).to.eql(expectedVerificationKey);
    });

    it('should throw error if key is not found for purpose', async () => {
      const did = TEST_DID;
      nock(host).get(path).reply(200, EXPECTED_DID_DOC);
      // First, get the did document
      const didDocument = await didWebDriver.get({did});

      let error;
      try {
        didWebDriver.publicMethodFor({
          didDocument, purpose: 'invalidPurpose'
        });
      } catch(e) {
        error = e;
      }

      expect(error).to.exist;
      expect(error.message).to
        .contain('No verification method found for purpose');
    });
  });

  describe('method', () => {
    it('should return did method id', async () => {
      expect(didWebDriver.method).to.equal('web');
    });
  });
});
