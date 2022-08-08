// @flow
/**
 * Get the number of users connected to socket.io.
 *
 * Interact with socket.io.
 */

class Socket extends require('../component/index.js') {
  async init(
    app /*:: : Object */
  ) /*:: : Object */ {
    const that = this;
    this._numUsers = 0;
    this.socket().socketIoHttp().on('connection', (socket) => {
      that.socket().socketIoHttp().emit('updateNumUsers', this.numUsers(1));

      socket.on('disconnect', () => {
        that.socket().socketIoHttp().emit('updateNumUsers', this.numUsers(-1));
      });
    });
  }

  numUsers(
    increment /*:: : number */ = 0
  ) {
    this._numUsers = Math.max(increment, this._numUsers + increment);
    return this._numUsers;
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
