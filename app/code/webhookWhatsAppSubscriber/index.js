/**
 * Respond to triggered publish.
 */
 class WebhookWhatsAppSubscriber extends require('../component/index.js') {

  /**
   * Processes a received message by storing it in the database and sending a
   * confirmation message.
   *
   * This method takes the data of a received message, stores it in the database,
   *  and then sends a confirmation message back to the sender. The confirmation message
   *  is sent using the `whatsAppSend` service, which is accessed via the
   *  app's configuration.
   *
   * The process is as follows:
   * 1. The message details are passed to the `storeInMessageDetail` method
   *  for persistence.
   * 2. A confirmation message is then sent to the specified recipient using
   *  the `whatsAppSend` service.
   *
   * @param {Object} data - The data object containing the message object.
   *
   * @returns {Promise<void>} A promise that resolves once both the message has been
   *  stored and the confirmation has been sent.
   */
   async processReceivedMessage(data) {    
    await this.app().c('webhookWhatsApp').storeInMessageDetail(data);
    // Send Confirmation message.
    await this.app().c('whatsAppSend').parsepropertySendMessage(
      '{"message":"!! WELL RECIEVED !!" , "sendTo":"+' + data.WaId + '"}'
    );
  }

  async run(app)  {
    // processReceivedMessage listens to 'messageHasBeenReceived'.
    app.c('observer').subscribe(
      'webhookWhatsApp',
      'messageHasBeenReceived',
      'webhookWhatsAppSubscriber',
      'processReceivedMessage',
      // We are not passing any id here, so if we subscribe several times,
      // subscriber1() will be called several times.
    );

    return this;
  }
}

module.exports = new WebhookWhatsAppSubscriber();
