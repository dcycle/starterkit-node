// @flow
/**
 * My database module.
 *
 * Interact with the database.
 */

class Singleton extends require('../component/index.js') {
  async init(
    app /*:: : Object */
  ) /*:: : Object */ {
    this._expressApp = this.express()();
  }
  async exitGracefully() {
  }
  express() {
    return require('express');
  }
  expressApp() {
    return this._expressApp;
  }
}

// $FlowExpectedError
module.exports = new Singleton();
