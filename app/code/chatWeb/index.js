/**
 * Abstract class providing web authentication.
 */

class ChatWeb extends require('../component/index.js') {

  dependencies() {
    return [
      './express/index.js',
      './chatApi/index.js',
    ];
  }

  async run(app)  {
    const path = app.config().modules['./chatWeb/index.js'].path;
    const io = app.c('socket').socketIoHttp();

    app.c('express').addRoute('chat', 'get', path, (req, res) => {
      res.render('chat', {
        name: req.user.username,
      });
    });

    app.c('chat').addHook((message) => {
      io.emit('message', message);
    });
    return this;
  }

}

module.exports = new ChatWeb();
