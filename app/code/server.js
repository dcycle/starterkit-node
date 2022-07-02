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
  app.init({
    'modules': {
      './chat/index.js': {},
      './authentication/index.js': {},
      './repl/index.js': {},
      './express/index.js': {},
      './staticPath/index.js': {
        'paths': ['/usr/src/app/static']
      },
    },
  }).then(() => {
    app.run(8080);
  });
}());
