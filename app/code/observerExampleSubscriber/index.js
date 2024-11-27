/**
 * Respond to triggered publish.
 */
 class ObserverExampleSubscriber extends require('../component/index.js') {

  subscriber1(data) {
    console.log('hello' + data); 
  };

  subscriber2(data) { 
    console.log('world' + data); 
  };

  async run(app)  {
    // subscriber1 listens to 'helloWorld-publisher'.
    app.c('observer').subscribe(
      'helloWorld-publisher',
      'subscriber1',
      'observerExampleSubscriber'
    );

    // subscriber2 listens to 'helloWorld-publisher'.
    app.c('observer').subscribe(
      'helloWorld-publisher',
      'subscriber2',
      'observerExampleSubscriber'
    );

    return this;
  }
}

module.exports = new ObserverExampleSubscriber();
