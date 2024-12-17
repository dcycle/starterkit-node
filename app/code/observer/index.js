/**
 * "Observer" manages publish and subscribe functionality.
 * The Observer will act like a registry for subscribers, and
 * trigger a publish from any where in the modules then subscribers
 * executed which are waiting for the respective publishedEvent.
 *
 * (e.g., receiving a Twilio webhook).
 * Refer observerExamplePublisher, observerExampleSubscriber for implimenting
 *  publish and subscribers.
 */
 class Observer extends require('../component/index.js') {

  /**
   * Returns the dependencies.
   * @returns {String[]}
   */
   dependencies() {
    return [
      // Dependency on express module
      './express/index.js',
      './database/index.js',
      // UUID library dependency
      'uuid'
    ];
  }

  /**
   * @property {Function} init Initializes this object.
   * @returns Observers
   */
   async init(app) {
    super.init(app);

    this.observersModel = app.component('./database/index.js').mongoose().model('observers', {
      publisherModule: {
        type: String,
        required: true
      },
      publishedEvent: {
        type: String,
        required: true
      },
      subscriberModule: {
        type: String,
        required: true
      },
      subscriberMethod: {
        type: String,
        required: true
      },
      subscriberId: {
        type: String,
        required: true
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    });

    return this;
  }

  // https://github.com/jshint/jshint/issues/3361
  /* jshint ignore:start */
  subscribers = {};
  observersModel = {};
  /* jshint ignore:end */

  collection() {
    return this.app().c('database').client()
      .db('login')
      .collection('observers');
  }

  /**
   * Fetch the "observers" model.
   */
   getObserversModel() {
    // Sample usage:
    // this.getObserversModel().find({},(err, observers)=> {
    //   return observers;
    // });

    return this.observersModel;
  }

  /**
   * Subscribes a subscriber module to a specific event published by a
   * publisher module.
   *
   * This method associates a subscriber module's method to an event published
   * by a specific publisher module.
   * It checks if both the publisher and subscriber modules are enabled. If
   * not, it exits early. If the `subscriberId` is not provided, a unique ID
   * is generated for the subscriber. The method then ensures the structure
   * for the publisher and event is valid before saving the subscription
   * information.
   *
   * After successfully subscribing, it saves the subscription details
   * to the database by calling the `addSubscriber` method.
   *
   * @param {string} publisherModule - The module name of the publisher
   *  that is emitting the event.
   * @param {string} publishedEvent - The event name that the publisher
   *  is emitting.
   * @param {string} subscriberModule - The module name of the subscriber
   *  that will respond to the event.
   * @param {string} subscriberMethod - The method name in the subscriber
   *  module that will handle the event.
   * @param {string} [subscriberId=''] - An optional unique identifier for
   *  the subscriber. If not provided, a unique identifier is generated
   *  based on the publisher, event, and subscriber method.
   *
   * @returns {Promise<void>} - This method is asynchronous and does not
   *  return any value. It performs the subscription operation and saves
   *  the subscription data to the database.
   *
   * @example
   * await app.c('observers').subscribe(
   * 'userModule',
   * 'userRegistered',
   * 'emailService',
   * 'sendWelcomeEmail'
   * );
   *
   * @example
   * await app.c('observers').subscribe(
   * 'orderModule',
   * 'orderShipped',
   * 'notificationService',
   * 'sendShipmentNotification',
   * 'customSubscriberId123'
   * );
   *
   */
  async subscribe(
    publisherModule,
    publishedEvent,
    subscriberModule,
    subscriberMethod,
    subscriberId = ''
  ) {
    if (!this.isModuleEnabled(publisherModule)) {
      return;
    }
    if (!this.isModuleEnabled(subscriberModule)) {
      return;
    }
    if (!subscriberId) {
      // Creating unique subscriberId. if it is UUID they are chances that
      // ./scripts/deploy.sh can create duplicates hence we are creating unique subscriberId.
      subscriberId = publisherModule + '-' +
        publishedEvent + '-' + 
        subscriberModule + '-' + 
        subscriberMethod;
    }
    this.ensureStructureValid(
      publisherModule,
      publishedEvent,
    );

    this.subscribers[publisherModule][publishedEvent][subscriberId] = {
      subscriberModule: subscriberModule,
      subscriberMethod: subscriberMethod,
    };

    await this.addSubscriber({
      "publisherModule": publisherModule,
      "publishedEvent": publishedEvent,
      "subscriberModule": subscriberModule,
      "subscriberMethod": subscriberMethod,
      "subscriberId": subscriberId
    });
  }

  /**
   * Ensures that the structure for the given publisher module and event
   * is valid.
   *
   * This method checks whether the structure for a specific publisher
   * module and event exists in the `subscribers` object. If the structure
   * does not exist, it initializes the required objects to ensure that
   *  subscribers can be added or updated correctly.
   *
   * @param {string} publisherModule - The module name of the publisher.
   * @param {string} publishedEvent - The event name that the publisher
   *  is emitting.
   *
   * @returns {void} - This method does not return anything. It modifies
   *  the `subscribers` object to ensure the correct structure for the
   *  publisher and event.
   *
   * @example
   * // Ensures structure is valid for the given publisher and event
   * ensureStructureValid('userModule', 'userRegistered');
   */
  ensureStructureValid(
    publisherModule,
    publishedEvent,
  ) {
    if (!this.subscribers[publisherModule]) {
      this.subscribers[publisherModule] = {};
    }
    if (!this.subscribers[publisherModule][publishedEvent]) {
      this.subscribers[publisherModule][publishedEvent] = {};
    }
  }

  /**
   * Publishes an event to all subscribers associated with a specific
   * publisher module.
   *
   * This method first checks if the `publisherModule` is enabled using
   * the `isModuleEnabled` method. If the module is not enabled, the
   * function returns early without performing any actions. It then ensures
   * the structure of the publisher and event is valid by calling
   *  `ensureStructureValid`. Finally, it triggers the event by calling
   *  `runSubscribers`, which will notify all subscribers associated with
   * the specified `publisherModule` and `publishedEvent` by invoking
   * their respective methods with the provided data.
   *
   * @param {string} publisherModule - The module name of the publisher that
   *  is emitting the event.
   * @param {string} publishedEvent - The name of the event being emitted by
   *  the publisher.
   * @param {Object} data - The data to be passed to the subscribers' methods
   *  when the event is triggered.
   *
   * @returns {Promise<void>} - This method is asynchronous and does not
   *  return any value. It performs an action by notifying the subscribers
   *  and invoking their methods.
   *
   * @example
   * const publisher = 'userModule';
   * const event = 'userRegistered';
   * const data = { username: 'johndoe', email: 'johndoe@example.com' };
   * await app.c('observers').publish(publisher, event, data);
   */
  async publish(publisherModule, publishedEvent, data) {
    if (!this.isModuleEnabled(publisherModule)) {
      return;
    }
    this.ensureStructureValid(
      publisherModule,
      publishedEvent,
    );

    await this.runSubscribers(publisherModule, publishedEvent, data);
  }

  /**
   * Executes the subscriber methods for a given publisher module and
   * published event, passing the provided data to each subscriber.
   *
   * This function queries the `observers` collection to find subscribers
   * associated with a specific publisher module and published event. For
   * each subscriber, it invokes the specified method on the subscriber
   * module, passing the provided data. The method uses Mongoose to query
   * the database and dynamically executes subscriber methods.
   *
   * - If no subscribers are found for the given filter, it logs a message
   *  and terminates.
   * - If an error occurs while querying the database or executing subscriber
   *  methods, it logs the error.
   *
   * @param {string} publisherModule - The module name of the publisher
   *  that is emitting the event. Used to filter subscribers by publisher.
   *
   * @param {string} publishedEvent - The name of the published event.
   *  Used to filter subscribers by event type.
   *
   * @param {Object} data - The data to be passed to the subscriber
   *  method(s) when invoked. This data is forwarded to the subscriber's method.
   *
   * @returns {Promise<void>} - This method does not return any value.
   * It performs asynchronous operations on each subscriber.
   *
   * @throws {Error} - If there is an error during the query or when
   * invoking subscriber methods, it logs the error message.
   *
   * @example
   * const publisherModule = 'UserModule';
   * const publishedEvent = 'UserCreated';
   * const eventData = { userId: 123, userName: 'John Doe' };
   * await app.c('observers').runSubscribers(
   *   publisherModule,
   *   publishedEvent,
   *   eventData
   * );
   *
   * // If the `UserCreated` event is published by the `UserModule`, it
   *  will find all subscribers and execute their respective methods.
   */
  async runSubscribers(publisherModule, publishedEvent, data) {
    try {
      // Define the filter conditions
      const filter = {
        publisherModule: publisherModule,
        publishedEvent: publishedEvent
      };

      // Define the fields to select (subscriberModule and subscriberMethod)
      const fieldsToSelect = 'subscriberModule subscriberMethod';

      const subscribers = await this.getObserversModel().find(filter).select(fieldsToSelect);

      if (!subscribers) {
        console.log('Subscribers not found');
        return;
      }

      subscribers.forEach(async subscriber => {
        const module = subscriber.subscriberModule;
        const method = subscriber.subscriberMethod;
        await this.app().c(module)[method](data);
      });
    } catch (error) {
      console.error('Error querying publisher data:', error);
    }
  }

  /**
   * Adds a new observer to the database.
   *
   * This method checks whether an observer already exists in the database
   * based on the provided observer object. If the observer exists, it returns
   * the existing observer's ID. If the observer does not exist, a new observer
   * document is created and saved to the database. The method also handles
   * validation errors and other potential issues during the database operation.
   *
   *
   * @param {Object} observerObject - The observer object to be added
   *  to the database.
   *
   * @returns {Promise<string|boolean>} A promise that resolves to the ID
   *  of the saved observer if successful, or `false` if there was an
   *  error during saving.
   *
   * @throws {Error} Will throw an error if there is a validation error or
   * any other type of error during the process of storing the observer.
   *
   * @example
   * const newObserver = {
   *   'publisherModule' : 'observerExamplePublisher',
   *   'publisherEvent' : 'helloWorld',
   *   'suscriberModule' : 'observerExampleSubscriber',
   *   'subscriberEvent' : 'subscriber2',
   *   'subscriberId' : 'we-are-creating-two-observers-with-this-id-so-only-one-is-called',
   * };
   * const observerId = await app.c('observers').addSubscriber(newObserver);
   * If observer exist then it will display
   * `observer already exists in the database.`
   *  and returns observer ID.
   * If observer doesn't exist then observer saved to database and returns id.
   * you can see message in console has `!! new observer saved to database !!`
   *
   */
   async addSubscriber(
    observerObject /*:: : Object */
  ) {
    try {
      // Check if the observerObject already exists in the database based
      // on a unique identifier (e.g., uuid or other field)
      const existingObserver = await this.getObserversModel().findOne(observerObject);
      if (existingObserver) {
        // If the observer already exists, return the existing UUID
        // or other appropriate response
        console.log("observer already exists in the database.");
        // Or return other relevant information from existingObserver
        return existingObserver.id;
      } else {
        const observer = await this.getObserversModel().create(observerObject);
        return observer.save().then(async (value)=> {
          console.log("!! new observer saved to database !!");
          return value.id;
        }).catch((err)=>{
          console.log(err);
          return false;
        });
      }
    } catch (error) {
      // Handle Mongoose validation errors
      if (error.name === 'ValidationError') {
        console.error('Validation Error:', error.message);
        throw new Error('Validation error occurred while storing subscriber.');
      }
      // Handle other types of errors
      console.error('Error storing observer:', error);
      throw new Error('An error occurred while storing subscriber.');
    }
  }

  /**
   * Fetches all observer documents from the database, optionally filtered
   *  by the provided criteria.
   *
   * This function retrieves a list of all observers from the database,
   * using Mongoose's `find` method.
   *
   * You can pass a filter object to specify conditions for the query. If no
   *  filter is provided, all observers will be returned.
   *
   * - If the query is successful, it returns an array of observer documents.
   * - If an error occurs during the query, it logs the error and returns `false`.
   *
   * @param {Object} [filter={}] - An optional object containing query
   *   conditions to filter the observers. If no filter is provided, all
   *   observers are fetched.
   *   Example: `{ publisherModule: 'observerExamplePublisher' }` to filter
   *   by publisherModule.
   *
   * @returns {Promise<Array|boolean>} - A promise that resolves to an array of
   *  observer objects if the query is successful, or `false` if an error occurs.
   *
   * @example
   * const allObservers = await app.c('observers').getAllObservers();
   * if (allObservers) {
   *   console.log('Fetched observers:', allObservers);
   * } else {
   *   console.log('Failed to fetch observers.');
   * }
   *
   * @example
   * const filteredObservers = await app.c('observers').getAllObservers(
   *   { publisherModule: 'observerExamplePublisher' }
   * );
   * console.log('Filtered observers:', filteredObservers);
   */
  async getAllObservers(filter = {}) {
    try {
      // Find all observers
      const observers = await this.getObserversModel().find(filter);
      return observers;
    } catch (err) {
      console.error('Error fetching observers:', err);
      return false;
    }
  }

  /**
   * Deletes an observer document from the database based on the provided observer ID.
   *
   * This function uses Mongoose's `findByIdAndDelete` method to locate and remove the observer from the database.
   * It returns a boolean indicating whether the observer was successfully deleted or not.
   *
   * - If an observer is found and deleted, it returns `true`.
   * - If no observer is found with the given ID, it returns `false`.
   * - If an error occurs during the operation, it logs the error
   *  and returns `false`.
   *
   * @param {string} observerId - The unique identifier (ID) of the
   *  observer to be deleted. This should be a valid MongoDB ObjectId string.
   *
   * @returns {Promise<boolean>} - A promise that resolves to `true` if the
   *  observer was deleted, or `false` if the observer was not found or
   *  an error occurred.
   *
   * @throws {Error} - If the deletion operation fails due to a database
   *  issue, it will log the error and return `false`.
   *
   * @example
   * // Replace with actual ObjectId
   * const observerIdToDelete = '5fdb97b44a5c2c55c7e63e23';
   *
   * await app.c('observers').deleteObserverByID(observerIdToDelete);
   * returns true if document deleted successfully
   * else it will display error.
   *
   */
  async deleteObserverByID(observerId) {
    try {
      // Delete the observer by ID
      const deletedObserver = await this.getObserversModel()
        .findByIdAndDelete(observerId);

      if (deletedObserver) {
        console.log('Deleted observer:', deletedObserver);
        return true;
      } else {
        console.log('observer not found.');
        return false;
      }
    } catch (err) {
      console.error('Error deleting observer:', err);
      return false;
    }
  }

  async run(app)  {
    return this;
  }
}

module.exports = new Observer();
