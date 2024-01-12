/**
 * Get all endpoints.
 */

class RestGetEndpointsEndpoint extends require('./restEndpoint.js') {

  name() /*:: : string */ {
    return 'Get all available endpoints';
  }

  endpoint() /*:: : string */ {
    return 'endpoints';
  }

  verb() /*:: : string */ {
    return 'GET';
  }

  authenticationMiddleware() /*:: : Object */ {
    return this.publicAccessMiddleware();
  }

  result() /*:: : Object */ {
    const app = this._app;

    let ret = [];

    app.c('rest').endpoints().forEach((e) => {
      ret.push({
        name: e.name(),
        endpoint: e.fullEndpointPath(),
        verb: e.verb(),
      });
    });

    return ret;
  }

}

module.exports = RestGetEndpointsEndpoint;
