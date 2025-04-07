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

    app.c('express').addRoute('chat', 'get', path, async (req, res) => {
      // show name from merged account username in Send message page.
      const users = await app.c('accountFramework').getAccounts(req.user._id);
      let name = req.user.username;
      if (users) {
        name = users['0'].username;
      }
      app.c('theme').render(res, 'chat', {
        name: name,
        title: "Chat"
      });
    });

    app.c('chat').addHook((message) => {
      io.emit('message', message);
    });
    return this;
  }

}

module.exports = new ChatWeb();
