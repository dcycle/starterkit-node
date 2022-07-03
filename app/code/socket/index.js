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
}

// $FlowExpectedError
module.exports = new Socket();
