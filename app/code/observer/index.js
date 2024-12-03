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

    this.subscribersModel = app.component('./database/index.js')
      .mongoose().model('subscribers', {
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
        subscriptionId: {
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
  /* jshint ignore:end */

  collection() {
    return this.app().c('database').client()
      .db('login')
      .collection('subscribers');
  }

  /**
   * Fetch the "subscribers" model.
   */
   getSubscribersModel() {
    // Sample usage:
    // this.subscribers().find({},(err, observers)=> {
    //   return observers;
    // });

    return this.subscribersModel;
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

    this.storeSubscriber({
      "publisherModule": publisherModule,
      "publishedEvent": publishedEvent,
      "subscriberModule": subscriberModule,
      "subscriberMethod": subscriberMethod,
      "subscriptionId": subscriptionId
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
   * Adds a new subscriber to the database.
   *
   * @param {Object} subscriberObject - The subscriber object to be added to the database.
   *
   * @returns {Promise<string|boolean>} A promise that resolves to the ID of the
   * saved subscriber if successful, or `false` if there was an error during saving.
   *
   * @throws {Error} Will throw an error if there is a validation error or any other
   * type of error during the process of storing the subscriber.
   */
   async storeSubscriber(
    subscriberObject /*:: : Object */
  ) {
    try {
      // Check if the subscriberObject already exists in the database.
      const existingSubscriber = await this.getSubscribersModel().findOne(subscriberObject);

      if (existingSubscriber) {
        // If the subscriber already exists, return the existing ID
        // or other appropriate response.
        console.log("subscriber already exists in the database.");
        return existingSubscriber.id;
      } else {
        const subscriber = await this.getSubscribersModel()(subscriberObject);
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
      console.error('Error storing observer:', error);
      throw new Error('An error occurred while storing subscriber.');
    }
  }

  async run(app)  {
    return this;
  }
}

module.exports = new Observer();
