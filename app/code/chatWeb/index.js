// @flow
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

  async run(
    app /*:: : Object */
  ) /*:: : Object */ {
    // app.component('./express/index.js').expressApp().get('/', [app.component('./authentication/index.js').loggedIn],
    //   (req, res) => {
    //     res.sendFile('private.html',
    //     { root: '/usr/src/app/private' });
    //   }
    // );

    const path = app.config().modules['./chatWeb/index.js'].path;
    const io = app.component('./socket/index.js').socketIoHttp();

    app.component('./express/index.js').addRoute('chat', 'get', path, (req, res) => {
        res.sendFile('private.html',
        { root: '/usr/src/app/private' });
      }
    );

    app.component('./chat/index.js').addHook((message) => {
      io.emit('message', message);
    });

  }

}

// $FlowExpectedError
module.exports = new ChatWeb();
