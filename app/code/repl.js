// @flow
/**
 * Provide authentication.
 */

class Singleton extends require('./component.js') {
  async run(
    app /*:: : Object */
  ) /*:: : Object */ {

    const port = 8001;

    require('repl').listen(port, () => console.log("repl server listening on port " + port));

    return this;
  }

}

// $FlowExpectedError
module.exports = new Singleton();
