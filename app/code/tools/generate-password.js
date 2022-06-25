// @flow
/**
 * Generate a password.
 */

(function () {
  'use strict';
  const app = require('../app.js');
  app.init().then(async () => {
    console.log(app.component('./random.js').random());

    await app.exitGracefully();
  });
}());
