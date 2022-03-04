// @flow
/**
 * Webserver.
 */

'use strict';

module.exports = {

  /** Initialize the webserver. */
  init: function() {
    // $FlowExpectedError
    const express = require('express');
    this.privateApp = express();
    // $FlowExpectedError
    this.privateHttp = require('http').Server(this.privateApp);
    return this;
  },

  /** Get the app instance. */
  app: function() /*:: : Object */ {
    return this.privateApp;
  },

  /** Get the http server instance. */
  http: function() /*:: : Object */ {
    return this.privateHttp;
  },
};
