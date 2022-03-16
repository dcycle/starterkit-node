/**
 * My database module.
 *
 * Interact with the database.
 */

'use strict';

class Singleton {
  constructor() {
    this.ready = false;
    console.log(this.ready);
    this.mongoose().connect(this.uri(), (err) => {
      console.log(this.ready);
      this.ready = true;
    });
  }
  isReady() {
    return this.ready;
  }
  mongoose() {
    return require('mongoose');
  }
  env() {
    return require('./env.js');
  }
  uri() {
    const user = String(this.env().required('MONGO_USER'));
    const pass = String(this.env().required('MONGO_PASS'));
    const host = String(this.env().required('MONGO_HOST'));
    const port = String(this.env().required('MONGO_PORT'));
    const db = String(this.env().required('MONGO_DB'));

    return 'mongodb://' + user + ':' + pass + '@' + host + ':' + port + '/' + db + '?authSource=admin';
  }
}

module.exports = new Singleton();
