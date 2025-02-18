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

    app.c('express').addRoute('chatApi', 'post', path, async (req, res) => {
      // update messge sender name with user id so that it will help us in fetching
      // username from account framework.
      if (req.user) {
        const userdetails = await app.c('accountFramework').getAccounts(req.user._id);
        if (userdetails) {
          req.body.accountFrameworkname = userdetails['0']._id;
        }

        req.body.name = req.user._id;
      }
      app.c('chat').addMessage(req.body);
      res.sendStatus(200);
    });

    app.c('express').addRoute('chatApi', 'get', path, (req, res) => {
      app.c('chat').message().find({}).populate('accountFrameworkname')
        .then((messages) => {
          res.send(messages);
        });
    });
    return this;
  }

}

module.exports = new ChatApi();
