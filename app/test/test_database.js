/**
 * Test database.js.
 *
 * See https://github.com/dcycle/docker-ava.
 */

(function () {
  'use strict';

  const test = require('ava');
  const sinon = require('sinon');

  const my = require('/mycode/database.js');

  test('URI is correct', t => {
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
        const output = my.uri();
        t.true(!data.expectError);
        t.true(output == data.expected, output + '==' + data.expected);
      }
      catch (e) {
        t.true(data.expectError);
        t.true(typeof output === 'undefined', 'output should be undefined');
      }

      stub1.restore();
    });
  });
}());
