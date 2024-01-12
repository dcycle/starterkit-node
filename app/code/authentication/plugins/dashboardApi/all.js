/**
 * Authentication Dahsboard Api All plugin.
 */
class PluginAuthenticationDashboardApiAll {
  invoke(app, callback) {
    app.c('authentication').userDetails().find({})
      .then((users) => {
        callback([
          new (app.class('dashboardApi/dashboardSingleNumber'))('User accounts', users.length),
        ]);
      });
  }
}

module.exports = new PluginAuthenticationDashboardApiAll();
