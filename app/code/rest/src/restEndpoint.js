/**
 * Get all endpoints.
 */

class RestEndpoint {

  constructor(
    app /*:: : Object */
  ) {
    this._app = app;
  }

  name() /*:: : string */ {
    return 'Endpoint name not defined';
  }

  endpoint() /*:: : string */ {
    throw 'endpoint() is not defined.';
  }

  authenticationMiddleware() {
    throw 'you need to add an authentication middleware';
  }

  publicAccessMiddleware() /*:: : function */ {
    return (req, res, next) => {
      next();
    };
  }

  verb() /*:: : string */ {
    throw 'verb not defined.';
  }

  fullEndpointPath() /*:: : string */{
    const app = this._app;

    return app.c('rest').path() + '/' + this.endpoint();
  }

  result() {
    throw 'result not defined.';
  }

}

module.exports = RestEndpoint;
