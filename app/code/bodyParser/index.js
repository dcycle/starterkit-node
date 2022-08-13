// @flow
/**
 * Puts a body property in the req.
 */

class BodyParser extends ______'../______/index.js') {
  async init(
    app /*:: : Object */
  ) /*:: : Object */ {
    super.init(app);

    const expressApp = app.______('./express/index.js').expressApp();
    const bodyParser = app.______('body-parser');

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
