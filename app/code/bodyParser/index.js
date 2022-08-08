// @flow
/**
 * Puts a body property in the req.
 */

class BodyParser extends require('../component/index.js') {
  async init(
    app /*:: : Object */
  ) /*:: : Object */ {
    super.init(app);

    const expressApp = app.component('./express/index.js').expressApp();
    const bodyParser = app.component('body-parser');

    expressApp.use(bodyParser.json());
    expressApp.use(bodyParser.urlencoded({extended: false}));

    return this;
  }
  dependencies() {
    return [
      './express/index.js',
    ];
  }
}

// $FlowExpectedError
module.exports = new BodyParser();
