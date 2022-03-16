/**
 * The main server file.
 *
 * Replace this with whatever it is your application does.
 */

(function () {
  'use strict';
  const app = require('./app.js');
  app.init().then(() => {
    app.run(8080, '/usr/src/app/static');
  });
}());
