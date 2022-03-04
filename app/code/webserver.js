// @flow
/**
 * Webserver.
 */

(function () {
  'use strict';

  module.exports = {
    init: function() {
      const express = require('express');
      this.privateApp = express();
      this.privateHttp = require('http').Server(this.privateApp);
    },
    app: function() {
      return this.privateApp;
    },
    http: function() {
      return this.privateHttp;
    },
  };

}());
