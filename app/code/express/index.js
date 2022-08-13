// @flow
/**
 * My database module.
 *
 * Interact with the database.
 */

class Express extends require('../service/index.js') {
  async init(
    app /*:: : Object */
  ) /*:: : Object */ {
    this._app = app;

    this._expressApp = this.express()();
    this._httpServer = this.http().Server(this._expressApp);
    this._middlewares = {};

    return this;
  }
  async exitGracefully() {
  }

  async run(
    app /*:: : Object */
  ) /*:: : Object */ {
    const port = app.config().modules['express'].port;
    this.httpServer().listen(port, function() {
      console.log('listening on *:' + port);
    });

    return this;
  }

  addRoute(id, verb, path, callback) {
    this.expressApp()[verb]([path], this.middlewares(id, verb), callback);
  }

  routeKey(id, verb) {
    return id + ':' + verb;
  }

  addMiddleware(id, verb, callback) {
    const key = this.routeKey(id, verb);

    if (!this._middlewares.hasOwnProperty(key)) {
      this._middlewares[key] = [];
    }

    this._middlewares[key].push(callback);
  }

  middlewares(id, verb) {
    const key = this.routeKey(id, verb);

    let ret = [
      (req, res, next) => {
        res.send('Please make sure you specify the access rules for the path ' + id + ' with verb ' + verb);
      }
    ];

    if (typeof this._middlewares[key] !== 'undefined' && this._middlewares[key] !== []) {
      ret = this._middlewares[key];
    }

    return ret;
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
