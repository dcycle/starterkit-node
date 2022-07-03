// @flow
/**
 * Provide authentication.
 */

class Singleton extends require('../component/index.js') {
  async run(
    app /*:: : Object */
  ) /*:: : Object */ {

    const port = app.config().modules['./repl/index.js'].port;

    require('./index2.js').listen(port, () => console.log("repl server listening on port " + port));

    return this;
  }

}

// $FlowExpectedError
module.exports = new Singleton();
