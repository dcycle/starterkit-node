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
      if (req.user) {
        // If authenticated user message then we will store user id in name of a message.
        //  and anonymousMessage is false.
        req.body.name = req.user._id;
        req.body.anonymousMessage = false;
      }
      app.c('chat').addMessage(req.body);
      res.sendStatus(200);
    });

    app.c('express').addRoute('chatApi', 'get', path, async (req, res) => {
      try {
        const messages = await app.c('chat').message().find({});
        for (let message of messages) {
          // authenticated user message then fetch user account details from account framework.
          if (!message.anonymousMessage) {
            const accounts = await app.c('accountFramework').getAccounts(message.name);
            message.name = accounts['0'].username;
          }
        }

        res.send(messages);
      } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'An error occurred while processing messages.' });
      }
    });

    return this;
  }

}

module.exports = new ChatApi();
