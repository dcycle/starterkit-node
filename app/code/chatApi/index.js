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
      // update messge sender name with user id so that it will help us in fetching
      // username from account framework.
      if (req.user) {
        req.body.name = req.user._id;
      }
      app.c('chat').addMessage(req.body);
      res.sendStatus(200);
    });

    app.c('express').addRoute('chatApi', 'get', path, (req, res) => {
      app.c('chat').message().find({}).populate('name')
        .then((messages) => {
          res.send(messages);
        });
    });
    return this;
  }

}

module.exports = new ChatApi();
