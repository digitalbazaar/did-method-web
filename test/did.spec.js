
/*!
 * Copyright (c) 2019-2022 Digital Bazaar, Inc. All rights reserved.
 */
import chai from 'chai';
chai.should();
const {expect} = chai;

import {didToUrl} from '../lib/index.js';

describe('didToUrl', function() {
  it('should throw if did is missing', function() {
    let result;
    let error;
    try {
      result = didToUrl();
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
      result = didToUrl('urn:web:bar.com');
    } catch(e) {
      error = e;
    }
    expect(result).to.not.exist;
    expect(error).to.exist;
    expect(error).to.be.an.instanceOf(Error);
  });
  it('should throw if did method is not "web"', function() {
    let result;
    let error;
    try {
      result = didToUrl('did:key:bar.com');
    } catch(e) {
      error = e;
    }
    expect(result).to.not.exist;
    expect(error).to.exist;
    expect(error).to.be.an.instanceOf(Error);
  });
});
