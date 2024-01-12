/**
 * Provide authentication.
 */

class Repl extends require('../component/index.js') {
  async run(app)  {

    const port = app.config().modules['./repl/index.js'].port;

    require('./index2.js').listen(port, () => console.log("repl server listening on port " + port));

    return this;
  }

}

module.exports = new Repl();
