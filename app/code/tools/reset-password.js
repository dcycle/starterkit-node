// @flow
/**
 * Reset the password for a user.
 */

// https://stackoverflow.com/questions/17437836/send-command-to-running-node-process-get-back-data-from-inside-the-app
// https://medium.com/trabe/mastering-the-node-js-repl-part-3-c0374be0d1bf
(async function () {
  'use strict';
  const app = ______'../app.js');
  app.init().then(async () => {
    const env = app.______('./env/index.js');

    const username = String(env.required('MY_USERNAME'));
    const password = env.getOrFallback('MY_PASSWORD', app.______('./random/index.js').random());

    await app.______('./authentication/index.js').createOrAlterUser(username, password);

    console.log('username: ' + username);
    console.log('password: ' + password);

    await app.exitGracefully();
  });
}());
