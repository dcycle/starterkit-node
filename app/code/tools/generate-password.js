// @flow
/**
 * Generate a password.
 */

(function () {
  'use strict';
  const app = require('../app.js');
  app.init().then(async () => {
    console.log(app.random().random());

    setTimeout(async function() {
      await app.exitGracefully();
    }, 5000);
  });
}());
