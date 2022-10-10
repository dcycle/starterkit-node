// @flow

/**
 * An endpoint to display all endpoints.
 */
class PluginRestRestEndpoint {
  invoke(app, callback) {
    callback([
      new (app.class('rest/restGetEndpointsEndpoint'))(app),
    ]);
  }
}

// $FlowExpectedError
module.exports = new PluginRestRestEndpoint();
