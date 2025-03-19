// @ts-check
// The TypeScript engine will check all JavaScript in this file.

/**
 * Dashboard UI.
 */
 class DashboardUI extends require('../component/index.js') {

  /**
   * Returns the dependencies.
   * @returns {String[]}
   */
  dependencies() {
    return [
      // Dependency on express module
      './express/index.js',
    ];
  }

  /**
   * Initialization method to set up middleware and routes
   */
   async run(app) {
    this.dashboardUIRoute(app);

    return this;
  }

  /**
   * Route to show dashboard UI.
   * @param {Object} app - The application object to bind routes.
   */
   dashboardUIRoute(app) {
    app.c('express').addRoute(
      'dashboardUI',
      'get',
      '/dashboardui', async (req, res) => {
        try {
          res.status(200).send('This is where the admin dashboard will be');
        } catch (error) {
          console.error(error);
          res.status(500).send('error in dashboard UI');
        }
      }
    );
  }

}

module.exports = new DashboardUI();
