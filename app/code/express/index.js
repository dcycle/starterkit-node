/**
 * My database module.
 *
 * Interact with the database.
 */

class Express extends require('../component/index.js') {

  // Store routes information
  routes = [];

  async init(app)  {
    this._app = app;

    this._expressApp = this.express()();
    this._httpServer = this.http().Server(this._expressApp);
    this._middlewares = {};

    // https://codeforgeek.com/ejs-template-engine-in-nodejs/
    this._expressApp.set('views', '/usr/src/app/views');
    this._expressApp.set('view engine', 'ejs');

    return this;
  }
  async exitGracefully() {
  }

  async run(app)  {
    const port = app.config().modules['./express/index.js'].port;
    this.httpServer().listen(port, function() {
      console.log('listening on *:' + port);
    });

    return this;
  }

  addRoute(id, verb, path, callback) {
    this.expressApp()[verb]([path], this.middlewares(id, verb), callback);

    // Store route information
    this.routes.push({ id, verb, path });
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

    if (typeof this._middlewares[key] !== 'undefined') {
      ret = this._middlewares[key];
    }

    return ret;
  }

  express() {
    // @ts-expect-error
    return require('express');
  }
  httpServer() {
    return this._httpServer;
  }
  http() {
    // @ts-expect-error
    return require('node:http');
  }
  expressApp() {
    return this._expressApp;
  }

  // Method to get all routes
  getRoutes() {
    return this.routes;
  }
}

module.exports = new Express();
