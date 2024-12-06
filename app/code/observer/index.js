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

    // Subscription schema to hold the subscriptionModule
    // and subscriptionMethod
    const SubscriptionSchema = new Schema({
      subscriptionModule: { type: String, required: true },
      subscriptionMethod: { type: String, required: true },
    });

    // PublisherMethod schema to hold multiple subscriptions
    // with their respective IDs
    const publishedEventSchema = new Schema({
      // Dynamic keys to represent subscriptionId as a key-value pair
      subscriptionsId: {
        type: Map,
        of: SubscriptionSchema,
      },
    });

    // PublisherModule schema that holds multiple publisher methods
    const PublisherModuleSchema = new Schema({
      publishedEvent: {
        type: Map,
        of: publishedEventSchema,
      },
    });

    // Root schema to hold multiple publisher modules
    const ObserverSchema = new Schema({
      publisherModules: {
        type: Map,
        of: PublisherModuleSchema,
      },
    });

    this.observersModel = app.component('./database/index.js')
      .mongoose().model('observers', ObserverSchema);

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
   * @param {string} subscriptionId
   *   If an ID is passed here, the system will only add the subscriber if
   *   another subscriber with the same ID does not exist.
   */
  subscribe(
    publisherModule,
    publishedEvent,
    subscriberModule,
    subscriberMethod,
    subscriptionId = '',
  ) {
    if (!this.isModuleEnabled(publisherModule)) {
      return;
    }
    if (!this.isModuleEnabled(subscriberModule)) {
      return;
    }
    if (!subscriptionId) {
      subscriptionId = this.uuid();
    }
    this.ensureStructureValid(
      publisherModule,
      publishedEvent,
    );

    this.subscribers[publisherModule][publishedEvent][subscriptionId] = {
      subscriberModule: subscriberModule,
      subscriberMethod: subscriberMethod,
    };

    this.storeObserver({
      publisherModule: {
        publishedEvent:
        { subscriptionId: {
          subscriberModule: subscriberModule,
          subscriberMethod: subscriberMethod
        }}}
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
  publish(publisherModule, publishedEvent, data) {
    if (!this.isModuleEnabled(publisherModule)) {
      return;
    }
    this.ensureStructureValid(
      publisherModule,
      publishedEvent,
    );

    // https://stackoverflow.com/a/7241901
    const subscribers = this.subscribers[publisherModule][publishedEvent];
    for (const subscriberId in subscribers) {
      if (subscribers.hasOwnProperty(subscriberId)) {
        const module = subscribers[subscriberId].subscriberModule;
        const method = subscribers[subscriberId].subscriberMethod;
        this.app().c(module)[method](data);
      }
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
   * Adds a new observer to the database.
   *
   * @param {Object} observerObject - The observer object to be added to the database.
   *
   * @returns {Promise<string|boolean>} A promise that resolves to the ID of the
   * saved observer if successful, or `false` if there was an error during saving.
   *
   * @throws {Error} Will throw an error if there is a validation error or any other
   * type of error during the process of storing the observer.
   */
   async storeObserver(
    observerObject /*:: : Object */
  ) {
    try {
      // Check if the observerObject already exists in the database.
      const existingObserver = await this.getObserversModel().findOne(observerObject);

      if (existingObserver) {
        // If the observer already exists, return the existing ID
        // or other appropriate response.
        console.log("observer already exists in the database.");
        return existingObserver.id;
      } else {
        const observer = await this.getObserversModel()(observerObject);
        return observer.save().then(async (value)=> {
          console.log("!! observer saved to database !!");
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
        throw new Error('Validation error occurred while storing observer.');
      }
      // Handle other types of errors
      console.error('Error storing observer:', error);
      throw new Error('An error occurred while storing observer.');
    }
  }

  async getAllObserverrs(filter = {}) {
    try {
      // Find all observers
      const observers = await this.getObserversModel().find(filter);
      return observers;
    } catch (err) {
      console.error('Error fetching observers:', err);
      return false;
    }
  }

  // Delete observer By ID
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
