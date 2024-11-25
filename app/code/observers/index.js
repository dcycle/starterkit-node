// @ts-check
// The TypeScript engine will check all JavaScript in this file.

/**
 * Observers functionality.
 */
 class Observers extends require('../component/index.js') {

  /**
   * @property {Function} init Initializes this object.
   * @returns Observers
   */
  async init(app)  {
    super.init(app);

    this.observer = app.component('./database/index.js').mongoose().model('observers', {
      uuid: {
        type: String,
        // Ensure UUID is unique
        unique: true
      },
      module: {
        type: String,
        required: true
      },
      verb: {
        type: String,
        required: true
      },
      // '*' for all numbers or a specific phone number
      applyTo: {
        type: String,
        required: true
      },
      callback: {
        // Store callback as a string (e.g., name of the function)
        type: String,
        required: true
      },
      expire: {
        // Store as a string, could represent time (e.g., "+1 hour", or a specific date)
        type: String,
        required: true
      }
    });

    return this;
  }

  // https://github.com/jshint/jshint/issues/3361
  /* jshint ignore:start */
  observer;
  /* jshint ignore:end */

  /**
   * Returns the dependencies.
   * @returns {String[]}
   */
  dependencies() {
    return [
      // Dependency on express module
      './express/index.js',
      './database/index.js',
    ];
  }

  collection() {
    return this.app().c('database').client()
      .db('login')
      .collection('observers');
  }

  /**
   * Fetch the "whatsappMessages" model.
   */
   observers() {
    // Sample usage:
    // this.observers().find({},(err, observers)=> {
    //   return observers;
    // });

    return this.observer;
  }

  /**
   * Adds a new observer to the database and assigns a unique UUID to it.
   *
   * This method generates a unique UUID for the provided `observerObject` and
   * saves it to the database. If the observer is saved successfully, it returns
   * the UUID of the observer. If an error occurs during the process (such as
   * validation or database issues), the method will log the error and return `false`.
   *
   * @param {Object} observerObject - The observer object to be added to the database.
   * The object should not contain a `uuid` property as it will be automatically generated.
   *
   * @returns {Promise<string|boolean>} A promise that resolves to the UUID of the
   * saved observer if successful, or `false` if there was an error during saving.
   *
   * @throws {Error} Will throw an error if there is a validation error or any other
   * type of error during the process of storing the observer.
   */
  async addObserver(
    observerObject /*:: : Object */
  ) {
    try {
      const uniqueUuid = await this.generateUniqueUuid();
      // Set uuid in observer to save uuid.
      observerObject.uuid = uniqueUuid;
      const observer = await this.observers()(observerObject);
      return observer.save().then(async (value)=> {
        console.log("!! observer saved to database !!");
        return value.uuid;
      }).catch((err)=>{
        console.log(err);
        return false;
      });
    } catch (error) {
      // Handle Mongoose validation errors
      if (error.name === 'ValidationError') {
        console.error('Validation Error:', error.message);
        throw new Error('Validation error occurred while storing observer.');
      }
      // Handle other types of errors
      console.error('Error storing observer:', error);
      throw new Error('An error occurred while storing observer.');
    }
  }

  /**
   * Updates a specific field of an observer document in the database by its UUID.
   *
   * This method updates a single field in the observer document identified
   *  by the provided `uuid`. It sets the value of the specified field to
   *  `fieldValue`. If the document exists, it updates the specified field with
   *  the new value. If the document is not found, no changes are made.
   *
   * @param {string} uuid - The unique identifier of the observer to be updated.
   * @param {string} fieldName - The name of the field in the observer document
   *  that should be updated.
   * @param {*} fieldValue - The new value to set for the specified field.
   *
   * @returns {Promise<void|boolean>} A promise that resolves once the update
   *  operation is complete.
   * It does not return any value, as it simply updates the database.
   *
   * @throws {Error} Will throw an error if the update operation fails for any reason
   *  (e.g., database connection issues).
   */
  async updateOne(
    uuid,
    fieldName,
    fieldValue
  ) {
    let obj = {};
    obj[fieldName] = fieldValue;    
    try {
      const result = await this.collection().updateOne({
        uuid: uuid,
      }, {
        $set: obj,
      });
      // If the update operation modifies at least one document, return true
      if (result.modifiedCount > 0) {
        return true;
      } else {
        // If no documents were modified (e.g., no matching uuid), return false
        console.warn('No documents were updated.');
        return false;
      }
    } catch (error) {
      console.error('Error updating observer:', error);
      throw new Error('An error occurred while updating the observer.');
    }
  }

  /**
   * Finds an observer document in the database by its UUID.
   *
   * This method retrieves an observer document from the database that matches the
   * specified UUID. If the observer is found, the document is returned. If no observer
   * with the given UUID exists or if an error occurs during the operation, it returns `false`.
   *
   * @param {string} uuid - The unique identifier (UUID) of the observer to be retrieved.
   *
   * @returns {Promise<Object|boolean>} A promise that resolves to the observer document if found,
   * or `false` if no observer is found or if an error occurs.
   *
   * @throws {Error} Will throw an error if there is an issue accessing the database.
   */
  async findByUuid(uuid) {
    try {
      // Get observer by UUID exists in the database.
      let observer = await this.observers().findOne({ uuid: uuid });
      return observer;
    } catch (error) {
      console.error("Error getting observer:", error);
      return false;
    }
  }

  /**
   * Deletes an observer document from the database by its UUID.
   *
   * This method removes the observer document that matches the provided UUID
   *  from the database.
   * If the observer is found and deleted, it logs a success message
   *  and returns `true`.
   * If no observer is found with the given UUID, it logs a message indicating
   *  no document was deleted.
   * If an error occurs during the operation, it logs the error and
   *  returns `false`.
   *
   * @param {string} uuid - The unique identifier (UUID) of the observer to be deleted.
   *
   * @returns {Promise<boolean>} A promise that resolves to `true` if the
   * deletion is successful, or `false` if the operation fails (e.g., no document
   * found, or database issues).
   *
   * @throws {Error} Will throw an error if the delete operation encounters
   *  an issue (e.g., database connection failure).
   */
  async deleteByUuid(uuid) {
    try {
      const result = await this.observers().deleteOne({ uuid });
      if (result.deletedCount === 0) {
        console.log("No observer found with that UUID.");
      } else {
        console.log(`Observer with UUID: ${uuid} has been deleted.`);
      }
      return true;
    } catch (error) {
      console.error("Error deleting observer:", error);
      return false;
    }
  }

  /**
   * Fetches all observer documents from the database.
   *
   * This method retrieves all observer documents from the database
   *  and returns them as an array.
   * If an error occurs during the fetch operation, it logs the error
   *  and returns an empty array.
   *
   * @returns {Promise<Array>} A promise that resolves to an array of
   *  observer documents. If an error occurs, it resolves to an empty array.
   *
   * @throws {Error} Will throw an error if there is a failure in accessing the database.
   */
  async observersGetAll() {
    try {
      const observers = await this.observers().find({});
      // Return the fetched observers
      return observers;
    } catch (err) {
      console.error("Error fetching observers:", err);
      // Return an empty array or handle error as needed
      return [];
    }
  }

  /**
   * Get a UUID.
   *
   * @returns string
   *   A UUID.
   */
  async generateUniqueUuid() {
    // Import UUID for generating unique conversation IDs.
    // @ts-ignore
    const { v4: uuidv4 } = require('uuid');
    let newUuid = uuidv4();

    // Check if the UUID already exists in the database
    let existingObserver = await this.findByUuid(newUuid);

    // If the UUID already exists, generate a new one
    while (existingObserver) {
      newUuid = uuidv4();
      existingObserver = await this.findByUuid(newUuid);
    }

    return newUuid;
  }

  /**
   * Runs the observer actions based on the provided module, verb, and toNumber.
   *
   * This method retrieves a list of observers based on the
   *  given `module`, `verb`, and `toNumber`
   * parameters. It then processes the observers by calling
   *  `handleObservers` with the fetched observers
   * and additional `data`. If the observers are not an array, an error is logged.
   *
   * @param {object} filters - The filter the relevant observers.
   * @param {Object} data - The data to be passed to the observers for further handling.
   *
   * @returns {Promise<void>} A promise that resolves when all observer
   *  actions are completed.
   *
   * @throws {Error} Will throw an error if the `getObservers` method fails
   *  to retrieve observers.
   */
  async runObservers(filters, data) {
    const observers = await this.app().c('observers').getObservers(filters);

    if (Array.isArray(observers)) {
      await this.handleObservers(observers, data);
    } else {
      console.error('Observers is not an array:', observers);
    }
  }

  /**
   * Retrieves a list of observer documents from the database based on
   *  the provided filters.
   *
   * This method fetches observers from the database that match the specified
   *  `module`, `verb`, and `toNumber`. It uses an `$or` query to match observers
   *  based on the following criteria:
   * - The `applyTo` field is either a wildcard (`*`), or
   * - The `applyTo` field contains the provided `toNumber`.
   *
   * @param {object} filters - The filters to select respective observers.
   *
   * @returns {Promise<Array>} A promise that resolves to an array of observer
   *  documents that match the query.
   * If no observers are found, an empty array is returned.
   *
   * @throws {Error} Will throw an error if the database query fails.
   */
  async getObservers(filters) {
    return await this.app().c('observers').observers().find(filters);
  }

  /**
   * Handles a list of observer actions by invoking their respective callback functions.
   *
   * This method iterates over the provided list of observers and calls a handler function
   * (`handleCallback`) for each observer, passing the observer data along with any additional
   * data provided in the `data` parameter. The `handleCallback` method is expected to process
   * the observer and perform the necessary actions.
   *
   * @param {Array} observers - An array of observer objects to be processed. Each observer
   *  is expected to have the necessary information for the callback function.
   * @param {Object} data - Additional data that is passed to the callback function for
   *  each observer.
   *
   * @returns {Promise<void>} A promise that resolves when all observers have been processed.
   * The method processes each observer asynchronously, one after the other.
   *
   * @throws {Error} Will throw an error if any of the observer callback handling fails.
   */
  async handleObservers(observers, data) {
    for (const observer of observers) {
      await this.handleCallback(observer, data);
    }
  }

  /**
   * Handles the callback function for a given observer, executing the callback
   *  method dynamically.
   *
   * This method checks if the callback function specified in the observer
   *  object exists and is a valid function.
   * If the callback is valid, it is executed, passing the provided `data`
   *  as an argument. If the callback
   * does not exist or is not a function, an error message is logged.
   *
   * @param {Object} observer - The observer object that contains the callback
   *  method name and other data.
   * @param {Object} data - The data to be passed to the callback method
   *  when it is called.
   *
   * @returns {Promise<void>} A promise that resolves when the callback function
   *  has been executed.
   * The method ensures the callback is executed asynchronously.
   *
   * @throws {Error} Will throw an error if the callback method exists
   *  but fails during execution.
   */
  async handleCallback(observer, data) {
    if (typeof this[observer.callback] === 'function') {
      // Calling the callback method dynamically from within the class
      await this[observer.callback](data);
    } else {
      console.error('Callback method not found or is invalid');
    }
  }

  /**
   * Processes a received message by storing it in the database and sending a
   * confirmation message.
   *
   * This method takes the data of a received message, stores it in the database,
   *  and then sends a confirmation message back to the sender. The confirmation message
   *  is sent using the `whatsAppSend` service, which is accessed via the
   *  app's configuration.
   *
   * The process is as follows:
   * 1. The message details are passed to the `storeInMessageDetail` method
   *  for persistence.
   * 2. A confirmation message is then sent to the specified recipient using
   *  the `whatsAppSend` service.
   *
   * @param {Object} data - The data object containing the message object.
   *
   * @returns {Promise<void>} A promise that resolves once both the message has been
   *  stored and the confirmation has been sent.
   */
   async processReceivedMessage(data) {
    await this.app().c('webhookWhatsApp').storeInMessageDetail(data);
    // Send Confirmation message.
    await this.app().c('whatsAppSend').parsepropertySendMessage(
      '{"message":"!! WELL RECIEVED !!" , "sendTo":"+' + data.WaId + '"}'
    );
  }

}

module.exports = new Observers();
