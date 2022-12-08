/*!
 * Copyright (c) 2021-2022 Digital Bazaar, Inc. All rights reserved.
 */

import {
  Ed25519VerificationKey2020
} from '@digitalbazaar/ed25519-verification-key-2020';
import {
  X25519KeyAgreementKey2019
} from '@digitalbazaar/x25519-key-agreement-key-2019';
import {
  X25519KeyAgreementKey2020
} from '@digitalbazaar/x25519-key-agreement-key-2020';

export const DID_CONTEXT_URL = 'https://www.w3.org/ns/did/v1';
// For backwards compat only, not actually importing this suite
export const ED25519_KEY_2018_CONTEXT_URL =
  'https://w3id.org/security/suites/ed25519-2018/v1';

export const contextsBySuite = new Map([
  [Ed25519VerificationKey2020.suite, Ed25519VerificationKey2020.SUITE_CONTEXT],
  ['Ed25519VerificationKey2018', ED25519_KEY_2018_CONTEXT_URL],
  [X25519KeyAgreementKey2020.suite, X25519KeyAgreementKey2020.SUITE_CONTEXT],
  [X25519KeyAgreementKey2019.suite, X25519KeyAgreementKey2019.SUITE_CONTEXT]
]);

export const defaultFetchOptions = {
  // size in bytes for did documents
  size: 8192,
  // request time out in ms
  timeout: 5000
};

export const didPrefix = 'did:web:';
