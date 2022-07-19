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

    const expressApp = app.component('./express/index.js').expressApp();

    expressApp.post('/messages', (req, res) => {
      app.component('./chat/index.js').addMessage(req.body);
      res.sendStatus(200);
    });

    expressApp.get('/messages', (req, res) => {
      app.component('./chat/index.js').message().find({},(err, messages)=> {
        res.send(messages);
      });
    });

  }

}

// $FlowExpectedError
module.exports = new ChatApi();
