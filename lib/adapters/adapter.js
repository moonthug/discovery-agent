'use strict';

const ServiceModel = require('../models/service');

module.exports = class Adapter {
  /**
   * @constructor
   * @param options
   */
  constructor(options) {
    this.name = options.name;
    this.host = options.host;
    this.port = options.port;
    this.ns = options.ns || '/service';
    this.roundPointer = 0;

    this.service = null;
    this.checks = [];

    this.registered = false;
    this.client = null;
  }

  register(service) {
    this.service = service;
  }

  /**
   *
   */
  deregister() {
    //
  }

  /**
   *
   * @param {Check} check
   */
  createCheck(check) {
    this.checks.push(check);
  }

  /**
   *
   * @param {string} type
   */
  list(type) {
    //
  }

  /**
   *
   */
  pool() {
    //
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
