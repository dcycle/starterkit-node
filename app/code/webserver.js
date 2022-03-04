/**
 * Webserver.
 */

(function () {
  'use strict';

  const express = require('express');
  const app = express();
  const http = require('http').Server(app);

  module.exports = {
    app: function() {
      return app;
    },
    http: function() {
      return http;
    },
  };

}());
