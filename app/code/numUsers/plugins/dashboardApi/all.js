// @flow

/**
 * Authentication Dahsboard Api All plugin.
 */
class PluginNumUsersDashboardApiAll {
  invoke(app, callback) {
    callback([
      new (app.class('dashboardApi/dashboardSingleNumber'))('Users connected', app.c('numUsers').numUsers()),
    ]);
  }
}

// $FlowExpectedError
module.exports = new PluginNumUsersDashboardApiAll();
