// @flow
/**
 * My database module.
 *
 * Interact with the database.
 */

class Database extends require('../component/index.js') {
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
      './env/index.js',
    ];
  }
  mongoose() {
    // $FlowExpectedError
    return require('mongoose');
  }
  uri() {
    const user = String(require('../env/index.js').required('MONGO_USER'));
    const pass = String(require('../env/index.js').required('MONGO_PASS'));
    const host = String(require('../env/index.js').required('MONGO_HOST'));
    const port = String(require('../env/index.js').required('MONGO_PORT'));
    const db = String(require('../env/index.js').required('MONGO_DB'));

    return 'mongodb://' + user + ':' + pass + '@' + host + ':' + port + '/' + db + '?authSource=admin';
  }
}

// $FlowExpectedError
module.exports = new Database();
