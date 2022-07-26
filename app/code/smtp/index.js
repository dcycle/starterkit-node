// @flow
/**
 * Send mail.
 */

class Smtp extends require('../component/index.js') {

  async init(
    app /*:: : Object */
  ) /*:: : Object */ {
    this._app = app;

    this._servers = [];

    return this;
  }

  nodemailer() {
    return require('nodemailer');
  }

  server(serverName) {
    if (typeof this._servers[serverName] === 'undefined') {
      const app = this._app;
      const servers = app.config().modules['./smtp/index.js'].servers;
      const server = servers[serverName];
      if (typeof server === undefined) {
        throw 'Server ' + serverName + ' does not exist.';
      }

      this._servers[serverName] = this.nodemailer().createTransport({
        host: server.host,
        port: server.port,
        secure: server.secure,
        auth: {
          user: server.user,
          pass: server.pass,
        },
      });
    }

    return this._servers[serverName];
  }

}

// $FlowExpectedError
module.exports = new Smtp();
