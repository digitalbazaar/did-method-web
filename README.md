# did:web method driver _(@digitalbazaar/did-method-web)_

[![Build status](https://github.com/digitalbazaar/did-method-web/actions/workflows/main.yml/badge.svg)](https://github.com/digitalbazaar/did-method-web/actions/workflows/main.yml)
[![Coverage status](https://img.shields.io/codecov/c/github/digitalbazaar/did-method-web)](https://codecov.io/gh/digitalbazaar/did-method-web)
[![NPM Version](https://img.shields.io/npm/v/@digitalbazaar/did-method-web)](https://www.npmjs.com/package/@digitalbazaar/did-method-web)

> A [DID](https://w3c.github.io/did-core) (Decentralized Identifier) method driver for the `did-io` library and for standalone use

## Table of Contents

- [Background](#background)
  * [Example DID Document](#example-did-document)
- [Security](#security)
- [Install](#install)
- [Usage](#usage)
- [Contribute](#contribute)
- [Commercial Support](#commercial-support)
- [License](#license)

## Background

See also (related specs):

* [Decentralized Identifiers (DIDs)](https://w3c.github.io/did-core)
* [Linked Data Cryptographic Suite Registry](https://w3c-ccg.github.io/ld-cryptosuite-registry/)
* [Linked Data Proofs](https://w3c-dvcg.github.io/ld-proofs/)

A `did:web` method driver for the [`did-io`](https://github.com/digitalbazaar/did-io)
client library and for standalone use.

`did:web` allows DIDs to bootstrap trust using a web domain's existing reputation.
`did:web` DIDs come in the following format:

```
did:web:<subdomain.domain%3Aport>:optional:path
```

The port must be percent encoded to avoid confusion with the did syntax use of `:`.

So, for example, the following DID would resolve to `w3c-ccg.github.io/user/alice/did.json`

```
did:web:w3c-ccg.github.io:user:alice
```

That DID would correspond to the following Document:

### Example DID Document

```json
{
  "@context": [
    "https://www.w3.org/ns/did/v1",
    "https://w3id.org/security/suites/ed25519-2020/v1",
    "https://w3id.org/security/suites/x25519-2020/v1"
  ],
  "id": "did:web:w3c-ccg.github.io:user:alice",
  "verificationMethod": [{
    "id": "did:web:w3c-ccg.github.io:user:alice#z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK",
    "type": "Ed25519VerificationKey2020",
    "controller": "did:web:w3c-ccg.github.io:user:alice",
    "publicKeyMultibase": "z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK"
  }],
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
  "keyAgreement": [{
    "id": "did:web:w3c-ccg.github.io:user:alice#z6LSj72tK8brWgZja8NLRwPigth2T9QRiG1uH9oKZuKjdh9p",
    "type": "X25519KeyAgreementKey2020",
    "controller": "did:web:w3c-ccg.github.io:user:alice",
    "publicKeyMultibase": "z6LSj72tK8brWgZja8NLRwPigth2T9QRiG1uH9oKZuKjdh9p"
  }]
}
```

## Security

`did:web` has security issues outlined in the [security section of the specification](https://w3c-ccg.github.io/did-method-web/#security-and-privacy-considerations).


>This DID method does not specify any authentication or authorization mechanism for writing to, removing or creating the DID Document, leaving it up to implementations to protect did:web documents as with any other web resource.

>It is up to implementer to secure their web environments according to industry best practices for updating or otherwise managing web content based on the specific needs of their threat environment.


## Install

Requires Node.js 18+

To install from `npm`:

```
npm install --save @digitalbazaar/did-method-web
```

To install locally (for development):

```
git clone https://github.com/digitalbazaar/did-method-web.git
cd did-method-web
npm install
```

## Usage

### `fromKeyPair()`

A new `did:web` DID Document can be generated from an existing key pair:

```js
import {driver} from '@digitalbazaar/did-method-web';
import {Ed25519VerificationKey2020} from
  '@digitalbazaar/ed25519-verification-key-2020';
import {X25519KeyAgreementKey2020} from
  '@digitalbazaar/x25519-key-agreement-key-2020';

// create a driver with the desired key support
const didWebDriver = driver();
didWebDriver.use({
  multibaseMultikeyHeader: 'z6Mk',
  fromMultibase: Ed25519VerificationKey2020.from
});
didWebDriver.use({
  multibaseMultikeyHeader: 'z6LS',
  fromMultibase: X25519KeyAgreementKey2020.from
});

/* similarly, ECDSA or BBS (Bls12381G2) can be used:
import * as Bls12381Multikey from '@digitalbazaar/bls12-381-multikey';
import * as EcdsaMultikey from '@digitalbazaar/ecdsa-multikey';

didWebDriver.use({
  multibaseMultikeyHeader: 'zDna',
  fromMultibase: EcdsaMultikey.from
});
didWebDriver.use({
  multibaseMultikeyHeader: 'zUC7',
  fromMultibase: Bls12381Multikey.from
});
*/

// generate did:web DID doc from an Ed25519 key pair and X25519 key pair
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
const {
  didDocument, keyPairs, methodFor
} = await didWebDriver.fromKeyPair({
  // the desired `did:web` DID URL
  url: 'did:web:w3c-ccg.github.io:user:alice',
  // either one or both of these key pairs must be provided
  verificationKeyPair: keyPairForVerification,
  keyAgreementKeyPair: keyPairForKeyAgreement
});

// print the DID Document above
console.log(JSON.stringify(didDocument, null, 2));

// keyPairs will be set like so ->
Map(2) {
  'did:web:w3c-ccg.github.io:user:alice#z6Mkpw72M9suPCBv48X2Xj4YKZJH9W7wzEK1aS6JioKSo89C' => Ed25519VerificationKey2020 {
    id: 'did:web:w3c-ccg.github.io:user:alice#z6Mkpw72M9suPCBv48X2Xj4YKZJH9W7wzEK1aS6JioKSo89C',
    controller: 'did:web:w3c-ccg.github.io:user:alice',
    type: 'Ed25519VerificationKey2020',
    publicKeyMultibase: 'z6Mkpw72M9suPCBv48X2Xj4YKZJH9W7wzEK1aS6JioKSo89C'
  },
  'did:web:w3c-ccg.github.io:user:alice#z6LSgxJr5q1pwHPbiK7u8Pw1GvnfMTZSMxkhaorQ1aJYWFz3' => X25519KeyAgreementKey2020 {
    id: 'did:web:w3c-ccg.github.io:user:alice#z6LSgxJr5q1pwHPbiK7u8Pw1GvnfMTZSMxkhaorQ1aJYWFz3',
    controller: 'did:web:w3c-ccg.github.io:user:alice',
    type: 'X25519KeyAgreementKey2020',
    publicKeyMultibase: 'z6LSgxJr5q1pwHPbiK7u8Pw1GvnfMTZSMxkhaorQ1aJYWFz3'
  }
}
```

`methodFor` is a convenience function that returns a public key pair
instance for a given purpose. For example, a verification key (containing a
`verifier()` function) is frequently useful for
[`jsonld-signatures`](https://github.com/digitalbazaar/jsonld-signatures) or
[`vc`](https://github.com/digitalbazaar/vc) operations. After generating
a new `did:web` DID, you can do:

```js
// for verifying Verifiable Credentials
const assertionKeyPair = methodFor({purpose: 'assertionMethod'});
// for verifying authorization Capabilities (zCaps)
const invocationKeyPair = methodFor({purpose: 'capabilityInvocation'});
// for encryption to a recipient using `@digitalbazaar/minimal-cipher`
const keyAgreementPair = methodFor({purpose: 'keyAgreement'});
```

Note that `methodFor` returns a key pair that contains a public key pair.
This makes it useful for _verifying_ and _encrypting_ operations.

### `get()`

#### Getting a full DID Document from a `did:web` DID

To get a DID Document for an existing `did:web` DID:

```js
const did = 'did:web:w3c-ccg.github.io:user:alice';
const didDocument = await didWebDriver.get({did});
```

(Results in the [example DID Doc](#example-did-document) above).
### Backwards Compatibility with legacy key expressions

A `did:web` driver can be configured to return whatever key expression is
desirable, including legacy key expressions. For example, you can create a
driver that will return an `Ed25519VerificationKey2018` formatted key when
an `ed25519` key is detected:

```js
import {
  Ed25519VerificationKey2018
} from '@digitalbazaar/ed25519-verification-key-2018';
import * as didWeb from '@digitalbazaar/did-method-web';

const didWebDriver2018 = didWeb.driver();
didWebDriver2018.use({
  multibaseMultikeyHeader: 'z6Mk',
  fromMultibase: Ed25519VerificationKey2018.from
});

const did = 'did:web:w3c-ccg.github.io:user:alice:2018';
await didWebDriver2018.get({url: did});
// ->
{
  '@context': [
    'https://www.w3.org/ns/did/v1',
    'https://w3id.org/security/suites/ed25519-2018/v1',
    'https://w3id.org/security/suites/x25519-2019/v1'
  ],
  id: 'did:web:w3c-ccg.github.io:user:alice:2018',
  verificationMethod: [{
    id: 'did:web:w3c-ccg.github.io:user:alice:2018#z6MkpTHR8VNsBxYAAWHut2Geadd9jSwuBV8xRoAnwWsdvktH',
    type: 'Ed25519VerificationKey2018',
    controller: 'did:web:w3c-ccg.github.io:user:alice:2018',
    publicKeyBase58: 'B12NYF8RrR3h41TDCTJojY59usg3mbtbjnFs7Eud1Y6u'
  }],
  // etc,
  keyAgreement: [{
    id: 'did:web:w3c-ccg.github.io:user:alice:2018#z6LSbysY2xFMRpGMhb7tFTLMpeuPRaqaWM1yECx2AtzE3KCc',
    type: 'X25519KeyAgreementKey2019',
    controller: 'did:web:w3c-ccg.github.io:user:alice:2018',
    publicKeyBase58: 'JhNWeSVLMYccCk7iopQW4guaSJTojqpMEELgSLhKwRr'
  }]
}
```

### Allow List

This driver allows you to restrict the domains it will generate and resolve for.
To do this pass the parameter `allowList` to either `DidWebDriver` or the `driver` function.

```js
import {DidWebDriver, driver} from '@digitalbazaar/did-method-web';

const allowList = ['safe-domain.org', 'localhost:46443'];
const restrictedDriver = new DidWebDriver({allowList});

// call `restrictedDriver.use()` with supported key types and then ...

// this will always fail
const failedGenerate = await restrictedDriver.get({
  url: 'did:web:unsafe-domain.net'
});
// this can succeed
const successfulGenerate = await restrictedDriver.get({
  url: 'did:web:safe-domain.org'
});
```

### fetchOptions

This library resolves HTTP requests using implementations of [`fetch`](https://fetch.spec.whatwg.org/).
The following apis will accept a `fetchOptions` parameter: `DidWebDriver`, `driver`, and `driver.get`.

```js
import {DidWebDriver, driver} from '@digitalbazaar/did-method-web';
// accept really large DID documents
const fetchOptions = {size: 81920000};
const driver = new driver({fetchOptions});
const fetchOptions2 = {redirect: 'follow'};
const did = 'did:web:safe-domain.org';
// this will spread `fetchOptions2` over `fetchOptions`
const didDocument = await driver.get({url: did, fetchOptions: fetchOptions2})
```

### Helper Functions

In addition to the `did:web` driver, this package also exports several helper
functions for working with `did:web` DIDs.

To convert a `did:web` URL to its corresponding HTTPS URL:

```js
import {didUrlToHttpsUrl} from '@digitalbazaar/did-method-web';
const didUrl = 'did:web:w3c-ccg.github.io:user:alice';
const httpsUrl = didUrlToHttpsUrl(did);
// https://w3c-ccg.github.io/user/alice/did.json
```
To convert an HTTPS URL to its corresponding `did:web` DID URL
```js
import {httpsUrlToDidUrl} from '@digitalbazaar/did-method-web';
const httpsUrl = 'https://w3c-ccg.github.io/user/alice/did.json'
const didUrl = httpsUrlToDidUrl(url);
// did:web:w3c-ccg.github.io:user:alice
```

## Contribute

See [the contribute file](https://github.com/digitalbazaar/bedrock/blob/master/CONTRIBUTING.md)!

PRs accepted.

If editing the Readme, please conform to the
[standard-readme](https://github.com/RichardLitt/standard-readme) specification.

## Commercial Support

Commercial support for this library is available upon request from
Digital Bazaar: support@digitalbazaar.com

## License

[New BSD License (3-clause)](LICENSE) © Digital Bazaar
