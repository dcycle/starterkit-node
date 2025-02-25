/**
 * Commonly functions of this project are defined here.
 */

class Helpers extends require('../component/index.js') {

  dependencies() {
    return [
      './express/index.js',
      './authentication/index.js',
      './database/index.js',
      './env/index.js'
    ];
  }

  /**
   * Validates whether the provided message object contains a valid authentication 
   * based on the AccountSid and compares it with the expected Twilio user.
   *
   * This method checks if the `AccountSid` field is present in the provided message object, 
   * and if it matches the expected `TWILIO_USER` from the environment variables.
   *
   * @param {Object} messageObject - The message object to validate. It should have an `AccountSid` property 
   *                                 (e.g., from Twilio webhook payload).
   * 
   * @returns {boolean} - Returns `true` if the `AccountSid` in the `messageObject` matches the expected `TWILIO_USER`, 
   *                      otherwise returns `false`.
   * 
   * @example
   * const messageObject = { AccountSid: 'ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX' };
   * const isAuthenticated = validateAuthenticatedMessage(messageObject);
   * if (isAuthenticated) {
   *   console.log('The message is authenticated.');
   * } else {
   *   console.log('The message is not authenticated.');
   * }
   */
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

  /**
   * Writes a JSON message to a specified file. If the file doesn't exist, it is created. 
   * If the file already exists, the message is prepended to the existing content.
   *
   * @param {string} jsonMessage - The JSON string to write to the file. It will be written as-is (you may want to stringify the message if it's a JavaScript object).
   * @param {string} filePath - The path to the file where the message should be written.
   * 
   * @returns {Promise<boolean>} - A Promise that resolves with `true` if the file was successfully updated, 
   *                                or `false` if an error occurred during the read/write operation.
   * 
   * @throws {Error} - If an unexpected error occurs while reading or writing the file.
   * 
   * @example
   * const filePath = 'path/to/file.txt';
   * const jsonMessage = '{"message": "Test message"}';
   * 
   * // Usage example:
   * const success = await writeToFile(jsonMessage, filePath);
   * if (success) {
   *   console.log('Message successfully written to file!');
   * } else {
   *   console.log('Failed to write message to file.');
   * }
   */
  async writeToFile(jsonMessage, filePath) {
    return /** @type {Promise<boolean>} */(new Promise((resolve, reject) => {
      // @ts-expect-error
      const fs = require('fs');

      // Read the current contents of the file
      fs.readFile(filePath, 'utf8', (readErr, data) => {
        if (readErr && readErr.code !== 'ENOENT') {
          // If the file exists and there's an error reading it, reject with an error
          console.error('Error reading from file:', readErr);
          return reject(false);
        }

        // Prepend the new jsonMessage to the existing data (or use empty string
        // if the file doesn't exist yet)
        const newData = jsonMessage + "\n" + (data || '');

        // Write the new data to the file
        fs.writeFile(filePath, newData, (writeErr) => {
          if (writeErr) {
            console.error('Error writing to file:', writeErr);
            reject(false);
          } else {
            resolve(true);
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

  /**
   * Validates the token against the expected token from the environment.
   * @param {string} token - The token from the request.
   * @param {string} tokenPurpose - The tokenPurpose represents purpose.
   * 'AUTH_API_TOKEN' authorized api token to acces end points .....
   *
   * @returns {boolean} True if the token is valid, otherwise false.
   */
  validateToken(token, tokenPurpose) {
    const expectedToken = String(require('../env/index.js').required(tokenPurpose));
    return token === expectedToken;
  }

}

module.exports = new Helpers();
