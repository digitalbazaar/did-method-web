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
import {expectedDidDoc as EXPECTED_DID_DOC} from './expected-data.js';

describe('did:web method driver', () => {
  describe('get', () => {
    it('should get the DID Document for a did:web DID', async () => {
      nock(host).get(path).reply(200, EXPECTED_DID_DOC);
      const didDocument = await didWebDriver.get({did: TEST_DID});
      expect(didDocument).to.eql(EXPECTED_DID_DOC);
    });

    it('should get the DID Doc in 2018 mode', async () => {
      nock(host).get(path).reply(200, EXPECTED_DID_DOC);
      const didWebDriver2018 = driver({
        verificationSuite: Ed25519VerificationKey2018
      });
      const didDocument = await didWebDriver2018.get({did: TEST_DID});

      const expectedDidDoc = {
        '@context': [
          'https://www.w3.org/ns/did/v1',
          'https://w3id.org/security/suites/ed25519-2018/v1',
          'https://w3id.org/security/suites/x25519-2019/v1'
        ],
        id: TEST_DID,
        verificationMethod: [
          {
            id: TEST_DID +
              '#z6MkpTHR8VNsBxYAAWHut2Geadd9jSwuBV8xRoAnwWsdvktH',
            type: 'Ed25519VerificationKey2018',
            controller: TEST_DID,
            publicKeyBase58: 'B12NYF8RrR3h41TDCTJojY59usg3mbtbjnFs7Eud1Y6u'
          }
        ],
        authentication: [
          TEST_DID +
          '#z6MkpTHR8VNsBxYAAWHut2Geadd9jSwuBV8xRoAnwWsdvktH'
        ],
        assertionMethod: [
          TEST_DID +
            '#z6MkpTHR8VNsBxYAAWHut2Geadd9jSwuBV8xRoAnwWsdvktH'
        ],
        capabilityDelegation: [
          TEST_DID +
            '#z6MkpTHR8VNsBxYAAWHut2Geadd9jSwuBV8xRoAnwWsdvktH'
        ],
        capabilityInvocation: [
          TEST_DID +
            '#z6MkpTHR8VNsBxYAAWHut2Geadd9jSwuBV8xRoAnwWsdvktH'
        ],
        keyAgreement: [
          {
            id: TEST_DID +
              '#z6LSbysY2xFMRpGMhb7tFTLMpeuPRaqaWM1yECx2AtzE3KCc',
            type: 'X25519KeyAgreementKey2019',
            controller: TEST_DID,
            publicKeyBase58: 'JhNWeSVLMYccCk7iopQW4guaSJTojqpMEELgSLhKwRr'
          }
        ]
      };

      expect(didDocument).to.eql(expectedDidDoc);
    });

    it('should resolve an individual key within the DID Doc', async () => {
      const keyId = TEST_DID +
        '#z6MknCCLeeHBUaHu4aHSVLDCYQW9gjVJ7a63FpMvtuVMy53T';
      nock(host).get(path).reply(200, EXPECTED_DID_DOC);
      const key = await didWebDriver.get({did: keyId});

      expect(key).to.eql({
        '@context': 'https://w3id.org/security/suites/ed25519-2020/v1',
        id: 'did:web:z6MknCCLeeHBUaHu4aHSVLDCYQW9gjVJ7a63FpMvtuVMy53T' +
          '#z6MknCCLeeHBUaHu4aHSVLDCYQW9gjVJ7a63FpMvtuVMy53T',
        type: 'Ed25519VerificationKey2020',
        controller: 'did:web:z6MknCCLeeHBUaHu4aHSVLDCYQW9gjVJ7a63FpMvtuVMy53T',
        publicKeyMultibase: 'z6MknCCLeeHBUaHu4aHSVLDCYQW9gjVJ7a63FpMvtuVMy53T'
      });
    });

    it('should resolve an individual key in 2018 mode', async () => {
      nock(host).get(path).reply(200, EXPECTED_DID_DOC);
      const didWebDriver2018 = driver({
        verificationSuite: Ed25519VerificationKey2018
      });
      const keyId =
        `${TEST_DID}#z6MkpTHR8VNsBxYAAWHut2Geadd9jSwuBV8xRoAnwWsdvktH`;
      const key = await didWebDriver2018.get({did: keyId});

      expect(key).to.eql({
        '@context': 'https://w3id.org/security/suites/ed25519-2018/v1',
        id: 'did:web:z6MkpTHR8VNsBxYAAWHut2Geadd9jSwuBV8xRoAnwWsdvktH' +
          '#z6MkpTHR8VNsBxYAAWHut2Geadd9jSwuBV8xRoAnwWsdvktH',
        type: 'Ed25519VerificationKey2018',
        controller: 'did:web:z6MkpTHR8VNsBxYAAWHut2Geadd9jSwuBV8xRoAnwWsdvktH',
        publicKeyBase58: 'B12NYF8RrR3h41TDCTJojY59usg3mbtbjnFs7Eud1Y6u'
      });
    });

    it('should resolve an individual key agreement key', async () => {
      nock(host).get(path).reply(200, EXPECTED_DID_DOC);
      const kakKeyId =
        `${TEST_DID}#z6LSotGbgPCJD2Y6TSvvgxERLTfVZxCh9KSrez3WNrNp7vKW`;
      const key = await didWebDriver.get({did: kakKeyId});

      expect(key).to.eql({
        '@context': 'https://w3id.org/security/suites/x25519-2020/v1',
        id: 'did:web:z6MknCCLeeHBUaHu4aHSVLDCYQW9gjVJ7a63FpMvtuVMy53T' +
          '#z6LSotGbgPCJD2Y6TSvvgxERLTfVZxCh9KSrez3WNrNp7vKW',
        type: 'X25519KeyAgreementKey2020',
        controller: 'did:web:z6MknCCLeeHBUaHu4aHSVLDCYQW9gjVJ7a63FpMvtuVMy53T',
        publicKeyMultibase: 'z6LSotGbgPCJD2Y6TSvvgxERLTfVZxCh9KSrez3WNrNp7vKW'
      });
    });

    it('should resolve an individual key agreement key (2018)', async () => {
      nock(host).get(path).reply(200, EXPECTED_DID_DOC);
      const didWebDriver2018 = driver({
        verificationSuite: Ed25519VerificationKey2018
      });
      const kakKeyId =
        `${TEST_DID}#z6LSbysY2xFMRpGMhb7tFTLMpeuPRaqaWM1yECx2AtzE3KCc`;
      const key = await didWebDriver2018.get({did: kakKeyId});

      expect(key).to.eql({
        '@context': 'https://w3id.org/security/suites/x25519-2019/v1',
        id: 'did:web:z6MkpTHR8VNsBxYAAWHut2Geadd9jSwuBV8xRoAnwWsdvktH' +
          '#z6LSbysY2xFMRpGMhb7tFTLMpeuPRaqaWM1yECx2AtzE3KCc',
        type: 'X25519KeyAgreementKey2019',
        controller: 'did:web:z6MkpTHR8VNsBxYAAWHut2Geadd9jSwuBV8xRoAnwWsdvktH',
        publicKeyBase58: 'JhNWeSVLMYccCk7iopQW4guaSJTojqpMEELgSLhKwRr'
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
