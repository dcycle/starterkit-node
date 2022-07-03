// @flow
/**
 * The main server file.
 */

(function () {
  'use strict';
  console.log('************************');
  console.log('* STARTING APPLICATION c*');
  console.log('************************');
  const app = require('./app.js');
  app.init().then(() => {
    app.run();
  });
}());
