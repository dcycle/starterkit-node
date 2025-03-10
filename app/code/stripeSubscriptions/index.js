// @ts-check
// The TypeScript engine will check all JavaScript in this file.

/**
 * StripeSubscriptions storing functionality.
 */
class StripeSubscriptions extends require('../component/index.js') {

  /**
   * @property {Function} init Initializes this object.
   * @returns StripeSubscriptions
   */
  async init(app) {
    super.init(app);

    const Schema = app.component('./database/index.js').mongoose().Schema;
    // We are sending logged in user meta data to stripe. Stripe creates customer.
    // In stripeCustomerSchema we have to store user id and his respective stripe customer id.
    // For recurring payment(subscriptions) we have to created payment method for each customer
    // otherwise we get payment method not found error while subscribing plans.
    const stripeCustomerSchema = new Schema({
      // Reference to the User model
      userId: { type: Schema.Types.ObjectId, ref: 'userInfo' },
      customerId: String,
      paymentMethodId: String,
    });

    this.stripeCustomerModel = app.component('./database/index.js').mongoose().model('stripeCustomer', stripeCustomerSchema);

    return this;
  }

  // https://github.com/jshint/jshint/issues/3361
  /* jshint ignore:start */
  stripeCustomerModel;
  /* jshint ignore:end */

  getStripeCustomerModel() /*:: : Object */ {
    return this.stripeCustomerModel;
  }

  // Fetch All Stripe Customers from stripeCustomer collection.
  async getStripeCustomers() /*:: : Object */ {
    return await this.getStripeCustomerModel().find({});
  }

  /**
   * Finds an stripe customer by user id.
   *
   * @param {string} userInfoId - The ObjectId of the user to search.
   * @returns {Promise<Object|null>} - The stripe customer document if found, otherwise null.
   */
   async findStripeCustomerByUserId(userInfoId) {
    return await this.getStripeCustomerModel().findOne({ 'userId': userInfoId });
  }    

  // Initializing the Stripe API
  initStripeApi() {
    // secret Stripe API key required for the Stripe library, which is necessary for authenticating API requests.
    const stripeSecurityKey = this.app().config().modules['./stripeSubscriptions/index.js'].stripeSecurityKey;

    // @ts-expect-error
    const stripe = require('stripe')(stripeSecurityKey);
    return stripe;
  }

  /**
   * Returns the dependencies.
   * @returns {String[]}
   */
  dependencies() {
    return [
      // Dependency on express module
      './express/index.js',
      './database/index.js',
      './bodyParser/index.js',
      './env/index.js'
    ];
  }

  /**
   * Initialization method to set up middleware and routes
   */
   async run(app) {
    this.addPaymentMethodRoute(app);
    this.storePaymentMethodRoute(app);
    this.addSubscriptionPageRoute(app);
    this.createSubscriptionRoute(app);
    this.viewSubscriptionsRoute(app);
    this.cancelSubscriptionRoute(app);
    
    return this;
  }

  /**
   * Route to show UI for adding a payment method.
   * @param {Object} app - The application object to bind routes.
   */
  addPaymentMethodRoute(app) {
    app.c('express').addRoute(
      'addPaymentMethod',
      'get',
      '/add/payment-method', async (req, res) => {
        try {
          // Publishable keys which is used for client-side operations (e.g., for creating a Stripe checkout
          // or other interactions with the Stripe API that are intended to happen in the browser).
          // Publishable keys are safe to use on the front end.          
          const stripePublishableKey = this.app().config().modules['./stripeSubscriptions/index.js'].stripePublishableKey;
          res.render('addPaymentMethod', { stripePublishableKey });
        } catch (error) {
          console.error(error);
          res.status(500).send('addPaymentMethod get error');
        }
      }
    );
  }

  /**
   * Route to store the payment method for the user.
   * @param {Object} app - The application object to bind routes.
   */
  storePaymentMethodRoute(app) {
    app.c('express').addRoute(
      'addPaymentMethod',
      'post',
      '/store/payment-method',
      async (req, res) => {
        try {
          const { paymentMethodId } = req.body;

          if (!paymentMethodId) {
            return res.status(400).json({
              success: false,
              message: 'Payment method ID is required.'
            });
          }

          // We have to find Stripe Customer from Stripe Customer collection.
          // If Found proceed furthur to save payment method Id. Else we have
          // to create Customer in Stripe for currently logged in user.
          const savedStripeCustomer = await this.findStripeCustomerByUserId(req.user.id);
          let customerId;

          if (!savedStripeCustomer) {
            const newCustomerInStripe = await this.initStripeApi().customers.create({
              metadata: { user_id: req.user.id, username: req.user.username },
            });
            customerId = newCustomerInStripe.id;
            await this.storeStripeCustomer({ userId: req.user.id, customerId: customerId });
          } else {
            customerId = savedStripeCustomer.customerId;
          }

          const response = await this.addDefaultPaymentMethod(customerId, paymentMethodId);
          await this.updateStripeCustomer(req.user.id, customerId, paymentMethodId);

          res.status(200).json({
            success: true,
            message: 'Payment method added successfully.',
            data: response,
          });
        } catch (error) {
          console.error(error);
          res.status(500).json({
            success: false,
            message: 'An error occurred while adding the payment method.',
            error: error.message || error,
          });
        }
      }
    );
  }

  /**
   * Route to show products for subscription.
   * @param {Object} app - The application object to bind routes.
   */
  addSubscriptionPageRoute(app) {
    app.c('express').addRoute(
      'addSubscription',
      'get',
      '/account/subscriptions/add',
      async (req, res) => {
        try {
          const products = await this.getProducts();
          const productsWithPrices = [];

          for (let product of products.data) {
            const prices = await this.getPrices(product.id);
            productsWithPrices.push({
              product: product,
              prices: prices.data,
            });
          }

          res.render('addSubscription', { productsWithPrices });
        } catch (error) {
          console.error(error);
          res.status(500).send('An error occurred');
        }
      }
    );
  }

  /**
   * Route to create a subscription.
   * fetch customer from stripeCustomer collection and create subscriptions in stripe
   *
   * @param {Object} app - The application object to bind routes.
   */
  createSubscriptionRoute(app) {
    app.c('express').addRoute(
      'createSubscription',
      'post',
      '/account/subscriptions/add',
      async (req, res) => {
        try {
          const { priceId } = req.body;
          if (!priceId) {
            return res.status(400).json({
              success: false,
              message: 'Price ID is required.',
            });
          }

          const savedStripeCustomer = await this.findStripeCustomerByUserId(req.user.id);
          if (!savedStripeCustomer) {
            return res.status(404).json({
              success: false,
              message: 'Stripe customer not found for the user.',
            });
          }

          const subscription = await this.initStripeApi().subscriptions.create({
            customer: savedStripeCustomer.customerId,
            items: [{
              price: priceId,
            }],
            expand: ['latest_invoice.payment_intent'],
          });

          res.status(200).json({
            success: true,
            message: 'Subscription created successfully.',
          });
        } catch (error) {
          console.error('Error creating subscription:', error);
          res.status(500).json({
            success: false,
            message: 'An error occurred while creating the subscription.',
            error: error.message || error,
          });
        }
      }
    );
  }

  /**
   * Route to view all subscriptions for a user.
   * we have to find userIds of merged account and then
   *  show subscriptions of a logged in customer directly from stripe
   *
   * @param {Object} app - The application object to bind routes.
   */
  viewSubscriptionsRoute(app) {
    app.c('express').addRoute(
      'viewStripeSubscriptionsList',
      'get',
      '/account/subscriptions',
      async (req, res) => {
        try {
          const mergeduserIds = await app.c('accountFramework').getUserIdsOfMergedAccounts(req.user.id);
          const subscriptionsWithProducts = [];

          for (const userId of mergeduserIds) {
            const savedStripeCustomer = await this.findStripeCustomerByUserId(userId);

            if (savedStripeCustomer) {
              const subscriptions = await this.initStripeApi().subscriptions.list({
                customer: savedStripeCustomer.customerId,
              });

              if (subscriptions.data.length === 0) {
                return res.render('subscriptions', {
                    message: 'No subscriptions. Add a subscription.',
                    subscriptionsWithProducts: []                
                  });
              }

              const subscriptionWithProducts = await Promise.all(subscriptions.data.map(async (subscription) => {
                const productDetails = await Promise.all(subscription.items.data.map(async (item) => {
                  const price = item.price;
                  const product = await this.initStripeApi().products.retrieve(price.product);
                  return {
                    productId: product.id,
                    productName: product.name,
                    productDescription: product.description,
                    priceId: price.id,
                    priceAmount: price.unit_amount / 100,
                    currency: price.currency,
                  };
                }));

                return {
                  subscriptionId: subscription.id,
                  status: subscription.status,
                  customerId: subscription.customer,
                  subscriptionCreated: subscription.created,
                  subscriptionCurrentPeriodEnd: subscription.current_period_end,
                  subscriptionCurrentPeriodStart: subscription.current_period_start,
                  productDetails,
                };
              }));

              subscriptionsWithProducts.push(...subscriptionWithProducts);
            }
          }

          if (subscriptionsWithProducts.length > 0) {
            return res.render('subscriptions', {
              message: 'Your subscriptions are:',
              subscriptionsWithProducts: subscriptionsWithProducts
            });
          } else {
            return res.render('subscriptions', {
              message: 'No subscriptions found for this account',
              subscriptionsWithProducts: []
            });
          }
        } catch (error) {
          console.error('Error fetching subscriptions:', error);
          res.status(500).json({
            success: false,
            message: 'An error occurred while fetching subscriptions.',
            error: error.message || error,
          });
        }
      }
    );
  }

  /**
   * Route to cancel a subscription.
   * @param {Object} app - The application object to bind routes.
   */
  cancelSubscriptionRoute(app) {
    app.c('express').addRoute(
      'cancelSubscription',
      'post',
      '/account/subscriptions/cancel',
      async (req, res) => {
        const subscriptionId = req.body.subscriptionId;
        try {
          await this.initStripeApi().subscriptions.cancel(subscriptionId);
          res.redirect('/account/subscriptions');
        } catch (error) {
          console.error('Error canceling subscription:', error);
          res.status(500).json({
            success: false,
            message: 'Failed to cancel subscription. ' + subscriptionId,
            error: error.message || error,
          });
        }
      }
    );
  }

  // Fetch products from Stripe
  async getProducts() {
    const products = await this.initStripeApi().products.list();
    console.log(products);
    return products;
  }

  // Fetch prices for a specific product from stripe
  async getPrices(productId) {
    const prices = await this.initStripeApi().prices.list({
      product: productId,
    });
    console.log(prices);
    return prices;
  }

  // Update payment method id of a user in stripe customer collection.
  async updateStripeCustomer(userId, customerId, newPaymentMethodId) {
    try {
      // Get the Mongoose model
      const StripeCustomerModel = this.getStripeCustomerModel();
  
      // Find the StripeCustomer by userId and customerId
      const stripeCustomer = await StripeCustomerModel.findOne({ userId, customerId });
  
      // If no customer is found, throw an error
      if (!stripeCustomer) {
        throw new Error('Stripe customer not found');
      }

      // Update the paymentMethodId with the new one
      stripeCustomer.paymentMethodId = newPaymentMethodId;
  
      // Save the updated StripeCustomer
      await stripeCustomer.save();
  
      console.log("Stripe Customer updated successfully!");
  
      // Return the updated StripeCustomer
      return stripeCustomer;
    } catch (error) {
      // Log the error and throw it to be handled by the caller
      console.error("Error updating StripeCustomer:", error);
      throw new Error("Failed to update StripeCustomer");
    }    
  }

  // Store Stripe Customer details for currently logged in user.
  async storeStripeCustomer(stripeCustomerData) {
    try {
      // Get the Mongoose model and create a new instance with the stripeCustomerObject
      const StripeCustomerModel = this.getStripeCustomerModel();
      const saveStripeCustomer = new StripeCustomerModel(stripeCustomerData);
      // Save the token to the database
      await saveStripeCustomer.save();

      console.log("Stripe Customer saved!!!");
      // Return success message
      return saveStripeCustomer;
    } catch (error) {
      // Log the error and throw it to be handled by the caller
      console.error("Error saving saveStripeCustomer:", error);
      throw new Error("Failed to save saveStripeCustomer");
    }
  }

  // Function to add a default payment method of a user in Stripe
  async addDefaultPaymentMethod(customerId, paymentMethodId) {
    try {
      // Step 1: Attach the payment method to the customer
      await this.initStripeApi().paymentMethods.attach(paymentMethodId, {
        customer: customerId, // The user's Stripe customer ID
      });

      // Step 2: Set the payment method as the default payment method
      await this.initStripeApi().customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId, // Set the default payment method
        },
      });

      console.log(`Default payment method set successfully for customer: ${customerId}`);
    } catch (error) {
      console.error('Error adding default payment method:', error.message);
    }
  }

}

module.exports = new StripeSubscriptions();
