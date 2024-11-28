/**
  it will publish a event, and it will say something like:
  hookManagerExamplePublisher is performing an action, and will trigger a hook.
  hookManagerExamplePublisher has just triggered hooks.
  When you do
  app.component('hookManagerExamplePublisher').helloWorld();
 *
 */
class ObserverExamplePublisher extends require('../component/index.js') {

  // Example method to publish event.
  async helloWorld() {
    console.log("ObserverExamplePublisher is performing an action, and will trigger a publish.");
    // trigger 'helloWorld-publisher' so that listeners respond to it.
    await this.app().c('observer').publish(
      'observerExamplePublisher',
      'helloWorld',
      '',
    );
    console.log("ObserverExamplePublisher has published.");
  }

}

// await app.c('observerExamplePublisher').helloWorld();
module.exports = new ObserverExamplePublisher();
