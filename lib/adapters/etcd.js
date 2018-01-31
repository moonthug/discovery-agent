'use strict';

const debug = require('debug')('discovery-agent:etcd');
const etcd = require('node-etcd');

const Adapter = require('./adapter');

let pool = null;

module.exports = class Etcd extends Adapter {
  /**
   * @constructor
   * @param options
   */
  constructor(options) {
    super(options);
    this.port = options.port || 2379;
    this.heartbeatTimerId = 0;
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
      const path = `${this.ns}/${type}`;
      debug(`List [${path}]`);
      this.client.get(path, { recursive: true, maxRetries: 0 }, (err, data) => {
        if (err) {
          debug(`List failed [${path}]: %O`, err);
          return reject(err)
        }

        if (!data || !data.node.nodes || data.node.nodes.length === 0) {
          debug(`List found no services [${path}]`);
          return reject(new Error(`List found no services`))
        }

        debug(`List found ${data.node.nodes.length} services`);

        let services = [];
        data.node.nodes.forEach(node => {
          try {
            services.push(this.createServiceFromJSON(node.value));
          }
          catch(e) {
            debug(`Parsing service JSON failed for ${node.key}: ${e.toString()}`);
          }
        });

        debug(`Pool contains ${services.length} services`);
        return resolve(services);
      });
    });
  }

  /**
   *
   * @param {string} type
   * @returns {Promise<Service>}
   */
  getNextService(type) {
    return new Promise((resolve, reject) => {
      this.list(type)
      .then(services => {
        if(!services || services.length === 0) {
          return reject(new Error(`Could not find an available service [${path}]`));
        }
        this.roundPointer = ++this.roundPointer % services.length;

        debug(`Returning service at ${this.roundPointer}/${services.length}`);

        return resolve(services[this.roundPointer]);
        })
      .catch(reject);
    });
  }

  /**
   *
   * @param {string} type
   * @param {number} index
   * @returns {*}
   */
  getServiceAtIndex(type, index) {
    return new Promise((resolve, reject) => {
      this.list(type)
      .then(services => {
        if(!services || services.length === 0) {
          return reject(new Error(`Could not find an available service [${path}]`));
        }

        debug(`Returning service at ${index}/${services.length}`);

        return resolve(services[index]);
      })
      .catch(reject);
    });
  }


  /**
   *
   * @returns {Promise<any>}
   * @private
   */
  _register() {
    return new Promise((resolve, reject) => {
      const path = `${this.ns}/${this.service.type}/${this.service.name}`;

      debug(`Register node with etcd [${path}]: %O`, this.service);

      this.client.set(path, this.service.toJSON(), { ttl: 10 }, (err) => {
        if (err) {
          debug(`Registration failed [${path}]: %O`, err);
          return reject(new Error(`Registration failed: ${err}`))
        }

        debug(`Registration completed [${path}]`);
        resolve();
      });
    });
  }

  /**
   *
   * @private
   */
  _createClient() {
    if(Array.isArray(this.host) === false) {
      this.host = [`${this.host}:${this.port}`];
    }

    this.client = new etcd(this.host);

    debug(`Created client for server %o`, this.host);
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