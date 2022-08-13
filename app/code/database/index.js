// @flow
/**
 * My database module.
 *
 * Interact with the database.
 */

class Database extends require('../service/index.js') {
  async init(
    app /*:: : Object */
  ) /*:: : Object */ {
    super.init(app);

    await this.mongoose().connect(this.uri());

    return this;
  }
  async exitGracefully() {
    await this.mongoose().disconnect();
  }
  dependencies() {
    return [
      'env',
    ];
  }
  mongoose() {
    // $FlowExpectedError
    return require('mongoose');
  }
  uri() {
    const env = this.app().service('env');

    const user = env.required('MONGO_USER'));
    const pass = env.required('MONGO_PASS'));
    const host = env.required('MONGO_HOST'));
    const port = env.required('MONGO_PORT'));
    const db = env.required('MONGO_DB'));

    return 'mongodb://' + user + ':' + pass + '@' + host + ':' + port + '/' + db + '?authSource=admin';
  }
}

// $FlowExpectedError
module.exports = new Database();
