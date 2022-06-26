// @flow
/**
 * Reset the password for a user.
 */

// https://stackoverflow.com/questions/17437836/send-command-to-running-node-process-get-back-data-from-inside-the-app
// https://medium.com/trabe/mastering-the-node-js-repl-part-3-c0374be0d1bf
(async function () {
  'use strict';
  const app = require('../app.js');
  app.init().then(async () => {
    const username = String(app.env().required('MY_USERNAME'));
    const password = app.env().getOrFallback('MY_PASSWORD', app.component('./random.js').random());

    await app.component('./authentication.js').createOrAlterUser(username, password);

    console.log('username: ' + username);
    console.log('password: ' + password);

    await app.exitGracefully();
  });
}());
