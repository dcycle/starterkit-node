// @flow
/**
 * My socket module.
 *
 * Interact with socket.io.
 */

class Socket extends require('../component/index.js') {
  async init(
    app /*:: : Object */
  ) /*:: : Object */ {
    super.init(app);

    const http = app.component('./express/index.js').httpServer();
    this._socketIoHttp = this.socketIo()(http);

    return this;
  }
  async exitGracefully() {
  }
  /**
   * Mockable wrapper around the socket.io module.
   */
  socketIo() {
    // $FlowExpectedError
    return require('socket.io');
  }
  socketIoHttp() {
    return this._socketIoHttp;
  }
  dependencies() {
    return [
      './express/index.js',
    ];
  }
  async run(
    app /*:: : Object */
  ) /*:: : Object */ {
  }
}

// $FlowExpectedError
module.exports = new Socket();
