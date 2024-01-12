/**
 * A dashboard element which displays a single number.
 */

class DashboardSingleNumber extends require('./dashboardElement.js') {
  constructor(
    title /*:: : string */,
    number /*:: : number */
  ) {
    super();
    this._title = title;
    this._number = number;
  }
  getTitle() /*:: : string */ {
    return this._title;
  }
  getNumber() /*:: : number */ {
    return this._number;
  }
}

module.exports = DashboardSingleNumber;
