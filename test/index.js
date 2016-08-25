'use strict';

const _ = require('lodash');
const expect = require('chai').expect;
const rewire = require('rewire');

const Mandrill = rewire('../lib/mandrill.js');

describe('Unit Testing ->', () => {
  describe('Mandrill ->', () => {
    it('should be an function', () => {
      expect(Mandrill).to.be.an('function');
    });
    it('should throw error when no API key in argument or in env', (done) => {
      delete process.env.MANDRILL_API_KEY;
      try {
        const email = new Mandrill();
        done('Not supposed to happend');
      }
      catch(ex) {
        expect(ex).to.exist.and.be.an.instanceof(Mandrill.Error).and.have.property('message', 'Mandrill API Key is missing');
        done();
      }
    });
    it('should not throw error when API key in argument', () => {
      delete process.env.MANDRILL_API_KEY;
      const email = new Mandrill({ MANDRILL_API_KEY: 'MANDRILL_API_KEY' });
    });
    it('should not throw error when API key in env', () => {
      process.env.MANDRILL_API_KEY = 'MANDRILL_API_KEY';
      const email = new Mandrill();
    });
  });
});
