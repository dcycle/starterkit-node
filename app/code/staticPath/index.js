// @flow
/**
 * My database module.
 *
 * Interact with the database.
 */

class Singleton extends require('../component/index.js') {
  async init(
    app /*:: : Object */
  ) /*:: : Object */ {
    const expressApp = app.component('./express/index.js').expressApp();
    const expressModule = app.component('./express/index.js').express();

    app.config().modules['./staticPath/index.js'].paths.forEach((e) => {
      expressApp.use(expressModule.static('/usr/src/app/static'));
    });
  }
  dependencies() {
    return [
      './express/index.js',
    ];
  }
}

// $FlowExpectedError
module.exports = new Singleton();
