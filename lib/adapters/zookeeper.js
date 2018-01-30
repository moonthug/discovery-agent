'use strict';

const debug = require('debug')('discovery-agent:zookeeper');
const zookeeper = require('node-zookeeper-client');

const Adapter = require('./adapter');

module.exports = class Zookeeper extends Adapter {
  /**
   * @constructor
   * @param options
   */
  constructor(options) {
    super(options);
    this.connected = false;
    this._createClient();
  }

  /**
   *
   * @param type
   * @param host
   * @param port
   * @returns {Promise<any>}
   */
  register(type, host, port) {
    debug(`Register node with zookeeper: %O`, {type, host, port});

    return new Promise((resolve, reject) => {
      this._connectClient()
        .then(() => {
          this.client.create(`/${type}`, (err) => {
            if (err) {
              debug(`Registration failed: %O`, err);
              return reject(new Error(`Registration failed: ${err}`))
            }

            debug(`Registration completed`);

            this.client.close();
          });
        })
        .catch(reject);
    });
  }

  /**
   *
   * @private
   */
  _createClient() {
    this.client = zookeeper.createClient(`${this.host}:${this.port}`);
    debug(`Created client for server: ${this.host}:${this.port}`);
  }

  /**
   *
   * @private
   */
  _connectClient() {
    if(this.connected === true) return;

    debug(`Connecting to zookeeper`);

    return new Promise((resolve, reject) => {
      let resolved = false;

      this.client.once('connected', () => {
        debug(`Client connected`);
        this.connected = true;
        resolved = true;

        resolve();
      });

      this.client.on('error', () => {
        debug(`Client error`);
        this.connected = false;

        if(resolved === false) {
          reject();
        }
      });

      this.client.connect();
    });
  }
};