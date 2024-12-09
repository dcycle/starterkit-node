/**
 * Respond to triggered publish.
 */
 class ObserverExampleSubscriber extends require('../component/index.js') {

  subscriber1(data) {
    console.log('hello' + data);
  }

  subscriber2(data) {
    console.log('world' + data);
  }

  async run(app)  {
    // subscriber1 listens to 'helloWorld-publisher'.
    await app.c('observer').subscribe(
      'observerExamplePublisher',
      'helloWorld',
      'observerExampleSubscriber',
      'subscriber1',
      // We are not passing any id here, so if we subscribe several times,
      // subscriber1() will be called several times.
    );

    // subscriber1 listens to 'helloWorld-publisher'.
    await app.c('observer').subscribe(
      'observerExamplePublisher',
      'helloWorld',
      'observerExampleSubscriber',
      'subscriber1',
      // We are not passing any id here, so if we subscribe several times,
      // subscriber1() will be called several times.
    );

    // subscriber2 listens to 'helloWorld-publisher'.
    await app.c('observer').subscribe(
      'observerExamplePublisher',
      'helloWorld',
      'observerExampleSubscriber',
      'subscriber2',
      'we-are-creating-two-observers-with-this-id-so-only-one-is-called',
    );

    // subscriber2 listens to 'helloWorld-publisher'.
    await app.c('observer').subscribe(
      'observerExamplePublisher',
      'helloWorld',
      'observerExampleSubscriber',
      'subscriber2',
      'we-are-creating-two-observers-with-this-id-so-only-one-is-called',
    );

    return this;
  }
}

module.exports = new ObserverExampleSubscriber();
