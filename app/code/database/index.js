/**
 * My database module.
 *
 * Interact with the database.
 */

class Database extends require('../component/index.js') {
  async init(app)  {
    super.init(app);

    await this.mongoose().connect(this.uri());

    const MongoClient = this.mongodb().MongoClient;

    this._client = new MongoClient(this.uri());

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
  client() {
    return this._client;
  }
  mongoose() {
    // @ts-expect-error
    return require('mongoose');
  }
  mongodb() {
    // @ts-expect-error
    return require('mongodb');
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

module.exports = new Database();
