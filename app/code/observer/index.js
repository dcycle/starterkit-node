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

    // Define the Subscription Info schema for each subscriptionId
    const subscriptionInfoSchema = new Schema({
      subscriberModule: { type: String, required: true },
      subscriberMethod: { type: String, required: true },
    }, { _id: false });

    // Define the main Publisher schema
    const ObserverSchema = new Schema({
      publisherModule: { type: String, required: true },
      publishedEvent: { type: String, required: true },
      subscriptionId: {
        type: Map,
        // Use array of subscriptionInfoSchema for each subscriptionKey
        of: [subscriptionInfoSchema],
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
   * @param {string} subscriptionId
   *   If an ID is passed here, the system will only add the subscriber if
   *   another subscriber with the same ID does not exist.
   */
  async subscribe(
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

    await this.addSubscribe(
      publisherModule,
      publishedEvent,
      subscriptionId,
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

    await this.runSubscriptions(publisherModule, publishedEvent, data);
  }

  async runSubscriptions(publisherModule, publishedEvent, data) {
    try {
      const publisher = await this.getObserversModel().findOne({
        "publisherModule": publisherModule,
        "publishedEvent": publishedEvent
      });

      if (!publisher) {
        console.log('Publisher not found');
        return;
      }

      // Traverse all subscriptionId entries
      publisher.subscriptionId.forEach((subscription) => {
        subscription.forEach(async (value) => {
          const module = value.subscriberModule;
          const method = value.subscriberMethod;
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

  async addSubscribe(
    publisherModule,
    publishedEvent,
    subscriptionKey,
    subscriptionData) {
    try {
      // Step 1: Find if the publisher already exists.
      let existingObserver = await this.getObserversModel().findOne(
        { publisherModule, publishedEvent }
      );
      if (existingObserver) {
        // Step 2: Publisher exists, check if the subscriptionKey exists
        if (existingObserver.subscriptionId.has(subscriptionKey)) {
          // If subscriptionKey exists, check if the subscription already exists
          const subscriptionArray = existingObserver.subscriptionId.get(subscriptionKey);

          // Check if the subscriptionData already exists
          const alreadyExists = subscriptionArray.some(
            (sub) => sub.subscriberModule === subscriptionData.subscriberModule &&
                    sub.subscriberMethod === subscriptionData.subscriberMethod
          );

          if (alreadyExists) {
            console.log("Subscription already exists, not pushing new data.");
          } else {
            // If subscription does not exist, push the new subscription data
            subscriptionArray.push(subscriptionData);
            await existingObserver.save();
            console.log('Subscription appended to existing key!');
          }
        } else {
          // If subscriptionKey doesn't exist, create a new key with the subscription data
          existingObserver.subscriptionId.set(subscriptionKey, [subscriptionData]);
          await existingObserver.save();
          console.log(subscriptionKey);
          console.log('New subscription key added!');
        }
      } else {
        // observer does not exist, create a new document with
        // the subscription key and data
        const observer = await this.getObserversModel()({
          publisherModule,
          publishedEvent,
          subscriptionId: {
            // Create an array for multiple subscriptions
            [subscriptionKey]: [subscriptionData]
          }
        });
        return observer.save().then(async (value)=> {
          console.log("!! new observer saved to database !!");
          return value.id;
        });
      }
    } catch (error) {
      console.error('Error adding subscription:', error);
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
