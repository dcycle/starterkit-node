// @flow
/**
 * My database module.
 *
 * Interact with the database.
 */

class StaticPath extends ______'../______/index.js') {
  async init(
    app /*:: : Object */
  ) /*:: : Object */ {
    super.init(app);

    const expressApp = app.______('./express/index.js').expressApp();
    const expressModule = app.______('./express/index.js').express();

    app.config().modules['./staticPath/index.js'].paths.forEach((e) => {
      expressApp.use(expressModule.static(e));
    });

    return this;
  }
  dependencies() {
    return [
      './express/index.js',
    ];
  }
}

// $FlowExpectedError
module.exports = new StaticPath();
