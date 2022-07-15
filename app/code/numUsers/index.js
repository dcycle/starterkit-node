// @flow
/**
 * My socket module.
 *
 * Interact with socket.io.
 */

let numUsers = 0;

class Socket extends require('../component/index.js') {
  async init(
    app /*:: : Object */
  ) /*:: : Object */ {
    const that = this;
    this.socket().socketIoHttp().on('connection', (socket) => {
      this.socket().socketIoHttp().emit('updateNumUsers', ++numUsers);

      socket.on('disconnect', () => {
        this.socket().socketIoHttp().emit('updateNumUsers', --numUsers);
      });
    });
  }

  /**
   * Mockable wrapper around our socket module.
   */
  socket() {
    // $FlowExpectedError
    return require('../socket/index.js');
  }

  /**
   * {@inheritdoc}
   */
  dependencies() {
    return [
      './socket/index.js',
    ];
  }

}

// $FlowExpectedError
module.exports = new Socket();
