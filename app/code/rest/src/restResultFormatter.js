/**
 * Format results.
 */

class RestResultFormatter {

  formatAsJson(
    results /*:: : Object */
  ) /*:: : string */ {
    return JSON.stringify(this.format(results));
  }

  format(
    results /*:: : Object */
  ) /*:: : Object */ {
    return {
      meta: {
        length: results.length,
      },
      results: results,
    };
  }

}

module.exports = RestResultFormatter;
