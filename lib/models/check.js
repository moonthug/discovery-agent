'use strict';

module.exports = class Check {

  /**
   * @constructor
   * @param options
   */
  constructor(options) {
    this.id = options.id || 'check-0';
    this.name = options.name || 'basic check';
    this.route = options.route || '/';
    this.method = options.method || 'GET';
    this.interval = options.interval || 10;
    this.timeout = options.timeout || 10;
  }

  /**
   *
   * @param json
   * @returns {Check|null}
   */
  static fromJSON(json) {
    try {
      return new Check(JSON.parse(json));
    }
    catch(e) {
      return null;
    }
  }
};
