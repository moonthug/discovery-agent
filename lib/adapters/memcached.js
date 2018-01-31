'use strict';

const debug = require('debug')('discovery-agent:memcached');
// const etcd = require('node-etcd');

const Adapter = require('./adapter');

let pool = null;

module.exports = class Memcached extends Adapter {
  /**
   * @constructor
   * @param options
   */
  constructor(options) {
    super(options);
    this.port = options.port || 11211;
    this.heartbeatTimerId = 0;
    this.roundPointer = 0;
    this._createClient();
  }

  /**
   *
   * @param {Service} service
   * @returns {Promise<any>}
   */
  register(service) {
    this.service = service;
    this._register();
    this._startHeartbeat();
  }

  /**
   *
   * @param type
   * @returns {Promise<Array<service>}
   */
  list(type) {
    return new Promise((resolve, reject) => {
    });
  }

  /**
   *
   * @param {string} type
   * @returns {Promise<Service>}
   */
  getNextService(type) {
  }

  /**
   *
   * @param {string} type
   * @param {number} index
   * @returns {*}
   */
  getServiceAtIndex(type, index) {
    return new Promise((resolve, reject) => {
    });
  }


  /**
   *
   * @returns {Promise<any>}
   * @private
   */
  _register() {
    // return new Promise((resolve, reject) => {
    //   const path = `${this.ns}/${this.service.type}/${this.service.name}`;
    //
    //   debug(`Register node with etcd [${path}]: %O`, this.service);
    //
    //   this.client.set(path, this.service.toJSON(), { ttl: 10 }, (err) => {
    //     if (err) {
    //       debug(`Registration failed [${path}]: %O`, err);
    //       return reject(new Error(`Registration failed: ${err}`))
    //     }
    //
    //     debug(`Registration completed [${path}]`);
    //     resolve();
    //   });
    // });
  }

  /**
   *
   * @private
   */
  _createClient() {
    // if(Array.isArray(this.host) === false) {
    //   this.host = [`${this.host}:${this.port}`];
    // }
    //
    // this.client = new etcd(this.host);
    //
    // debug(`Created client for server %o`, this.host);
  }

  /**
   *
   * @private
   */
  _startHeartbeat() {
    debug(`Start the heartbeat...`);

    clearInterval(this.heartbeatTimerId);
    this.heartbeatTimerId = setInterval(() => {
      this._register()
        .then(() => {
          debug(`heartbeat...`);
        })
        .catch(() => {
          debug(`heartbeat failed...`);
        })
    }, 5000);
  }
};