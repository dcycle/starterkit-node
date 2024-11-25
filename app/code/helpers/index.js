/**
 * Commonly functions of this project are defined here.
 */

class Helpers extends require('../component/index.js') {

  /**
   * @property {Function} init Initializes this object.
   * @returns WebhookSMS
   */
  async init(app)  {
    super.init(app);
  }

  dependencies() {
    return [
      './express/index.js',
      './authentication/index.js',
      './database/index.js',
      './env/index.js'
    ];
  }

  /** Return true if the AccountSid is equivalent to the TWILIO_USER in .env */
  validateAuthenticatedMessage(
    messageObject /*:: : Object */
  ) {
    if (messageObject.AccountSid != undefined) {
      const twilioUser = this.app().c('env').required('TWILIO_USER');
      return messageObject.AccountSid === twilioUser;
    }
    else {
      return false;
    }
  }
  
  async writeToFile(jsonMessage, filePath) {
    return /** @type {Promise<void>} */(new Promise((resolve, reject) => {
      // @ts-expect-error
      const fs = require('fs');

      // Read the current contents of the file
      fs.readFile(filePath, 'utf8', (readErr, data) => {
        if (readErr && readErr.code !== 'ENOENT') {
          // If the file exists and there's an error reading it, reject with an error
          console.error('Error reading from file:', readErr);
          return reject(new Error('Error reading from file'));
        }

        // Prepend the new jsonMessage to the existing data (or use empty string
        // if the file doesn't exist yet)
        const newData = jsonMessage + (data || '');

        // Write the new data to the file
        fs.writeFile(filePath, newData, (writeErr) => {
          if (writeErr) {
            console.error('Error writing to file:', writeErr);
            reject(new Error('Error writing to file'));
          } else {
            resolve();
          }
        });
      });
    }));
  }

  /**
   * Generates an XML response wrapper around the given message.
   *
   * This method takes a `jsonMessage` (or any string message) and wraps
   *  it in a standard XML format.
   * The resulting XML string includes an XML declaration and a root
   *  `<Response>` element that
   * contains the provided `jsonMessage`. This is typically used for
   *  returning XML responses from webhooks or APIs that expect
   *  XML-formatted data.
   *
   *
   * @param {string} jsonMessage - The message content to be wrapped in XML.
   * @returns {string} The XML string with the given message wrapped in a `<Response>` element.
   */
  generateXmlResponse(jsonMessage) {
    return '<?xml version="1.0" encoding="UTF-8"?>' + '<Response>' + jsonMessage + '</Response>';
  }

  /**
   * Generates an XML error response wrapper around the given error message.
   *
   * This method takes an `errorMessage` (or any string) and wraps it in a standard
   *  XML error format.
   * The resulting XML string includes an XML declaration and a root `<Response>`
   *  element that
   * contains the provided `errorMessage`. This is typically used to return error
   *  messages in XML format from webhooks or APIs that expect XML-formatted
   *  error responses.
   *
   *
   * @param {string} errorMessage - The error message to be wrapped in XML.
   * @returns {string} The XML string with the given error message wrapped in a
   *  `<Response>` element.
   */
  generateErrorXmlResponse(errorMessage) {
    return '<?xml version="1.0" encoding="UTF-8"?>' + `<Response>${errorMessage}</Response>`;
  }

}

module.exports = new Helpers();
