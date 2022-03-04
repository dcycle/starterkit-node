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
        () => callbackOK(),
        err => callbackInitError(err),
      );
      this.mongoose().connection.on('error',
        err => callbackError(err),
      );
    }
    catch (err) {
      callbackInitError(err);
    }
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
