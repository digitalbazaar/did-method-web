/*!
 * Copyright (c) 2023-2024 Digital Bazaar, Inc. All rights reserved.
 */
import chai from 'chai';
chai.should();
const {expect} = chai;

import {didUrlToHttpsUrl} from '../../lib/index.js';

// tests for turning `did:web` DID URLs into HTTPS (well-known DID web) URLs
describe('didUrlToHttpsUrl', function() {
  it('should throw if did is missing', function() {
    let result;
    let error;
    try {
      result = didUrlToHttpsUrl();
    } catch(e) {
      error = e;
    }
    expect(result).to.not.exist;
    expect(error).to.exist;
    expect(error).to.be.an.instanceOf(TypeError);
  });
  it('should throw if scheme is not "did"', function() {
    let result;
    let error;
    try {
      result = didUrlToHttpsUrl('urn:web:bar.com');
    } catch(e) {
      error = e;
    }
    expect(result).to.not.exist;
    expect(error).to.exist;
    expect(error).to.be.an.instanceOf(Error);
    expect(error.message).to.include('Scheme must be "did"; received "urn"');
  });
  it('should throw if did method is not "web"', function() {
    let result;
    let error;
    try {
      result = didUrlToHttpsUrl('did:key:bar.com');
    } catch(e) {
      error = e;
    }
    expect(result).to.not.exist;
    expect(error).to.exist;
    expect(error).to.be.an.instanceOf(Error);
    expect(error.message).to.include(
      'Did method must be "web"; received "key"');
  });
  it('should throw if did contains an unescaped "/"', function() {
    let result;
    let error;
    try {
      result = didUrlToHttpsUrl('did:web:bar.com/path/');
    } catch(e) {
      error = e;
    }
    expect(result).to.not.exist;
    expect(error).to.exist;
    expect(error).to.be.an.instanceOf(Error);
    expect(error.message).to.include(
      'Expected domain to not contain a path; received "bar.com/path/"');
  });
  it('should add path ".well-known/did.json" if no paths on did', function() {
    let result;
    let error;
    try {
      result = didUrlToHttpsUrl('did:web:bar.com');
    } catch(e) {
      error = e;
    }
    expect(error).to.not.exist;
    expect(result).to.exist;
    expect(result).to.be.an('object');
    expect(result.origin).to.equal('https://bar.com');
    expect(result.baseUrl).to.equal('https://bar.com/.well-known/did.json');
    expect(result.fullUrl).to.equal('https://bar.com/.well-known/did.json');
  });
  it('should add path "/did.json" if paths on did', function() {
    let result;
    let error;
    try {
      result = didUrlToHttpsUrl('did:web:bar.com:path');
    } catch(e) {
      error = e;
    }
    expect(error).to.not.exist;
    expect(result).to.exist;
    expect(result).to.be.an('object');
    expect(result.origin).to.equal('https://bar.com');
    expect(result.baseUrl).to.equal('https://bar.com/path/did.json');
    expect(result.fullUrl).to.equal('https://bar.com/path/did.json');
  });
  it('should decode port if included in did', function() {
    let result;
    let error;
    try {
      result = didUrlToHttpsUrl('did:web:bar.com%3A46443:path');
    } catch(e) {
      error = e;
    }
    expect(error).to.not.exist;
    expect(result).to.exist;
    expect(result).to.be.an('object');
    expect(result.origin).to.equal('https://bar.com:46443');
    expect(result.baseUrl).to.equal('https://bar.com:46443/path/did.json');
    expect(result.fullUrl).to.equal('https://bar.com:46443/path/did.json');
  });
  it('should include fragments from the did', function() {
    let result;
    let error;
    try {
      result = didUrlToHttpsUrl('did:web:bar.com%3A46443:path#zFoo');
    } catch(e) {
      error = e;
    }
    expect(error).to.not.exist;
    expect(result).to.exist;
    expect(result).to.be.an('object');
    expect(result.origin).to.equal('https://bar.com:46443');
    expect(result.baseUrl).to.equal('https://bar.com:46443/path/did.json');
    expect(result.urlWithoutFragment).to.equal(
      'https://bar.com:46443/path/did.json');
    expect(result.fullUrl).to.equal('https://bar.com:46443/path/did.json#zFoo');
  });
  it('should include queries from the did', function() {
    let result;
    let error;
    try {
      result = didUrlToHttpsUrl('did:web:bar.com%3A46443:path?service=bar');
    } catch(e) {
      error = e;
    }
    expect(error).to.not.exist;
    expect(result).to.exist;
    expect(result).to.be.an('object');
    expect(result.origin).to.equal('https://bar.com:46443');
    expect(result.baseUrl).to.equal('https://bar.com:46443/path/did.json');
    expect(result.fullUrl).to.equal(
      'https://bar.com:46443/path/did.json?service=bar');
  });
  it('should include queries & fragments from the did', function() {
    let result;
    let error;
    try {
      result = didUrlToHttpsUrl(
        'did:web:bar.com%3A46443:path?service=bar#zFoo');
    } catch(e) {
      error = e;
    }
    expect(error).to.not.exist;
    expect(result).to.exist;
    expect(result).to.be.an('object');
    expect(result.origin).to.equal('https://bar.com:46443');
    expect(result.baseUrl).to.equal('https://bar.com:46443/path/did.json');
    expect(result.urlWithoutFragment).to.equal(
      'https://bar.com:46443/path/did.json?service=bar');
    expect(result.fullUrl).to.equal(
      'https://bar.com:46443/path/did.json?service=bar#zFoo');
  });
});
