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

  addHook(hook) {
    this._hooks = this.hooks();
    this._hooks.push(hook);
  }

  hooks() {
    if (typeof this._hooks === 'undefined') {
      this._hooks = [];
    }
    return this._hooks;
  }

  invoke(message) {
    for (const hook of this._hooks) {
      hook(message);
    }
  }

  addMessage(messageObject) {
    const message = this.message()(messageObject);
    message.save((err) => {
      this.invoke(messageObject);
    });
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
