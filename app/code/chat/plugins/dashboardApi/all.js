// @flow

/**
 * Chat Dahsboard Api All plugin.
 */
class PluginChatDashboardApiAll {
  invoke(app, callback) {
    app.c('chat').message().find({},(err, messages)=> {
      callback([
        new (app.class('dashboardApi/dashboardSingleNumber'))('Chat messages', messages.length),
      ]);
    });
  }
}

// $FlowExpectedError
module.exports = new PluginChatDashboardApiAll();
