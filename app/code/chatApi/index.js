/**
 * Abstract class providing web authentication.
 */

class ChatApi extends require('../component/index.js') {

  dependencies() {
    return [
      './express/index.js',
      './chat/index.js',
    ];
  }

  async run(app)  {

    const expressApp = app.c('express').expressApp();

    const path = '/messages';

    app.c('express').addRoute('chatApi', 'post', path, (req, res) => {
      app.c('chat').addMessage(req.body);
      res.sendStatus(200);
    });

    app.c('express').addRoute('chatApi', 'get', path, (req, res) => {
      app.c('chat').message().find({})
        .then((messages) => {
          res.send(messages);
        });
    });
    return this;
  }

}

module.exports = new ChatApi();
