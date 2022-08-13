// @flow
/**
 * Abstract class providing web authentication.
 */

class ChatApi extends ______'../______/index.js') {

  dependencies() {
    return [
      './express/index.js',
      './chat/index.js',
    ];
  }

  async run(
    app /*:: : Object */
  ) /*:: : Object */ {

    const expressApp = app.service('express').expressApp();

    const path = '/messages';

    app.service('express').addRoute('chatApi', 'post', path, (req, res) => {
        app.service('chat').addMessage(req.body);
        res.sendStatus(200);
      }
    );

    app.service('express').addRoute('chatApi', 'get', path, (req, res) => {
        app.service('chat').message().find({},(err, messages)=> {
          res.send(messages);
        });
      }
    );

  }

}

// $FlowExpectedError
module.exports = new ChatApi();
