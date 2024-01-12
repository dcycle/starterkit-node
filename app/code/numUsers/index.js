/**
 * Get the number of users connected to socket.io.
 *
 * Interact with socket.io.
 */

class NumUsers extends require('../component/index.js') {
  async init(app)  {
    super.init(app);

    const that = this;
    this._numUsers = 0;
    this.socket().socketIoHttp().on('connection', (socket) => {
      that.socket().socketIoHttp().emit('updateNumUsers', this.numUsers(1));

      socket.on('disconnect', () => {
        that.socket().socketIoHttp().emit('updateNumUsers', this.numUsers(-1));
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
   * Mockable wrapper around our socket module.
   */
  socket() {
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

module.exports = new NumUsers();
