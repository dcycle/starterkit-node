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
    const http = app.component('./express/index.js').http();
    this._socketIoHttp = this.socketIo()(http);
    const io = this.socketIoHttp();

    io.on('connection', (socket) => {
      io.emit('updateNumUsers', ++numUsers);

      socket.on('disconnect', () => {
        io.emit('updateNumUsers', --numUsers);
      });
    });
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
