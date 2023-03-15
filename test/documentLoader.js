/*!
 * Copyright (c) 2022-2023 Digital Bazaar, Inc. All rights reserved.
 */
import {CONTEXT, CONTEXT_URL} from 'ed25519-signature-2020-context';
import {defaultDocumentLoader} from '@digitalbazaar/vc';
import {expectedDidDoc} from './expected-data.js';
import pkg from 'jsonld-signatures';

const {extendContextLoader} = pkg;

export const documentLoader = extendContextLoader(async url => {
  if(url === expectedDidDoc.id) {
    return {
      contextUrl: null,
      documentUrl: url,
      document: expectedDidDoc
    };
  }
  const [verificationMethod] = expectedDidDoc.verificationMethod;
  if(url === verificationMethod.id) {
    return {
      contextUrl: null,
      documentUrl: url,
      document: {
        '@context': 'https://w3id.org/security/suites/ed25519-2020/v1',
        ...verificationMethod
      }
    };
  }
  if(url === CONTEXT_URL) {
    return {
      contextUrl: null,
      documentUrl: url,
      document: CONTEXT
    };
  }
  return defaultDocumentLoader(url);
});
