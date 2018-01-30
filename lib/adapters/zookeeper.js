'use strict';

const consul = require('consul')();

const Adapter = require('./adapter');

module.exports = class Consul extends Adapter {
  constructor() {
    super();
    console.log('construct!');
  }

};