// @flow
/**
 * Puts a body property in the req.
 */

class Singleton extends require('../component/index.js') {
  async init(
    app /*:: : Object */
  ) /*:: : Object */ {

    const expressApp = app.component('./express/index.js').expressApp();
    const bodyParser = app.component('body-parser');

    expressApp.use(bodyParser.json());
    expressApp.use(bodyParser.urlencoded({extended: false}));
  }
  dependencies() {
    return [
      './express/index.js',
    ];
  }
}

// $FlowExpectedError
module.exports = new Singleton();
