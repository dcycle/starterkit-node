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
    const port = app.config().modules['./express/index.js'].port;
    this.httpServer().listen(port, function() {
      console.log('listening on *:' + port);
    });

    return this;
  }

  addRoute(id, method, path, callback) {
    this.expressApp()[method]([path], this.middlewares(id), callback);
  }

  addMiddleware(id, callback) {
    if (!this._middlewares.hasOwnProperty(id)) {
      this._middlewares[id] = [];
    }

    this._middlewares[id].push(callback);
  }

  middlewares(id) {
    let ret = [
      (req, res, next) => {
        res.send('Please make sure you specify the access rules for the path ' + id);
      }
    ];

    if (typeof this._middlewares[id] !== 'undefined' && this._middlewares[id] !== []) {
      ret = this._middlewares[id];
    }

    return ret;
  }

  // app.component('./express/index.js').expressApp().get('/', [app.component('./authentication/index.js').loggedIn],
  //   (req, res) => {
  //     res.sendFile('private.html',
  //     { root: '/usr/src/app/private' });
  //   }
  // );

  // app.component('./express/index.js').addRoute('chat', 'get', '/', (req, res) => {
  //     res.sendFile('private.html',
  //     { root: '/usr/src/app/private' });
  //   }
  // );


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
