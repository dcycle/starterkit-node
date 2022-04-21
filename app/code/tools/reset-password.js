// @flow
/**
 * Reset the password for a user.
 */

(function () {
  'use strict';
  const app = require('../app.js');
  app.init().then(async () => {
    const username = String(app.env().required('MY_USERNAME'));
    const password = app.random().random();

    await app.authentication().createOrAlterUser(username, password);

    console.log('username: ' + username);
    console.log('password: ' + password);

    setTimeout(async function() {
           await app.exitGracefully();
    }, 5000);


  });
}());
