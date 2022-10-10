// @flow
/**
 * Get all endpoints.
 */

class RestGetEndpointsEndpoint extends require('./restEndpoint.js') {

  name() {
    return 'Get all available endpoints';
  }

  endpoint() {
    return 'endpoints';
  }

  verb() {
    return 'GET';
  }

  authenticationMiddleware() {
    return this.publicAccessMiddleware();
  }

  result() {
    let ret = [];

    this._app.c('rest').endpoints().forEach((e) => {
      ret = ret.concat({
        name: e.name(),
        endpoint: e.fullEndpointPath(),
        verb: e.verb(),
      });
    });

    return ret;
  }

}

// $FlowExpectedError
module.exports = RestGetEndpointsEndpoint;
