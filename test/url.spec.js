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
  });

});
