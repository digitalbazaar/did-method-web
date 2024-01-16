/*!
 * Copyright (c) 2023-2024 Digital Bazaar, Inc. All rights reserved.
 */
/* eslint-disable */
export const expectedDidDoc = {
  "@context": [
    "https://www.w3.org/ns/did/v1",
    "https://w3id.org/security/suites/ed25519-2020/v1",
    "https://w3id.org/security/suites/x25519-2020/v1"
  ],
  "id": "did:web:w3c-ccg.github.io:user:alice",
  "verificationMethod": [
    {
      "id": "did:web:w3c-ccg.github.io:user:alice#z6Mkpw72M9suPCBv48X2Xj4YKZJH9W7wzEK1aS6JioKSo89C",
      "type": "Ed25519VerificationKey2020",
      "controller": "did:web:w3c-ccg.github.io:user:alice",
      "publicKeyMultibase": "z6Mkpw72M9suPCBv48X2Xj4YKZJH9W7wzEK1aS6JioKSo89C"
    }
  ],
  "authentication": [
    "did:web:w3c-ccg.github.io:user:alice#z6Mkpw72M9suPCBv48X2Xj4YKZJH9W7wzEK1aS6JioKSo89C"
  ],
  "assertionMethod": [
    "did:web:w3c-ccg.github.io:user:alice#z6Mkpw72M9suPCBv48X2Xj4YKZJH9W7wzEK1aS6JioKSo89C"
  ],
  "capabilityDelegation": [
    "did:web:w3c-ccg.github.io:user:alice#z6Mkpw72M9suPCBv48X2Xj4YKZJH9W7wzEK1aS6JioKSo89C"
  ],
  "capabilityInvocation": [
    "did:web:w3c-ccg.github.io:user:alice#z6Mkpw72M9suPCBv48X2Xj4YKZJH9W7wzEK1aS6JioKSo89C"
  ],
  "keyAgreement": [
    {
      "id": "did:web:w3c-ccg.github.io:user:alice#z6LSgxJr5q1pwHPbiK7u8Pw1GvnfMTZSMxkhaorQ1aJYWFz3",
      "type": "X25519KeyAgreementKey2020",
      "controller": "did:web:w3c-ccg.github.io:user:alice",
      "publicKeyMultibase": "z6LSgxJr5q1pwHPbiK7u8Pw1GvnfMTZSMxkhaorQ1aJYWFz3"
    }
  ]
};

export const expectedDidDoc2018 = {
  '@context': [
    'https://www.w3.org/ns/did/v1',
    'https://w3id.org/security/suites/ed25519-2018/v1',
    'https://w3id.org/security/suites/x25519-2019/v1'
  ],
  id: 'did:web:w3c-ccg.github.io:user:alice',
  verificationMethod: [
    {
      id: 'did:web:w3c-ccg.github.io:user:alice' +
        '#z6MkpTHR8VNsBxYAAWHut2Geadd9jSwuBV8xRoAnwWsdvktH',
      type: 'Ed25519VerificationKey2018',
      controller: 'did:web:w3c-ccg.github.io:user:alice',
      publicKeyBase58: 'B12NYF8RrR3h41TDCTJojY59usg3mbtbjnFs7Eud1Y6u'
    }
  ],
  authentication: [
    'did:web:w3c-ccg.github.io:user:alice' +
    '#z6MkpTHR8VNsBxYAAWHut2Geadd9jSwuBV8xRoAnwWsdvktH'
  ],
  assertionMethod: [
    'did:web:w3c-ccg.github.io:user:alice' +
      '#z6MkpTHR8VNsBxYAAWHut2Geadd9jSwuBV8xRoAnwWsdvktH'
  ],
  capabilityDelegation: [
    'did:web:w3c-ccg.github.io:user:alice' +
      '#z6MkpTHR8VNsBxYAAWHut2Geadd9jSwuBV8xRoAnwWsdvktH'
  ],
  capabilityInvocation: [
    'did:web:w3c-ccg.github.io:user:alice' +
      '#z6MkpTHR8VNsBxYAAWHut2Geadd9jSwuBV8xRoAnwWsdvktH'
  ],
  keyAgreement: [
    {
      id: 'did:web:w3c-ccg.github.io:user:alice' +
          '#z6LSbysY2xFMRpGMhb7tFTLMpeuPRaqaWM1yECx2AtzE3KCc',
      type: 'X25519KeyAgreementKey2019',
      controller: 'did:web:w3c-ccg.github.io:user:alice',
      publicKeyBase58: 'JhNWeSVLMYccCk7iopQW4guaSJTojqpMEELgSLhKwRr'
    }
  ]
};
/* eslint-enable */
