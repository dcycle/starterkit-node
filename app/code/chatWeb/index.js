// @flow
/**
 * Abstract class providing web authentication.
 */

class ChatWeb extends require('../service/index.js') {

  dependencies() {
    return [
      'express',
      'chatApi',
    ];
  }

  async run(
    app /*:: : Object */
  ) /*:: : Object */ {
    const path = this.config('path');
    const io = app.service('socket').socketIoHttp();

    app.service('express').addRoute('chat', 'get', path, (req, res) => {
        res.sendFile('private.html',
        { root: '/usr/src/app/private' });
      }
    );

    app.service('chat').addHook((message) => {
      io.emit('message', message);
    });

  }

}

// $FlowExpectedError
module.exports = new ChatWeb();
