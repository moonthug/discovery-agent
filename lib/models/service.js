'use strict';

module.exports = class Service {

  /**
   * @constructor
   * @param options
   */
  constructor(options) {
    this.name = options.name || 'service-0';
    this.type = options.type || 'service';
    this.host = options.host || '0.0.0.0';
    this.port = options.port || 80;
  }

  /**
   *
   * @returns {string}
   */
  toJSON() {
    const {host, port} = this;
    return JSON.stringify({host, port});
  }

  /**
   *
   * @param {string} endpoint
   * @param {string} protocol
   * @returns {string}
   */
  toURI(endpoint, protocol = 'http') {
    return `${protocol}://${this.host}:${this.port}/${endpoint}`;
  }

  /**
   *
   * @param json
   * @returns {Service|null}
   */
  static fromJSON(json) {
    try {
      return new Service(JSON.parse(json));
    }
    catch(e) {
      return null;
    }
  }
};