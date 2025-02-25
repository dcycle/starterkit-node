// @ts-check
// The TypeScript engine will check all JavaScript in this file.

/**
 * Chat functionality.
 */
class Chat extends require('../component/index.js') {
  /**
   * @property {Function} init Initializes this object.
   * @returns Chat
   */
  async init(app)  {
    super.init(app);

    const Schema = app.component('./database/index.js').mongoose().Schema;
    const Message = new Schema({
      name : String,
      message : String,
      anonymousMessage: {
        type: Boolean,
        // Message can be send by authenticated user and anonymous user
        // If authenticated user message then we will store user id in name of a message.
        //  and anonymousMessage is false. For anonymous user we will store name as it is.
        // Default value for anonymousMessage is true which means anonymous message by default.
        default: true
      }
    },
    {
      // This will add createdAt and updatedAt fields.
      timestamps: true
    });

    this.myMessage = app.component('./database/index.js').mongoose().model('Message', Message);

    return this;
  }

  // https://github.com/jshint/jshint/issues/3361
  /* jshint ignore:start */
  myMessage;
  /* jshint ignore:end */

  /**
   * Returns the dependencies.
   * @returns {String[]}
   */
  dependencies() {
    return [
      './database/index.js',
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
    return new Promise((resolve, reject) => {
      const message = this.message()(messageObject);
      message.save()
        .then(() => {
          this.invoke(messageObject);
          resolve(true); // Resolving when message is saved and invoked
        })
        .catch((error) => {
          reject(error); // Rejecting if there's an error during save
        });
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

module.exports = new Chat();
