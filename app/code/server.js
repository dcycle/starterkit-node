// @flow
/**
 * The main server file.
 */

(function () {
  'use strict';
  console.log('************************');
  console.log('* STARTING APPLICATION *');
  console.log('************************');
  const app = require('./app.js');
  app.init({
    'modules': {
      './chat/index.js': {},
      './authentication/index.js': {},
      './repl/index.js': {},
      './express/index.js': {},
    },
  }).then(() => {
    app.run(8080, '/usr/src/app/static');
  });
}());
