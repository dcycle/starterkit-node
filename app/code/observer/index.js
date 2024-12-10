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

    this.observersModel = app.component('./database/index.js')
    .mongoose().model('observers', {
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

    await this.addSubscriber({
      "publisherModule": publisherModule,
      "publishedEvent": publishedEvent,
      "subscriberModule": subscriberModule,
      "subscriberMethod": subscriberMethod,
      "subscriberId": subscriberId
    });
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
      const publisher = await this.getObserversModel().aggregate([
        // Step 1: Filter by publisherModule and publishedEvent
        {
          $match: {
            publisherModule: publisherModule,
            publishedEvent: publishedEvent
          }
        },

        // Step 2: Group by subscriberId
        {
          $group: {
            // Group by subscriberId
            _id: "$subscriberId",
            subscriberModules: { $addToSet: "$subscriberModule" },   // Collect unique subscriberModule values for each group
            subscriberMethods: { $addToSet: "$subscriberMethod" }    // Collect unique subscriberMethod values for each group
          }
        },

        // Step 3: Project to select only the subscriberModule and subscriberMethod
        {
          $project: {
            _id: 0,  // Exclude _id from the result
            subscriberModule: { $first: "$subscriberModules" },  // Get the first subscriberModule in each group

            subscriberMethod: { $first: "$subscriberMethods" }          }
        }
      ]);

      if (!publisher) {
        console.log('Publisher not found');
        return;
      }
      console.log('----Publisher  found----');
      console.log(publisher);

      // for (const subscriberId in subscribers) {
      //   // if (subscribers.hasOwnProperty(subscriberId)) {
      //     const module = subscribers[subscriberId].subscriberModule;
      //     const method = subscribers[subscriberId].subscriberMethod;
      //     this.app().c(module)[method](data);
      //   // }
      // }

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
   * Adds a new subscriber to the database.
   *
   * @param {Object} observerObject - The observer object to be added to the database.
   * The object should not contain a `uuid` property as it will be automatically generated.
   *
   * @returns {Promise<string|boolean>} A promise that resolves to the ID of the
   * saved observer if successful, or `false` if there was an error during saving.
   *
   * @throws {Error} Will throw an error if there is a validation error or any other
   * type of error during the process of storing the observer.
   */
   async addSubscriber(
    observerObject /*:: : Object */
  ) {
    try {
      // Check if the observerObject already exists in the database based on a unique identifier (e.g., uuid or other field)
      const existingObserver = await this.getObserversModel().findOne(observerObject);
      console.log("******** Existing Subscriber2 *******");
      console.log(existingObserver);

      if (existingObserver) {
        // If the subscriber already exists, return the existing UUID or other appropriate response
        console.log("subscriber already exists in the database.");
        // Or return other relevant information from existingObserver
        return existingObserver.id;
      } else {
        const subscriber = await this.getObserversModel()(observerObject);
        return subscriber.save().then(async (value)=> {
          console.log("!! subscriber saved to database !!");
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
      // console.error('Error storing observer:', error);
      throw new Error('An error occurred while storing subscriber.');
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
