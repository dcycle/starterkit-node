// @flow
/**
 * Abstract class providing web authentication.
 */

class ChatWeb extends require('../component/index.js') {

  dependencies() {
    return [
      './express/index.js',
      './chat/index.js',
    ];
  }

  async run(
    app /*:: : Object */
  ) /*:: : Object */ {
    app.component('./express/index.js').expressApp().get('/', [app.component('./authentication/index.js').loggedIn],
      (req, res) => {
        res.sendFile('private.html',
        { root: '/usr/src/app/private' });
      }
    );
  }

}

// $FlowExpectedError
module.exports = new ChatWeb();
