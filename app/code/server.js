// @flow
/**
 * The main server file.
 */

(function () {
  'use strict';
  const app = require('./app.js');
  app.init().then(() => {
    app.run(8080, '/usr/src/app/static', 8081);
  });
}());
