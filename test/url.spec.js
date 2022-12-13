/*!
 * Copyright (c) 2019-2022 Digital Bazaar, Inc. All rights reserved.
 */
import chai from 'chai';
chai.should();
const {expect} = chai;

import {urlToDid} from '../lib/index.js';

describe('urlToDid', function() {
  it('should throw if url is missing', function() {
    let result;
    let error;
    try {
      result = urlToDid();
    } catch(e) {
      error = e;
    }
    expect(result).to.not.exist;
    expect(error).to.exist;
    expect(error).to.be.an.instanceOf(TypeError);
    expect(error.message).to.include('"url" must be a string or a url');
  });
  it('should throw if url protocol is not https', function() {
    let result;
    let error;
    try {
      result = urlToDid('http://bar.com');
    } catch(e) {
      error = e;
    }
    expect(result).to.not.exist;
    expect(error).to.exist;
    expect(error).to.be.an.instanceOf(TypeError);
    expect(error.message).to.include(
      '"url" protocol must by "https:" received http:');
  });
  it('should throw if url is an empty string', function() {
    let result;
    let error;
    try {
      result = urlToDid('');
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
      result = urlToDid('invalid');
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
      result = urlToDid('https://www.bar.org');
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
      result = urlToDid('https://www.bar.org:46443');
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
      result = urlToDid('https://www.bar.org:46443/');
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
      result = urlToDid('https://www.bar.org:46443/?service=bar');
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
      result = urlToDid('https://www.bar.org:46443/#someKey');
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
      result = urlToDid('https://www.bar.org:46443/?service=bar#someKey');
    } catch(e) {
      error = e;
    }
    expect(error).to.not.exist;
    expect(result).to.exist;
    expect(result).to.be.a.string;
    expect(result).to.equal('did:web:www.bar.org%3A46443?service=bar#someKey');
  });
});
