// @flow
/**
 * Get all endpoints.
 */

class RestEndpoint {

  constructor(app) {
    this._app = app;
  }

  name() {
    return 'Endpoint name not defined';
  }

  endpoint() {
    throw 'endpoint() is not defined.';
  }

  authenticationMiddleware() {
    throw 'you need to add an authentication middleware';
  }

  publicAccessMiddleware() {
    return (req, res, next) => {
      next();
    };
  }

  verb() {
    throw 'verb not defined.';
  }

  fullEndpointPath() {
    return this._app.c('rest').path() + '/' + this.endpoint();
  }

  result() {
    throw 'result not defined.';
  }

}

// $FlowExpectedError
module.exports = RestEndpoint;
