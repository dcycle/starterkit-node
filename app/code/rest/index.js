// @flow
/**
 * REST API.
 */

class Rest extends require('../component/index.js') {

  dependencies() {
    return [
      './token/index.js',
      './express/index.js',
      './restApiBasicDocFormatter/index.js',
    ];
  }

  endpoints() {
    return this.results;
  }

  async init(
    app /*:: : Object */
  ) /*:: : Object */ {
    super.init(app);
    this.results = [];
  }

  path() {
    return this.app().config().modules['./rest/index.js'].path;
  }

  async run(
    app /*:: : Object */
  ) /*:: : Object */ {

    const that = this;

    this._app.invokePlugin('rest', 'endpoints', function(componentName, result) {
      that.results = that.results.concat(result);
    });

    app.c('express').addRoute('rest', 'get', this.path(), (req, res) => {
      res.send(app.c('restApiBasicDocFormatter').format(this));
    });

    this.endpoints().forEach((e) => {
      app.c('express').addMiddleware(e.constructor.name, e.verb().toLowerCase(), [
        e.authenticationMiddleware(),
      ]);
      app.c('express').addRoute(e.constructor.name, e.verb().toLowerCase(), e.fullEndpointPath(), (req, res) => {
        res.header('Content-Type', 'application/json');
        res.send(new (app.class('rest/restResultFormatter'))().formatAsJson(e.result(req)));
      });
    });
  }

}

// $FlowExpectedError
module.exports = new Rest();
