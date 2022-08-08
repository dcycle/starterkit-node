// @flow

/**
 * Chat Dahsboard Api All plugin.
 */
class PluginChatDashboardApiAll {
  invoke(app) {
    console.log('invoking')
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve("GeeksforGeeks");
      }, 1000);
    });
  }
}

// $FlowExpectedError
module.exports = new PluginChatDashboardApiAll();
