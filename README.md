# did:web method driver _(@digitalbazaar/did-method-web)_

[![Node.js CI](https://github.com/digitalbazaar/did-method-web/workflows/Node.js%20CI/badge.svg)](https://github.com/digitalbazaar/did-method-web/actions?query=workflow%3A%22Node.js+CI%22)
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

`did:web` allows dids to bootstrap trust using a web domain's existing reputation.
`did:web` dids come in the following format:

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

## Install

Requires Node.js 14+

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

### `generate()`

To generate a new key and get its corresponding `did:web` method DID Document:

```js
import {driver} from '@digitalbazaar/did-method-web';
const didWebDriver = driver();

// generate did:web using Ed25519 key type by default
const {didDocument, keyPairs, methodFor} = await didWebDriver.generate({
  url: 'did:web:w3c-ccg.github.io:user:alice'
});

// print the DID Document above
console.log(JSON.stringify(didDocument, null, 2));

// keyPairs will be set like so ->
Map(2) {
  'did:web:w3c-ccg.github.io:user:alice#z6MkuBLrjSGt1PPADAvuv6rmvj4FfSAfffJotC6K8ZEorYmv' => Ed25519VerificationKey2020 {
    id: 'did:web:w3c-ccg.github.io:user:alice#z6MkuBLrjSGt1PPADAvuv6rmvj4FfSAfffJotC6K8ZEorYmv',
    controller: 'did:web:w3c-ccg.github.io:user:alice',
    type: 'Ed25519VerificationKey2020',
    publicKeyMultibase: 'z6MkuBLrjSGt1PPADAvuv6rmvj4FfSAfffJotC6K8ZEorYmv',
    privateKeyMultibase: 'z3zDo1wXuXGcFkJa9SPE7VYpdutmHq8gJsvFRMKJckTWMykoHsAjWNbHXqzrZ8qa7aWdDTjmJNJ1amYEG2mCvZZeY'
  },
  'did:web:w3c-ccg.github.io:user:alice#z6LSeRSE5Em5oJpwdk3NBaLVERBS332ULC7EQq5EtMsmXhsM' => X25519KeyAgreementKey2020 {
    id: 'did:web:w3c-ccg.github.io:user:alice#z6LSeRSE5Em5oJpwdk3NBaLVERBS332ULC7EQq5EtMsmXhsM',
    controller: 'did:web:w3c-ccg.github.io:user:alice',
    type: 'X25519KeyAgreementKey2020',
    publicKeyMultibase: 'z6LSeRSE5Em5oJpwdk3NBaLVERBS332ULC7EQq5EtMsmXhsM',
    privateKeyMultibase: 'z3weeMD56C1T347EmB6kYNS7trpQwjvtQCpCYRpqGz6mcemT'
  }
}
```

`methodFor` is a convenience function that returns a public/private key pair
instance for a given purpose. For example, a verification key (containing a
`signer()` and `verifier()` functions) are frequently useful for
[`jsonld-signatures`](https://github.com/digitalbazaar/jsonld-signatures) or
[`vc-js`](https://github.com/digitalbazaar/vc-js) operations. After generating
a new did:web DID, you can do:

```js
// For signing Verifiable Credentials
const assertionKeyPair = methodFor({purpose: 'assertionMethod'});
// For Authorization Capabilities (zCaps)
const invocationKeyPair = methodFor({purpose: 'capabilityInvocation'});
// For Encryption using `@digitalbazaar/minimal-cipher`
const keyAgreementPair = methodFor({purpose: 'keyAgreement'});
```

Note that `methodFor` returns a key pair that contains both a public and private
key pair (since it has access to the `keyPairs` map from `generate()`).
This makes it useful for _signing_ and _encrypting_ operations (unlike the
`publicMethodFor` that's returned by `get()`, below).

### `get()`

#### Getting a full DID Document from a `did:web` DID

To get a DID Document for an existing `did:web` DID:

```js
const did = 'did:web:w3c-ccg.github.io:user:alice';
const didDocument = await didWebDriver.get({did});
```

(Results in the [example DID Doc](#example-did-document) above).

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
