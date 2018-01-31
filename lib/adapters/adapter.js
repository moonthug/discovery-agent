'use strict';

const ServiceModel = require('../models/service');

module.exports = class Adapter {
  /**
   * @constructor
   */
  constructor(options) {
    this.service = null;
    this.host = options.host;
    this.port = options.port;
    this.ns = options.ns || '/service';
    this.registered = false;
    this.client = null;
    this.roundPointer = 0;
  }

  register(service) {
    throw new Error('Not implemented');
  }

  deregister() {
    throw new Error('Not implemented');
  }

  list(type) {
    throw new Error('Not implemented');
  }

  getNextService() {
    throw new Error('Not implemented');
  }

  /**
   *
   * @param {string} json
   * @returns {Service|null}
   */
  createServiceFromJSON(json) {
    return ServiceModel.fromJSON(json);
  }

  /**
   *
   * @param {any} object
   * @returns {Service|null}
   */
  createServiceFromObject(object) {
    return new ServiceModel(object)
  }
};