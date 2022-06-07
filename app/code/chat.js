// @flow

/**
 * Chat functionality.
 */
class Singleton extends require('./component.js') {
  async init(
    app /*:: : Object */
  ) /*:: : Object */ {
    this.myMessage = app.component('./database.js').mongoose().model('Message', {
      name : String,
      message : String,
    });
  }

  // https://github.com/jshint/jshint/issues/3361
  /* jshint ignore:start */
  myMessage;
  /* jshint ignore:end */

  dependencies() {
    return [
      './database.js',
    ];
  }

  /**
   * Fetch the "Message" model.
   */
  message() {
    return this.myMessage;
  }

}

// $FlowExpectedError
module.exports = new Singleton();
