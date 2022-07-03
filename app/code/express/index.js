// @flow
/**
 * My database module.
 *
 * Interact with the database.
 */

class Express extends require('../component/index.js') {
  async init(
    app /*:: : Object */
  ) /*:: : Object */ {
    this._expressApp = this.express()();
    this._httpServer = this.http().Server(this._expressApp);
  }
  async exitGracefully() {
  }

  async run(
    app /*:: : Object */
  ) /*:: : Object */ {
    const port = app.config().modules['./express/index.js'].port;
    this.httpServer().listen(port, function() {
      console.log('listening on *:' + port);
    });
  }

  express() {
    // $FlowFixMe
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
module.exports = new Express();
