// @flow
/**
 * Get the number of users connected to socket.io.
 *
 * Interact with socket.io.
 */

class NumUsers extends require('../service/index.js') {
  async init(
    app /*:: : Object */
  ) /*:: : Object */ {
    super.init(app);

    const that = this;
    this._numUsers = 0;

    const socketIoHttp = app.service('socekt').socketIoHttp();

    socketIoHttp.on('connection', (socket) => {
      socketIoHttp.emit('updateNumUsers', this.numUsers(1));

      socket.on('disconnect', () => {
        socketIoHttp.emit('updateNumUsers', this.numUsers(-1));
      });
    });

    return this;
  }

  numUsers(
    increment /*:: : number */ = 0
  ) {
    this._numUsers = Math.max(increment, this._numUsers + increment);
    return this._numUsers;
  }

  /**
   * {@inheritdoc}
   */
  dependencies() {
    return [
      'socket',
    ];
  }

}

// $FlowExpectedError
module.exports = new NumUsers();
