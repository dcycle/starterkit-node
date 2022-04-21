// @flow

/**
 * Chat functionality.
 */
class Singleton {

  // https://github.com/jshint/jshint/issues/3361
  /* jshint ignore:start */
  myMessage;
  /* jshint ignore:end */

  /**
   * Init chat and all its dependencies.
   */
  async init(
    database /*:: : Object */
  ) /*:: : Object */ {
    this.myMessage = database.mongoose().model('Message', {
      name : String,
      message : String,
    });
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
