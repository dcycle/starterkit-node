// @flow

/**
 * Authentication Dahsboard Api All plugin.
 */
class PluginAuthenticationDashboardApiAll {
  invoke(app, callback) {
    app.service('authentication').userDetails().find({},(err, users)=> {
      callback([
        new (app.class('dashboardApi/dashboardSingleNumber'))('User accounts', users.length),
      ]);
    });
  }
}

// $FlowExpectedError
module.exports = new PluginAuthenticationDashboardApiAll();
