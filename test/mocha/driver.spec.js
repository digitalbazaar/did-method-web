/*!
 * Copyright (c) 2023-2024 Digital Bazaar, Inc. All rights reserved.
 */
import * as Bls12381Multikey from '@digitalbazaar/bls12-381-multikey';
import * as EcdsaMultikey from '@digitalbazaar/ecdsa-multikey';
import chai from 'chai';
import {driver} from '../../lib/index.js';
import {Ed25519VerificationKey2020} from
  '@digitalbazaar/ed25519-verification-key-2020';
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
  TEST_URL,
} from '../constants.js';
import {
  X25519KeyAgreementKey2020
} from '@digitalbazaar/x25519-key-agreement-key-2020';

chai.should();
const {expect} = chai;
const didWebDriver = driver();
didWebDriver.use({
  multibaseMultikeyHeader: 'z6Mk',
  fromMultibase: Ed25519VerificationKey2020.from
});

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
    describe('fromKeyPair', function() {
      let verificationKeyPair;
      before(async () => {
        const publicKeyMultibase =
          'zDnaeucDGfhXHoJVqot3p21RuupNJ2fZrs8Lb1GV83VnSo2jR';
        verificationKeyPair = await EcdsaMultikey.from({publicKeyMultibase});
      });
      it('should allow any domain if no allowList', async function() {
        let error;
        let result;
        const testDriver = new driver({allowList: null});
        testDriver.use({
          multibaseMultikeyHeader: 'zDna',
          fromMultibase: EcdsaMultikey.from
        });
        try {
          result = await testDriver.fromKeyPair({
            url: TEST_URL, verificationKeyPair
          });
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
        testDriver.use({
          multibaseMultikeyHeader: 'zDna',
          fromMultibase: EcdsaMultikey.from
        });
        try {
          result = await testDriver.fromKeyPair({
            url: TEST_URL, verificationKeyPair
          });
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
        testDriver.use({
          multibaseMultikeyHeader: 'zDna',
          fromMultibase: EcdsaMultikey.from
        });
        try {
          result = await testDriver.fromKeyPair({
            url: TEST_URL, verificationKeyPair
          });
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
        testDriver.use({
          multibaseMultikeyHeader: 'zDna',
          fromMultibase: EcdsaMultikey.from
        });
        try {
          result = await testDriver.fromKeyPair({
            url: TEST_URL, verificationKeyPair
          });
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

    it('should get the DID Doc w/ ed25519 2018 key', async () => {
      const stub = stubRequest({url: FILE_URL, data: expectedDidDoc2018});
      const didWebDriver2018 = driver();
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

    it('should resolve an ed25519 2018 key', async () => {
      const [vm] = expectedDidDoc2018.verificationMethod;
      const fragment = vm.id.split('#');
      const stub = stubRequest({
        url: FILE_URL + '#' + fragment[1],
        data: expectedDidDoc2018
      });
      const didWebDriver2018 = driver();
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
      const didWebDriver2018 = driver();
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

  describe('fromKeyPair', () => {
    it('should generate and get round trip', async () => {
      const {
        didDocument, keyPairs, methodFor
      } = await didWebDriver.fromKeyPair({url: TEST_URL});
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

    it('should generate DID document from ecdsa key', async () => {
      const publicKeyMultibase =
        'zDnaeucDGfhXHoJVqot3p21RuupNJ2fZrs8Lb1GV83VnSo2jR';
      const keyPair = await EcdsaMultikey.from({publicKeyMultibase});
      const didWebDriverMultikey = driver();
      didWebDriverMultikey.use({
        multibaseMultikeyHeader: 'zDna',
        fromMultibase: EcdsaMultikey.from
      });
      const {
        didDocument, keyPairs, methodFor
      } = await didWebDriverMultikey.fromKeyPair({
        verificationKeyPair: keyPair
      });
      const did = didDocument.id;
      const keyId = didDocument.authentication[0];

      const verificationKeyPair = methodFor({purpose: 'assertionMethod'});
      let err;
      let keyAgreementKeyPair;
      try {
        keyAgreementKeyPair = methodFor({purpose: 'keyAgreement'});
      } catch(e) {
        err = e;
      }
      expect(err).to.exist;
      expect(keyAgreementKeyPair).to.not.exist;

      expect(keyId).to.equal(verificationKeyPair.id);

      expect(keyPairs.get(keyId).controller).to.equal(did);
      expect(keyPairs.get(keyId).id).to.equal(keyId);
      stubRequest({url: FILE_URL, data: didDocument});

      const fetchedDidDoc = await didWebDriver.get({did});
      expect(fetchedDidDoc).to.eql(didDocument);
    });

    it('should generate DID document from BLS12-381 key', async () => {
      // eslint-disable-next-line max-len
      const publicKeyMultibase = 'zUC7GMwWWkA5UMTx7Gg6sabmpchWgq8p1xGhUXwBiDytY8BgD6eq5AmxNgjwDbAz8Rq6VFBLdNjvXR4ydEdwDEN9L4vGFfLkxs8UsU3wQj9HQGjQb7LHWdRNJv3J1kGoA3BvnBv';
      const keyPair = await Bls12381Multikey.from({publicKeyMultibase});
      const didWebDriverMultikey = driver();
      didWebDriverMultikey.use({
        multibaseMultikeyHeader: 'zUC7',
        fromMultibase: Bls12381Multikey.from
      });
      const {
        didDocument, keyPairs, methodFor
      } = await didWebDriverMultikey.fromKeyPair({
        verificationKeyPair: keyPair
      });
      const did = didDocument.id;
      const keyId = didDocument.authentication[0];
      const verificationKeyPair = methodFor({purpose: 'assertionMethod'});

      expect(keyId).to.equal(verificationKeyPair.id);

      expect(keyPairs.get(keyId).controller).to.equal(did);
      expect(keyPairs.get(keyId).id).to.equal(keyId);
      stubRequest({url: FILE_URL, data: didDocument});

      const fetchedDidDoc = await didWebDriver.get({did});
      expect(fetchedDidDoc).to.eql(didDocument);
    });

    it('should generate DID document from X25519 key', async () => {
      // eslint-disable-next-line max-len
      const publicKeyMultibase = 'z6LSbysY2xFMRpGMhb7tFTLMpeuPRaqaWM1yECx2AtzE3KCc';
      const keyPair = await Bls12381Multikey.from({publicKeyMultibase});
      const didWebDriverMultikey = driver();
      didWebDriverMultikey.use({
        multibaseMultikeyHeader: 'z6LS',
        fromMultibase: X25519KeyAgreementKey2020.from
      });
      const {
        didDocument, keyPairs, methodFor
      } = await didWebDriverMultikey.fromKeyPair({
        verificationKeyPair: keyPair
      });
      const did = didDocument.id;
      const keyId = didDocument.authentication[0];
      const verificationKeyPair = methodFor({purpose: 'keyAgreement'});

      expect(keyId).to.equal(verificationKeyPair.id);

      expect(keyPairs.get(keyId).controller).to.equal(did);
      expect(keyPairs.get(keyId).id).to.equal(keyId);
      stubRequest({url: FILE_URL, data: didDocument});

      const fetchedDidDoc = await didWebDriver.get({did});
      expect(fetchedDidDoc).to.eql(didDocument);
    });

    it('should generate DID document from Ed25519 verificationKeyPair and ' +
      'X25519 keyAgreementKeyPair', async () => {
      const publicKeyMultibaseForVerificationKeyPair =
        'z6MknCCLeeHBUaHu4aHSVLDCYQW9gjVJ7a63FpMvtuVMy53T';
      const keyPairForVerification = await Ed25519VerificationKey2020.from({
        publicKeyMultibase: publicKeyMultibaseForVerificationKeyPair
      });
      const publicKeyMultibaseForKeyAgreementKeyPair =
        'z6LSbysY2xFMRpGMhb7tFTLMpeuPRaqaWM1yECx2AtzE3KCc';
      const keyPairForKeyAgreement = await X25519KeyAgreementKey2020.from({
        publicKeyMultibase: publicKeyMultibaseForKeyAgreementKeyPair
      });
      const localDriver = driver();
      localDriver.use({
        multibaseMultikeyHeader: 'z6Mk',
        fromMultibase: Ed25519VerificationKey2020.from
      });
      localDriver.use({
        multibaseMultikeyHeader: 'z6LS',
        fromMultibase: X25519KeyAgreementKey2020.from
      });
      const {
        didDocument, keyPairs, methodFor
      } = await localDriver.fromKeyPair({
        verificationKeyPair: keyPairForVerification,
        keyAgreementKeyPair: keyPairForKeyAgreement
      });
      const did = didDocument.id;
      const keyId = `did:key:${publicKeyMultibaseForVerificationKeyPair}` +
        `#${publicKeyMultibaseForVerificationKeyPair}`;
      const keyAgreementId =
        `did:key:${publicKeyMultibaseForKeyAgreementKeyPair}` +
        `#${publicKeyMultibaseForKeyAgreementKeyPair}`;
      expect(didDocument['@context']).to.eql([
        'https://www.w3.org/ns/did/v1',
        'https://w3id.org/security/suites/ed25519-2020/v1',
        'https://w3id.org/security/suites/x25519-2020/v1'
      ]);
      expect(didDocument.authentication).to.eql([keyId]);
      expect(didDocument.assertionMethod).to.eql([keyId]);
      expect(didDocument.capabilityDelegation).to.eql([keyId]);
      expect(didDocument.capabilityInvocation).to.eql([keyId]);

      const [publicKey] = didDocument.verificationMethod;
      expect(publicKey.id).to.equal(keyId);
      expect(publicKey.type).to.equal('Ed25519VerificationKey2020');
      expect(publicKey.controller).to.equal(did);
      expect(publicKey.publicKeyMultibase).to
        .equal(publicKeyMultibaseForVerificationKeyPair);

      const [kak] = didDocument.keyAgreement;
      const kakDid = `did:key:${publicKeyMultibaseForKeyAgreementKeyPair}`;

      expect(kak.id).to.equal(keyAgreementId);
      expect(kak.type).to.equal('X25519KeyAgreementKey2020');
      expect(kak.controller).to.equal(kakDid);
      expect(kak.publicKeyMultibase).to
        .equal(publicKeyMultibaseForKeyAgreementKeyPair);

      const verificationKeyPair = methodFor({purpose: 'assertionMethod'});
      let err;
      let keyAgreementKeyPair;
      try {
        keyAgreementKeyPair = methodFor({purpose: 'keyAgreement'});
      } catch(e) {
        err = e;
      }
      expect(err).to.not.exist;
      expect(keyAgreementKeyPair).to.exist;
      expect(verificationKeyPair).to.exist;

      expect(verificationKeyPair.id).to.equal(keyId);
      expect(keyAgreementKeyPair.id).to.equal(keyAgreementId);
      expect(keyPairs.get(keyId).controller).to.equal(did);
      expect(keyPairs.get(keyAgreementId).controller).to.equal(kakDid);
    });
  });
  describe('method', () => {
    it('should return did method id', async () => {
      expect(didWebDriver.method).to.equal('web');
    });
  });
});
