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
  events = {};
  /* jshint ignore:end */

  // subscribe a event handler
  subscribe(event, handler, moduleName) {
    if (this.isModuleEnabled(moduleName)) {
      if (!this.events[event]) {
        this.events[event] = [];
      }
      this.events[event].push({ handler, moduleName });
    }
  }

  // Check if the module is enabled
  isModuleEnabled(moduleName) {
    return this.app().config().modules['./' + moduleName + '/index.js'];
  }

  // publish the event for a specific event
  publish(event, data) {
    if (this.events[event]) {
      this.events[event].forEach(({ handler, moduleName }) => {
        if (this.isModuleEnabled(moduleName)) {
          console.log("____________handler___________________");
          console.log(handler);
          // Execute handler if module is enabled
          // subscribeToPublisher1
          this.app().c(moduleName)[handler](data);
        }
      });
    }
  }

  async run(app)  {
    return this;
  }
}

module.exports = new Observer();
