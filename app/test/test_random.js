/**
 * Test random.js.
 *
 * Use Mocha, Chai and Sinon to run unit tests on ./app/code/random.js.
 *
 * To run these these tests, install Docker and type:
 *
 *     ./scripts/unit-tests-node.sh
 */

(function () {
  'use strict';

  var expect = require('chai').expect;
  var log = require('../app/random.js');
  var sinon = require('sinon');
  var fs = require('fs');

  /**
   * Test addTwoNumbers().
   */
  describe('addTwoNumbers()', function () {
    /**
     * Data provider for this test.
     */
    const assertions = [
      { first: 5, second: 1 },
      { first: -10000, second: -80 },
      { first: -99999, second: -99999 },
    ];

    /**
     * Test logic to test addTwoNumbers().
     */
    assertions.forEach(({first, second}) => {
      describe(`Adding ${first} and ${second}`, function() {
        var result = first + second;
        it(`should return ${result}`, function() {
          var sum2 = log.addTwoNumbers(first, second);
          expect(sum2).to.be.equal(result);
        });
      });
    });
  });
}());
