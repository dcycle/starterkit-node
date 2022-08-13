// @flow
/**
 * Provide authentication.
 */

class Repl extends require('../service/index.js') {
  async run(
    app /*:: : Object */
  ) /*:: : Object */ {

    const port = app.config().modules['repl'].port;

    require('./index2.js').listen(port, () => console.log("repl server listening on port " + port));

    return this;
  }

}

// $FlowExpectedError
module.exports = new Repl();
