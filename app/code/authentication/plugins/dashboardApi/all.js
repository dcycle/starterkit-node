// @flow

/**
 * Authentication Dahsboard Api All plugin.
 */
class PluginAuthenticationDashboardApiAll {
  invoke(app, callback) {
    var that = this;
    setTimeout(function() {
      callback([
        app.c('DashboardSingleNumber').toArray('User accounts', Math.floor(Math.random() * 100)),
      ]);
    }, 1050);
  }
}

// $FlowExpectedError
module.exports = new PluginAuthenticationDashboardApiAll();
