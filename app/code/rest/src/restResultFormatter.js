// @flow
/**
 * Format results.
 */

class RestResultFormatter {

  formatAsJson(results) {
    return JSON.stringify(this.format(results));
  }

  format(results) {
    return {
      meta: {
        length: results.length,
      },
      results: results,
    };
  }

}

// $FlowExpectedError
module.exports = RestResultFormatter;
