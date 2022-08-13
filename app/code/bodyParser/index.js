// @flow
/**
 * Puts a body property in the req.
 */

class BodyParser extends require('../service/index.js') {
  async init(
    app /*:: : Object */
  ) /*:: : Object */ {
    super.init(app);

    const expressApp = app.service('express').expressApp();
    const bodyParser = app.require('body-parser');

    expressApp.use(bodyParser.json());
    expressApp.use(bodyParser.urlencoded({extended: false}));

    return this;
  }
  dependencies() {
    return [
      'express',
    ];
  }
}

// $FlowExpectedError
module.exports = new BodyParser();
