/**
 * Test database.js.
 *
 * See https://github.com/dcycle/docker-ava.
 */

(function () {
  'use strict';

  const test = require('ava');
  const sinon = require('sinon');

  const my = require('../app/database.js');

  test('URL is correct', t => {
    [
      {
        valid: true,
        expectError: false,
        expected: 'mongodb://MONGO_USER:MONGO_PASS@MONGO_HOST:MONGO_PORT/MONGO_DB?authSource=admin',
      },
      {
        valid: false,
        expectError: true,
      },
    ].forEach(function(data) {
      var stub1 = sinon.stub(my, 'env').returns({
        required: function(name) {
          if (data.valid) {
            return name;
          }
          throw Error('Environment variables are simulated as being invalid within unit test.');
        }
      });

      try {
        const output = my.url();
        t.true(!data.expectError);
      }
      catch (e) {
        t.true(data.expectError);
      }

      t.true(output == data.expected, output + '==' + data.expected);

      stub1.restore();
    });
  });
}());
