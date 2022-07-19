// @flow

/**
 * Chat functionality.
 */
class Chat extends require('../component/index.js') {
  async init(
    app /*:: : Object */
  ) /*:: : Object */ {
    this.myMessage = app.component('./database/index.js').mongoose().model('Message', {
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
      './database/index.js',
      './socket/index.js',
      './bodyParser/index.js',
    ];
  }

  /**
   * Fetch the "Message" model.
   */
  message() {
    // Sample usage:
    // this.message().find({},(err, messages)=> {
    //   return messages;
    // });

    return this.myMessage;
  }

}

// $FlowExpectedError
module.exports = new Chat();
