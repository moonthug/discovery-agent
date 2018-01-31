'use strict';

module.exports = class Service {

  /**
   * @constructor
   * @param fromObject
   */
  constructor(fromObject) {
    // this.name = fromObject.name || 'service-0';
    // this.type = fromObject.type || 'service';
    // this.host = fromObject.host || '0.0.0.0';
    // this.port = fromObject.port || 80;
  }

  /**
   *
   * @returns {string}
   */
  toJSON() {
    // const {host, port} = this;
    // return JSON.stringify({host, port});
  }

  /**
   *
   * @param {string} endpoint
   * @param {string} protocol
   * @returns {string}
   */
  toURI(endpoint, protocol = 'http') {
    // return `${protocol}://${this.host}:${this.port}/${endpoint}`;
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