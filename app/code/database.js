// @flow
/**
 * My database module.
 *
 * Interact with the database.
 */

class Singleton extends require('./component.js') {
  async init(
    app /*:: : Object */
  ) /*:: : Object */ {
    await this.mongoose().connect(this.uri());
  }
  async exitGracefully() {
    await this.mongoose().disconnect();
  }
  mongoose() {
    // $FlowExpectedError
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

// $FlowExpectedError
module.exports = new Singleton();
