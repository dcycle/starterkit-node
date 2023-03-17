// @flow
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

  async run(
    app /*:: : Object */
  ) /*:: : Object */ {

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

  }

}

// $FlowExpectedError
module.exports = new ChatApi();
