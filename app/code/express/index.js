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
    this._httpServer = this.http().Server(this._expressApp);
  }
  async exitGracefully() {
  }
  express() {
    return require('express');
  }
  httpServer() {
    return this._httpServer;
  }
  http() {
    // $FlowExpectedError
    return require('node:http');
  }
  expressApp() {
    return this._expressApp;
  }
}

// $FlowExpectedError
module.exports = new Singleton();
