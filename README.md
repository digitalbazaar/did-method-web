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
    "id": "did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK#z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK",
    "type": "Ed25519VerificationKey2020",
    "controller": "did:web:w3c-ccg.github.io:user:alice",
    "publicKeyMultibase": "z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK"
  }],
  "authentication": [
    "did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK#z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK"
  ],
  "assertionMethod": [
    "did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK#z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK"
  ],
  "capabilityDelegation": [
    "did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK#z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK"
  ],
  "capabilityInvocation": [
    "did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK#z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK"
  ],
  "keyAgreement": [{
    "id": "did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK#z6LSj72tK8brWgZja8NLRwPigth2T9QRiG1uH9oKZuKjdh9p",
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
