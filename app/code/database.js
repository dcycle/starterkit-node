// @flow
/**
 * My database module.
 *
 * Interact with the database.
 */
'use strict';

module.exports = {

  /** Mockable wrapper around mongoose. */
  mongoose: function() /*:: : Object */ {
    // $FlowExpectedError
    return require('mongoose');
  },

  /** Mockable wrapper around env. */
  env: function() /*:: : Object */ {
    // $FlowExpectedError
    return require('./env.js');
  },

  /** Initialize the connection to Mongoose. */
  init: function(
    callbackOK /*:: : () => number */,
    callbackInitError /*:: : (x: string) => null */,
    callbackError /*:: : (x: string) => null */) {

    try {
      // See https://mongoosejs.com/docs/connections.html.
      this.mongoose().connect(this.uri(), {}).then(
        () => {
          console.log('Connection to database OK.');
        },
        err => {
          console.log('Connection to database could not be established. Shutting down. ' + err);
          process.exit(1);
        },
      );
      this.mongoose().connection.on('error',
        err => {
          console.log('Error during database operation. Will try to continue. ' + err);
        },
      );
    }
    catch (err) {
      console.log('An error was thrown during database initialization. ' + err);
      process.exit(1);
    }
    return this;
  },

  /** Get the connection URI for the Mongoose database. */
  uri: function() /*:: : string */ {
    const user = String(this.env().required('MONGO_USER'));
    const pass = String(this.env().required('MONGO_PASS'));
    const host = String(this.env().required('MONGO_HOST'));
    const port = String(this.env().required('MONGO_PORT'));
    const db = String(this.env().required('MONGO_DB'));

    return 'mongodb://' + user + ':' + pass + '@' + host + ':' + port + '/' + db + '?authSource=admin';
  },
};
