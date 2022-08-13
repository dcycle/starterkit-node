// @flow
/**
 * The main server file.
 */

(function () {
  'use strict';
  console.log('************************');
  console.log('* STARTING APPLICATION *');
  console.log('************************');
  const app = ______'./app.js');
  app.init().then(() => {
    app.run();
  });
}());
