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
    this.port = options.port || 8761;
    this.connected = false;
  }

  /**
   *
   * @param {Service} service
   * @returns {Promise<any>}
   */
  register(service) {
    super.register(service);

    return new Promise((resolve, reject) => {
      debug(`Register service with eureka: %O`, this.service);

      this._createClientAndRegisterService();

      this._startClient()
        .then(() => {
          debug(`Registration completed`);
          resolve();
        })
        .catch((err) => {
          debug(`Registration failed: %O`, err);
          return reject(err);
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
      this._createClientAndRegisterService();

      this._startClient()
        .then(() => {
          const clients = this.client.getInstancesByAppId('type');
          return resolve(clients);
        })
        .catch((err) => {
          debug(`List failed: %O`, err);
          return reject(err);
        });
    });
  }

  _startClient() {
    return new Promise((resolve, reject) => {
      if (this.connected) {
        resolve();
      }
      this.client.start((err) => {
        return err ? reject(err) : resolve();
      });
    })
  }

  /**
   *
   * @private
   */
  _createClient() {
    if(this.client) {
      return;
    }
    // @todo add servicePath to adapterOptions
    this.client = new eureka({
      eureka: {
        host: this.host,
        port: this.port,
        servicePath: '/eureka/apps/'
      }
    });
  }

  /**
   *
   * @private
   */
  _createClientAndRegisterService() {
    if(this.client) {
      return;
    }

    // @todo add servicePath, vipAddress, dataCenterInfo to adapterOptions
    this.client = new eureka({
      instance: {
        app: this.service.name,
        hostName: this.service.host,
        port: this.service.port,
        vipAddress: 'dont.know.com',
        dataCenterInfo: {
          name: 'MyOwn',
        },
      },
      eureka: {
        host: this.host,
        port: this.port,
        servicePath: '/eureka/apps/'
      }
    });
  }
};
