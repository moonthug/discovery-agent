'use strict';

const debug = require('debug')('discovery-agent:eureka');
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
          const results = this.client.getInstancesByAppId(type);

          let services = [];
          results.forEach(service => {
            services.push(this.createServiceFromObject({
              name: service.hostName,
              type: service.app,
              host: service.hostName,
              port: service.port['$']
            }));
          });

          debug(`Pool contains ${services.length} services`);
          return resolve(services);
        })
        .catch((err) => {
          debug(`List failed: %O`, err);
          return reject(err);
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
            return reject(new Error(`Could not find an available service`));
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
   * @returns {Promise<any>}
   * @private
   */
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
        app: this.service.type,
        hostName: this.service.host,
        port: {
          '$': this.service.port,
          '@enabled': 'true',
        },
        vipAddress: this.service.host,
        statusPageUrl: this.service.toURI(),
        healthCheckUrl: this.service.toURI(),
        dataCenterInfo: {
          '@Class': 'com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo',
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
