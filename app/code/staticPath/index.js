// @flow
/**
 * My database module.
 *
 * Interact with the database.
 */

class StaticPath extends require('../service/index.js') {
  async init(
    app /*:: : Object */
  ) /*:: : Object */ {
    super.init(app);

    const expressApp = app.service('express').expressApp();
    const expressModule = app.service('express').express();

    app.config().modules['./staticPath/index.js'].paths.forEach((e) => {
      expressApp.use(expressModule.static(e));
    });

    return this;
  }
  dependencies() {
    return [
      'express',
    ];
  }
}

// $FlowExpectedError
module.exports = new StaticPath();
