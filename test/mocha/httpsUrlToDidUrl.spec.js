/*!
 * Copyright (c) 2023-2024 Digital Bazaar, Inc. All rights reserved.
 */
import chai from 'chai';
chai.should();
const {expect} = chai;

import {httpsUrlToDidUrl} from '../../lib/index.js';

// tests for turning HTTPS (well-known DID web) urls into DID urls
describe('urlToDid', function() {
  it('should throw if url is missing', function() {
    let result;
    let error;
    try {
      result = httpsUrlToDidUrl();
    } catch(e) {
      error = e;
    }
    expect(result).to.not.exist;
    expect(error).to.exist;
    expect(error).to.be.an.instanceOf(TypeError);
    expect(error.message).to.include('"url" must be a string or a URL');
  });
  it('should throw if url protocol is not https', function() {
    let result;
    let error;
    try {
      result = httpsUrlToDidUrl('http://bar.com');
    } catch(e) {
      error = e;
    }
    expect(result).to.not.exist;
    expect(error).to.exist;
    expect(error).to.be.an.instanceOf(TypeError);
    expect(error.message).to.include(
      '"url" protocol must by "https:"; received "http:"');
  });
  it('should throw if url is an empty string', function() {
    let result;
    let error;
    try {
      result = httpsUrlToDidUrl('');
    } catch(e) {
      error = e;
    }
    expect(result).to.not.exist;
    expect(error).to.exist;
    expect(error).to.be.an.instanceOf(TypeError);
    expect(error.message).to.include('Invalid URL');
  });
  it('should throw if url is invalid', function() {
    let result;
    let error;
    try {
      result = httpsUrlToDidUrl('invalid');
    } catch(e) {
      error = e;
    }
    expect(result).to.not.exist;
    expect(error).to.exist;
    expect(error).to.be.an.instanceOf(TypeError);
    expect(error.message).to.include('Invalid URL');
  });
  it('should use host as did identifier', function() {
    let result;
    let error;
    try {
      result = httpsUrlToDidUrl('https://www.bar.org');
    } catch(e) {
      error = e;
    }
    expect(error).to.not.exist;
    expect(result).to.exist;
    expect(result).to.be.a.string;
    expect(result).to.equal('did:web:www.bar.org');
  });
  it('should encode host port', function() {
    let result;
    let error;
    try {
      result = httpsUrlToDidUrl('https://www.bar.org:46443');
    } catch(e) {
      error = e;
    }
    expect(error).to.not.exist;
    expect(result).to.exist;
    expect(result).to.be.a.string;
    expect(result).to.equal('did:web:www.bar.org%3A46443');
  });
  it('should ignore empty path on url', function() {
    let result;
    let error;
    try {
      result = httpsUrlToDidUrl('https://www.bar.org:46443/');
    } catch(e) {
      error = e;
    }
    expect(error).to.not.exist;
    expect(result).to.exist;
    expect(result).to.be.a.string;
    expect(result).to.equal('did:web:www.bar.org%3A46443');
  });
  it('should preserve url queries', function() {
    let result;
    let error;
    try {
      result = httpsUrlToDidUrl('https://www.bar.org:46443/?service=bar');
    } catch(e) {
      error = e;
    }
    expect(error).to.not.exist;
    expect(result).to.exist;
    expect(result).to.be.a.string;
    expect(result).to.equal('did:web:www.bar.org%3A46443?service=bar');
  });
  it('should preserve fragments', function() {
    let result;
    let error;
    try {
      result = httpsUrlToDidUrl('https://www.bar.org:46443/#someKey');
    } catch(e) {
      error = e;
    }
    expect(error).to.not.exist;
    expect(result).to.exist;
    expect(result).to.be.a.string;
    expect(result).to.equal('did:web:www.bar.org%3A46443#someKey');
  });
  it('should preserve url queries and fragments', function() {
    let result;
    let error;
    try {
      result = httpsUrlToDidUrl(
        'https://www.bar.org:46443/?service=bar#someKey');
    } catch(e) {
      error = e;
    }
    expect(error).to.not.exist;
    expect(result).to.exist;
    expect(result).to.be.a.string;
    expect(result).to.equal('did:web:www.bar.org%3A46443?service=bar#someKey');
  });
  it('should encode paths in did format', function() {
    let result;
    let error;
    try {
      result = httpsUrlToDidUrl(
        'https://www.bar.org:46443/foo?service=bar#someKey');
    } catch(e) {
      error = e;
    }
    expect(error).to.not.exist;
    expect(result).to.exist;
    expect(result).to.be.a.string;
    expect(result).to.equal(
      'did:web:www.bar.org%3A46443:foo?service=bar#someKey');
  });
  it('should URI encode paths in did', function() {
    let result;
    let error;
    try {
      result = httpsUrlToDidUrl(
        'https://www.bar.org:46443/foo+srv?service=bar#someKey');
    } catch(e) {
      error = e;
    }
    expect(error).to.not.exist;
    expect(result).to.exist;
    expect(result).to.be.a.string;
    expect(result).to.equal(
      'did:web:www.bar.org%3A46443:foo%2Bsrv?service=bar#someKey');
  });
  it('should drop "/.well-known/did.json" path', function() {
    let result;
    let error;
    try {
      result = httpsUrlToDidUrl(
        'https://www.bar.org:46443/.well-known/did.json');
    } catch(e) {
      error = e;
    }
    expect(error).to.not.exist;
    expect(result).to.exist;
    expect(result).to.be.a.string;
    expect(result).to.equal(
      'did:web:www.bar.org%3A46443');
  });
  it('should drop "/did.json" path', function() {
    let result;
    let error;
    try {
      result = httpsUrlToDidUrl(
        'https://www.bar.org:46443/foo/did.json');
    } catch(e) {
      error = e;
    }
    expect(error).to.not.exist;
    expect(result).to.exist;
    expect(result).to.be.a.string;
    expect(result).to.equal(
      'did:web:www.bar.org%3A46443:foo');
  });
});
