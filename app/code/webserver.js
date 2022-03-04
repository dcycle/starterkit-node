// @flow
/**
 * Webserver.
 */

(function () {
  'use strict';

  module.exports = {

    /** Initialize the webserver. */
    init: function() {
      const express = require('express');
      this.privateApp = express();
      this.privateHttp = require('http').Server(this.privateApp);
    },

    /** Get the app instance. */
    app: function() {
      return this.privateApp;
    },

    /** Get the http server instance. */
    http: function() {
      return this.privateHttp;
    },
  };

}());
