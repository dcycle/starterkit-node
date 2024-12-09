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

    const Schema = app.component('./database/index.js').mongoose().Schema;

    // Define the Subscriber Info schema for each subscribes
    const subscribeInfoSchema = new Schema({
      subscriberModule: { type: String, required: true },
      subscriberMethod: { type: String, required: true },
    }, { _id: false });

    // Define the main Publisher schema
    const ObserverSchema = new Schema({
      // 'publisherModule' is a string that represents the module where the event is published
      // It is required to specify which module is responsible for publishing the event
      publisherModule: { type: String, required: true },
      // 'publishedEvent' is a string that identifies the specific event
      // that has been published
      // It is required to track which event is being published by the module
      publishedEvent: { type: String, required: true },
      // 'subscribeId' stores a mapping of subscriber keys (subscribeId) to an array of subscriber information
      // Each subscriber key is associated with an array of 'subscribeInfoSchema' (each representing a subscriber's info)
      // This is required to track all the subscribers for a given published event
      subscribeId: {
        type: Map,
        // Use array of subscribeInfoSchema for each subscribeKey
        of: [subscribeInfoSchema],
        required: true
      },
    });

    this.observersModel = app.component('./database/index.js').mongoose()
    .model('observers', ObserverSchema);

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
    // this.observersModel().find({},(err, observers)=> {
    //   return observers;
    // });

    return this.observersModel;
  }

  // subscribe a event handler
  /**
   * @param {string} publisherModule
   *   A publisher module such as 'observerExamplePublisher'.
   * @param {string} publishedEvent
   *   A published event of which our subscriber should be notified, such
   *   as 'helloWorld'.
   * @param {string} subscriberModule
   *   A subscriber module such as 'observerExampleSubscriber'.
   * @param {string} subscriberMethod
   *   A method such as 'subscriber1' which should exist on
   *   'observerExampleSubscriber'.
   * @param {string} subscribeId
   *   If an ID is passed here, the system will only add the subscriber if
   *   another subscriber with the same ID does not exist.
   */
  async subscribe(
    publisherModule,
    publishedEvent,
    subscriberModule,
    subscriberMethod,
    subscribeId = ''
  ) {
    if (!this.isModuleEnabled(publisherModule)) {
      return;
    }
    if (!this.isModuleEnabled(subscriberModule)) {
      return;
    }
    if (!subscribeId) {
      subscribeId = this.uuid();
    }
    this.ensureStructureValid(
      publisherModule,
      publishedEvent,
    );

    this.subscribers[publisherModule][publishedEvent][subscribeId] = {
      subscriberModule: subscriberModule,
      subscriberMethod: subscriberMethod,
    };

    await this.addSubscribe(
      publisherModule,
      publishedEvent,
      subscribeId,
      {
        subscriberModule: subscriberModule,
        subscriberMethod: subscriberMethod
      }
    );
  }

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

  // publish the event for a specific event.
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
   * Executes the subscribers for a given publisher module and published event.
   * It retrieves the relevant subscribers information from the database and calls the
   * appropriate methods on the subscriber modules for each published event.
   *
   * @param {String} publisherModule - The name of the publisher module that triggered the event.
   * @param {String} publishedEvent - The name of the event that is being published.
   * @param {Object} data - The event data to be passed to each subscriber's method.
   *
   * @returns {void} - No return value. The function asynchronously calls subscriber methods.
   */
  async runSubscribers(publisherModule, publishedEvent, data) {
    try {
      const publisher = await this.getObserversModel().findOne({
        "publisherModule": publisherModule,
        "publishedEvent": publishedEvent
      });

      if (!publisher) {
        console.log('Publisher not found');
        return;
      }

      // Traverse all subscribeId entries
      publisher.subscribeId.forEach((subscribe) => {
        subscribe.forEach(async (value) => {
          const module = value.subscriberModule;
          const method = value.subscriberMethod;
          // Execute subscribers
          await this.app().c(module)[method](data);
        });
      });
    } catch (error) {
      console.error('Error querying publisher data:', error);
    }
  }

  /**
   * Get a UUID.
   *
   * @returns string
   *   A UUID.
   */
  uuid() {
    // Import UUID for generating unique conversation IDs.
    // @ts-ignore
    const { v4: uuidv4 } = require('uuid');
    return uuidv4();
  }

  /**
   * Adds a new subscriber to a publisher's event or appends the subscriber
   * to an existing publisher's event if it already exists. If the subscriber already
   * exists, no new subscriber is added.
   *
   * RUN db.observers.find().pretty(); in mongo db console to see the observers
   *  collection schema design.
   *
   * The method handles both the case where the publisher already exists and where
   * a new publisher needs to be created.
   *
   * @param {String} publisherModule - The name of the publisher module that is publishing the event.
   * @param {String} publishedEvent - The name of the event being published.
   * @param {String} subscribeKey - A unique identifier for the subscriber key (e.g., 'userService').
   * @param {Object} subscribeData - The subscriber data containing the subscriber module and method.
   *                               It should include:
   *                               - subscriberModule (String): The subscriber module (e.g., 'emailService').
   *                               - subscriberMethod (String): The method within the subscriber module (e.g., 'sendEmail').
   *
   * @returns {Promise<String|undefined>} - If a new observer is created, it returns the ID of the new observer.
   *                                         If the subscriber is appended to an existing observer, it returns `undefined`.
   */
  async addSubscribe(
    publisherModule,
    publishedEvent,
    subscribeKey,
    subscribeData) {
    try {
      // Step 1: Find if the publisher already exists.
      let existingObserver = await this.getObserversModel().findOne(
        { publisherModule, publishedEvent }
      );
      if (existingObserver) {
        // Step 2: Publisher exists, check if the subscribeKey exists
        if (existingObserver.subscribeId.has(subscribeKey)) {
          // If subscribeKey exists, check if the subscribe already exists
          const subscribeArray = existingObserver.subscribeId.get(subscribeKey);

          // Check if the subscribeData already exists
          const alreadyExists = subscribeArray.some(
            (sub) => sub.subscriberModule === subscribeData.subscriberModule &&
                    sub.subscriberMethod === subscribeData.subscriberMethod
          );

          if (alreadyExists) {
            console.log("Subscriber already exists, not pushing new data.");
          } else {
            // If subscribe does not exist, push the new subscribe data
            subscribeArray.push(subscribeData);
            await existingObserver.save();
            console.log('Subscriber appended to existing key!');
          }
        } else {
          // If subscribeKey doesn't exist, create a new key with the
          // subscribe data
          existingObserver.subscribeId.set(subscribeKey, [subscribeData]);
          await existingObserver.save();
          console.log(subscribeKey);
          console.log('New subscribe key added!');
        }
      } else {
        // observer does not exist, create a new document with
        // the subscribe key and data
        const observer = await this.getObserversModel()({
          publisherModule,
          publishedEvent,
          subscribeId: {
            // Create an array for multiple subscribes
            [subscribeKey]: [subscribeData]
          }
        });
        return observer.save().then(async (value)=> {
          console.log("!! new observer saved to database !!");
          return value.id;
        });
      }
    } catch (error) {
      console.error('Error adding subscribe:', error);
    }
  }

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

  async run(app)  {
    return this;
  }
}

module.exports = new Observer();
