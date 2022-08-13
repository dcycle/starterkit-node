// @flow
/**
 * A dashboard element which displays a single number.
 */

class DashboardSingleNumber extends require('./dashboardElement.js') {
  constructor(
    title /*:: : string */,
    number /*:: : number */
  ) {
    super();
    // $FlowFixMe
    this._title = title;
    // $FlowFixMe
    this._number = number;
  }
  getTitle() /*:: : string */ {
    // $FlowFixMe
    return this._title;
  }
  getNumber() /*:: : number */ {
    // $FlowFixMe
    return this._number;
  }
}

// $FlowExpectedError
module.exports = DashboardSingleNumber;
