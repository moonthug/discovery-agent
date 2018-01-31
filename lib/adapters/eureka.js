'use strict';

const debug = require('debug')('discovery-agent:zookeeper');
const eureka = require('eureka-js-client').Eureka;

const Adapter = require('./adapter');

module.exports = class Eureka extends Adapter {
  /**
   * @constructor
   * @param options
   */
  constructor(options) {
    super(options);
    this.connected = false;
  }

  /**
   *
   * @param type
   * @param host
   * @param port
   * @returns {Promise<any>}
   */
  register(type, host, port) {
    super.register(service);

    return new Promise((resolve, reject) => {
      debug(`Register service with consul: %O`, this.service);

      this._createClientAndRegisterService();

      this.client.start((err) => {
        if(err) {
          debug(`Registration failed: %O`, err);
          return reject(err);
        }
        debug(`Registration completed`);
        resolve();
      });
    });
  }

  /**
   *
   * @private
   */
  _createClientAndRegisterService() {
    this.client = new eureka({
      instance: {
        app: this.service.name,
        hostName: this.service.host,
        port: this.service.port,
      },
      eureka: {
        host: this.host,
        port: this.port
      }
    });
  }
};
