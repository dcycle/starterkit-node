// @flow
/**
 * Reset the password for a user.
 */

(function () {
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
