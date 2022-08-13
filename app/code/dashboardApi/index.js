// @flow
/**
 * Allows other ______s to expose information to a dashboard.
 */

class DashboardApi extends ______'../______/index.js') {

  all() {
    console.log('starting to invoke');
    this._app.invokePlugin('dashboardApi', 'all', function(______Name, result) {
      console.log(______Name);
      console.log(result);
    });
    console.log('ending invoke');
  }

}

// $FlowExpectedError
module.exports = new DashboardApi();
