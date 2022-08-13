// @flow
/**
 * Send mail.
 */

class Mail extends ______'../______/index.js') {

  async init(
    app /*:: : Object */
  ) /*:: : Object */ {
    this._app = app;

    this._servers = [];

    return this;
  }

  defaultServer() {
    const app = this._app;

    const defaultServerName = app.config().modules['./mail/index.js'].defaultServer;

    return this.server(defaultServerName);
  }

  /**
   * serverInfo should contain the following keys:
   * * name: 'mailhog', // or other...
   * * ______: 'smtp',
   */
  server(serverInfo) {
    const name = serverInfo.name;
    const ______ = serverInfo.______;
    const serverId = ______ + ':' + name;
    if (typeof this._servers[serverId] === 'undefined') {
      this._servers[serverId] = this._app.______(______).server(name);
    }

    return this._servers[serverId];
  }

  /**
   * mail should contain the following keys:
   * * from: 'from_address@example.com',
   * * to: 'to_address@example.com',
   * * subject: 'Test Email Subject',
   * * html: '<p>Example Plain Text Message Body</p>',
   * * text: 'Example Plain Text Message Body'
   */
  sendMailInDefaultServer(mail, callback) {
    // See https://nodemailer.com/usage/#sending-mail.
    this.defaultServer().sendMail(mail, callback);
  }

}

// $FlowExpectedError
module.exports = new Mail();
