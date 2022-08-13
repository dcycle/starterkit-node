// @flow
/**
 * Allows other services to expose information to a dashboard.
 */

class DashboardApi extends require('../service/index.js') {

  all() {
    console.log('starting to invoke');
    this._app.invokePlugin('dashboardApi', 'all', function(serviceName, result) {
      console.log(serviceName);
      console.log(result);
    });
    console.log('ending invoke');
  }

}

// $FlowExpectedError
module.exports = new DashboardApi();
