'use strict';

const debug = require('debug')('discovery-agent:consul');
const consul = require('consul');

const Adapter = require('./adapter');

module.exports = class Consul extends Adapter {
  /**
   * @constructor
   * @param options
   */
  constructor(options) {
    super(options);
    this.port = options.port || 8500;
    this._createClient();
  }

  /**
   *
   * @param {Service} service
   * @returns {Promise<any>}
   */
  register(service) {
    super.register(service);

    return new Promise((resolve, reject) => {
      debug(`Register service with consul: %O`, this.service);

      this.service = service;
      const options = {
        id: this.service.name,
        name: this.service.type,
        address: this.service.host,
        port: this.service.port,
      };

      this.client.agent.service.register(options, (err) => {
        if (err) {
          debug(`Registration failed: %O`, err);
          return reject(err);
        }

        debug(`Registration completed`);
        resolve();
      });
    })
  }

  /**
   *
   * @param {Check} check
   */
  createCheck(check) {
    super.createCheck(check);

    // Format for consul
    check.route = this.service.toURI(check.route);
    check.interval = check.interval + 'ms';
    check.timeout = check.timeout + 'ms';

    return new Promise((resolve, reject) => {
      debug(`Add check to service[${this.service.name}]: %O`, this.check);

      this.client.agent.check.register((err, result) => {
        if (err) {
          debug(`Creating check failed: %O`, err);
          return reject(err);
        }

        debug(`Creating check completed`);
        return resolve(check);
      });
    });
  }

  /**
   *
   * @param type
   * @returns {Promise<Array<service>}
   */
  list(type) {
    return new Promise((resolve, reject) => {
      this.client.agent.service.list((err, result) => {
        if (err) {
          debug(`List failed: %O`, err);
          return reject(err)
        }

        let services = [];
        Object.keys(result).forEach(key => {
          const service =  result[key];

          if(service.Service !== type) {
            return;
          }

          try {
            services.push(this.createServiceFromObject({
              name: service.ID,
              type: service.Service,
              host: service.Address,
              port: service.Port
            }));
          }
          catch(e) {
            debug(`Parsing service JSON failed for ${key}: ${e.toString()}`);
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
   * @private
   */
  _createClient() {
    this.client = consul({
      host: this.host,
      port: this.port
    });

    debug(`Created client for server %o`, this.host);
  }
};
