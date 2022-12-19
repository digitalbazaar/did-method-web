/*!
 * Copyright (c) 2023 Digital Bazaar, Inc. All rights reserved.
 */
import chai from 'chai';
import {driver} from '../../lib/index.js';
import {Ed25519VerificationKey2018} from
  '@digitalbazaar/ed25519-verification-key-2018';
import {stubRequest} from '../helpers.js';
// TODO
//import EXPECTED_DID_DOC from './expected-did-doc.json' assert {type: 'json'};
import {
  expectedDidDoc as EXPECTED_DID_DOC,
  expectedDidDoc2018
} from '../expected-data.js';
import {
  FILE_URL,
  TEST_DID,
  TEST_SEED,
  TEST_URL,
} from '../constants.js';

chai.should();
const {expect} = chai;
const didWebDriver = driver();

// tests for DidWebDriver
describe('did:web method driver', () => {
  describe('allowList', () => {
    describe('get', function() {
      it('should allow any domain if no allowList', async function() {
        const stub = stubRequest({url: FILE_URL, data: EXPECTED_DID_DOC});
        let error;
        let result;
        const testDriver = new driver({allowList: null});
        try {
          result = await testDriver.get({did: TEST_DID});
        } catch(e) {
          error = e;
        }
        expect(error).to.not.exist;
        expect(result).to.exist;
        stub.restore();
      });
      it('should not allow a domain not on allowList', async function() {
        let error;
        let result;
        const testDriver = new driver({allowList: ['not-test-url.net']});
        try {
          result = await testDriver.get({did: TEST_DID});
        } catch(e) {
          error = e;
        }
        expect(result).to.not.exist;
        expect(error).to.exist;
        expect(error).to.be.instanceOf(Error);
        expect(error.message).to.equal(
          'Domain "w3c-ccg.github.io" is not allowed.');
      });
      it('should not allow a domain with a different port', async function() {
        let error;
        let result;
        const testDriver = new driver({allowList: ['w3c-ccg.github.io:46443']});
        try {
          result = await testDriver.get({did: TEST_DID});
        } catch(e) {
          error = e;
        }
        expect(result).to.not.exist;
        expect(error).to.exist;
        expect(error).to.be.instanceOf(Error);
        expect(error.message).to.equal(
          'Domain "w3c-ccg.github.io" is not allowed.');
      });
      it('should allow a domain on allowList', async function() {
        const stub = stubRequest({url: FILE_URL, data: EXPECTED_DID_DOC});
        let error;
        let result;
        const testDriver = new driver({allowList: ['w3c-ccg.github.io']});
        try {
          result = await testDriver.get({did: TEST_DID});
        } catch(e) {
          error = e;
        }
        expect(error).to.not.exist;
        expect(result).to.exist;
        stub.restore();
      });
    });
    describe('generate', function() {
      it('should allow any domain if no allowList', async function() {
        let error;
        let result;
        const testDriver = new driver({allowList: null});
        try {
          result = await testDriver.generate({url: TEST_URL});
        } catch(e) {
          error = e;
        }
        expect(error).to.not.exist;
        expect(result).to.exist;
      });
      it('should not allow a domain not on allowList', async function() {
        let error;
        let result;
        const testDriver = new driver({allowList: ['not-test-url.net']});
        try {
          result = await testDriver.generate({url: TEST_URL});
        } catch(e) {
          error = e;
        }
        expect(result).to.not.exist;
        expect(error).to.exist;
        expect(error).to.be.instanceOf(Error);
        expect(error.message).to.equal(
          'Domain "w3c-ccg.github.io" is not allowed.');
      });
      it('should not allow a domain with a different port', async function() {
        let error;
        let result;
        const testDriver = new driver({allowList: ['w3c-ccg.github.io:46443']});
        try {
          result = await testDriver.generate({url: TEST_URL});
        } catch(e) {
          error = e;
        }
        expect(result).to.not.exist;
        expect(error).to.exist;
        expect(error).to.be.instanceOf(Error);
        expect(error.message).to.equal(
          'Domain "w3c-ccg.github.io" is not allowed.');
      });
      it('should allow a domain on allowList', async function() {
        let error;
        let result;
        const testDriver = new driver({allowList: ['w3c-ccg.github.io']});
        try {
          result = await testDriver.generate({url: TEST_URL});
        } catch(e) {
          error = e;
        }
        expect(error).to.not.exist;
        expect(result).to.exist;
      });
    });
  });
  describe('get', () => {
    it('should get the DID Document for a did:web DID', async () => {
      const stub = stubRequest({url: FILE_URL, data: EXPECTED_DID_DOC});
      const didDocument = await didWebDriver.get({did: TEST_DID});
      expect(didDocument).to.eql(EXPECTED_DID_DOC);
      stub.restore();
    });

    it('should get the DID Doc in 2018 mode', async () => {
      const stub = stubRequest({url: FILE_URL, data: expectedDidDoc2018});
      const didWebDriver2018 = driver({
        verificationSuite: Ed25519VerificationKey2018
      });
      const didDocument = await didWebDriver2018.get({did: TEST_DID});
      expect(didDocument).to.eql(expectedDidDoc2018);
      stub.restore();
    });

    it('should resolve an individual key within the DID Doc', async () => {
      const fragment = '#z6LSgxJr5q1pwHPbiK7u8Pw1GvnfMTZSMxkhaorQ1aJYWFz3';
      const keyId = TEST_DID + fragment;
      const stub = stubRequest({
        url: FILE_URL + fragment,
        data: EXPECTED_DID_DOC
      });
      const key = await didWebDriver.get({did: keyId});
      const [expectedKaK] = EXPECTED_DID_DOC.keyAgreement;
      expect(key).to.eql({
        '@context': 'https://w3id.org/security/suites/x25519-2020/v1',
        ...expectedKaK
      });
      stub.restore();
    });

    it('should resolve an individual key in 2018 mode', async () => {
      const [vm] = expectedDidDoc2018.verificationMethod;
      const fragment = vm.id.split('#');
      const stub = stubRequest({
        url: FILE_URL + '#' + fragment[1],
        data: expectedDidDoc2018
      });
      const didWebDriver2018 = driver({
        verificationSuite: Ed25519VerificationKey2018
      });
      const key = await didWebDriver2018.get({did: vm.id});
      expect(key).to.eql({
        ...vm,
        '@context': 'https://w3id.org/security/suites/ed25519-2018/v1',
      });
      stub.restore();
    });

    it('should resolve an individual key agreement key', async () => {
      const fragment = '#z6LSgxJr5q1pwHPbiK7u8Pw1GvnfMTZSMxkhaorQ1aJYWFz3';
      const stub = stubRequest({
        url: FILE_URL + fragment,
        data: EXPECTED_DID_DOC
      });
      const kakKeyId = `${TEST_DID}${fragment}`;
      const key = await didWebDriver.get({did: kakKeyId});
      const [expectedKak] = EXPECTED_DID_DOC.keyAgreement;
      expect(key).to.eql({
        '@context': 'https://w3id.org/security/suites/x25519-2020/v1',
        ...expectedKak
      });
      stub.restore();
    });

    it('should resolve an individual key agreement key (2018)', async () => {
      const [expectedKak] = expectedDidDoc2018.keyAgreement;
      const fragment = expectedKak.id.split('#');
      const stub = stubRequest({
        url: FILE_URL + '#' + fragment[1],
        data: expectedDidDoc2018
      });
      const didWebDriver2018 = driver({
        verificationSuite: Ed25519VerificationKey2018
      });
      const key = await didWebDriver2018.get({did: expectedKak.id});
      expect(key).to.eql({
        ...expectedKak,
        '@context': 'https://w3id.org/security/suites/x25519-2019/v1',
      });
      stub.restore();
    });
    describe('publicMethodFor', () => {
      it('should find a key for a did doc and purpose', async () => {
        const did = TEST_DID;
        const stub = stubRequest({url: FILE_URL, data: EXPECTED_DID_DOC});
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
        stub.restore();
      });

      it('should throw error if key is not found for purpose', async () => {
        const did = TEST_DID;
        const stub = stubRequest({url: FILE_URL, data: EXPECTED_DID_DOC});
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
        stub.restore();
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
      stubRequest({url: FILE_URL, data: didDocument});

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
  describe('method', () => {
    it('should return did method id', async () => {
      expect(didWebDriver.method).to.equal('web');
    });
  });
});