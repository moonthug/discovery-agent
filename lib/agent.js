'use strict';

const os = require('os');

const debug = require('debug')('discovery-agent');
const uuid = require('uuid/v1');

const ServiceModel = require('./models/service');
const CheckModel = require('./models/check');

const ADAPTER_TYPES =  require('./constants/adapterTypes').ADAPTER_TYPES;

let pool = null;

module.exports = class Agent {
  /**
   *
   * @param {string} adapterType
   * @param {any} options
   */
  constructor(adapterType, options) {
    this.adapterType = adapterType;
    this.adapter = this._createAdapter(this.adapterType, options);

    // @todo Move these out of here, these relate to an adapters service
    this.name = uuid();
    this.type = 'server';

    debug(`Create ${adapterType} discovery agent\n %O`, {
      options
    });
  }

  /**
   *
   * @param {string} type
   * @param {string} host
   * @param {number} port
   * @param {string?} name
   * @returns {any}
   */
  async register(type, host, port, name = null) {
    this.type = type;
    this.name = name || this.name;

    // @todo Some of these arent required or are coming from the wrong source
    const service = new ServiceModel({
      adapter: this.adapterType,
      name: this.name,
      type: this.type,
      host,
      port
    });

    await this.adapter.register(service);

    debug(`Register client\n %O`, service);

    return service;
  }

  /**
   *
   * @param name
   */
  async createCheck(name, route, interval, options) {
    const check = new CheckModel({
      name,
      route,
      interval,
      ...options
    });

    return await this.adapter.createCheck(check);
  }

  /**
   *
   */
  async deregister() {
    //return await this.adapter.deregister();
  }

  /**
   *
   * @param {string} type
   * @returns {Array<services>}
   */
  async list(type) {
    return await this.adapter.list(type);
  }

  /**
   *
   * @returns {function}
   */
  static pool() {
    if(!pool) {
      debug(`Pool function is not initialised`);
      return null;
    }

    return pool;
  }

  /**
   *
   * @param type
   * @returns {Promise<Service>}
   */
  createPool(type) {
    return pool = this.adapter.getNextService(type);
  }

  /**
   *
   * @param {string} adapterName
   * @param {any} options
   * @returns {Adapter}
   */
  _createAdapter(adapterName, options) {
    let adapter;

    switch (adapterName) {
      case ADAPTER_TYPES.CONSUL:
        adapter = require('./adapters/consul');
        break;

      case ADAPTER_TYPES.ETCD:
        adapter = require('./adapters/etcd');
        break;

      case ADAPTER_TYPES.ZOOKEEPER:
        adapter = require('./adapters/zookeeper');
        break;

      default:
        throw new Error(`Invalid adapter name: ${adapterName}`)
    }

    return adapter ? new adapter(options) : null;
  }
};
