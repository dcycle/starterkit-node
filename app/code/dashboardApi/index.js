// @flow
/**
 * Allows other components to expose information to a dashboard.
 */

class DashboardApi extends require('../component/index.js') {

  all() {
    console.log('starting to invoke');
    this._app.invokePlugin('dashboardApi', 'all', function(result) {
      console.log('yyyyy');
      console.log(result);
    });
    console.log('ending invoke');
  }

}

// $FlowExpectedError
module.exports = new DashboardApi();
