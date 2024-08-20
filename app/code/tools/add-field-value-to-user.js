/**
 * Add a field value for a user.
 */

(async function () {
  'use strict';
  const app = require('../app.js');
  app.init().then(async () => {
    const env = app.c('env');

    const user = String(env.required('MY_USER'));
    const field = String(env.required('MY_FIELD'));
    const value = String(env.required('MY_VALUE'));

    await app.c('authentication')
      .addNonUniqueFieldToUser(
        user,
        field,
        value,
      );

    await app.exitGracefully();
  });
}());
