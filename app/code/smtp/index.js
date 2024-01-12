/**
 * Send mail using SMTP.
 *
 * Normally you would set up configuration in ./app/config/versioned.yml and
 * ./app/config/unversioned.yml, defining one or more servers, and defining
 * your default server. Then you would send mail as described in ./README.md.
 */

class Smtp extends require('../component/index.js') {

  async init(app)  {
    this._app = app;

    this._servers = [];

    return this;
  }

  nodemailer() {
    // @ts-expect-error
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

      let transportInfo = {
        host: server.host,
        port: server.port,
        secure: server.secure,
      };

      if (typeof server.user !== 'undefined' && server.user !== "") {
            transportInfo.auth = {
          user: server.user,
          pass: server.pass,
        };
      }

      this._servers[serverName] = this.nodemailer().createTransport(transportInfo);
    }

    return this._servers[serverName];
  }

}

module.exports = new Smtp();
