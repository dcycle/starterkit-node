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

  // subscriber a event handler
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
   * @param {string} subscriberId
   *   If an ID is passed here, the system will only add the subscriber if
   *   another subscriber with the same ID does not exist.
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
   * @returns {Promise<void>} - No return value. The function asynchronously calls subscriber methods.
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

  // Delete observer By ID.
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
