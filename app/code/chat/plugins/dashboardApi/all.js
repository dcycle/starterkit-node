// @flow

/**
 * Chat Dahsboard Api All plugin.
 */
class PluginChatDashboardApiAll {
  invoke(app, callback) {
    var that = this;
    setTimeout(function() {
      callback([
        app.c('DashboardSingleNumber').toArray('Chat messages', Math.floor(Math.random() * 100)),
      ]);
    }, 2000);
  }
}

// $FlowExpectedError
module.exports = new PluginChatDashboardApiAll();
