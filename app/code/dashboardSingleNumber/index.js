// @flow
/**
 * A dashboard element which displays a single number.
 */

class DashboardSingleNumber {
  toArray(untranslatedString, number) {
    return {
      type: 'DashboardSingleNumber',
      untranslatedString: untranslatedString,
      number: number,
    };
  }
}

// $FlowExpectedError
module.exports = new DashboardSingleNumber();
