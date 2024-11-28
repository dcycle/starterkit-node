/**
 * "Observer" that will allow you to subscribe, enable, and disable events
 * dynamically. The Observer will act like a registry for events, and you
 * can trigger them when the relevant event occurs
 * (e.g., receiving a Twilio webhook).
 *
 */
 class Observer extends require('../component/index.js') {

  // https://github.com/jshint/jshint/issues/3361
  /* jshint ignore:start */
  subscribers = {};
  /* jshint ignore:end */

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

  // publish the event for a specific event
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
   * Returns the dependencies required by the chatbot.
   * @returns {String[]} Array of dependency paths.
   */
    dependencies() {
      return [
        // UUID library dependency
        'uuid'
      ];
    }

  async run(app)  {
    return this;
  }
}

module.exports = new Observer();
