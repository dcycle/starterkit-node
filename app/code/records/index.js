// @flow
/**
 * Manage records in the database.
 */

class Records extends require('../component/index.js') {

  dependencies() {
    return [
      './database/index.js',
    ];
  }

  async create(data) {
    await this.details().register({username: username, active: false}, password);
  }

  structure() {
    throw new Exception('Please override.')
  }

  tableName() {
    throw new Exception('Please override.')
  }

  /** Get details model. */
  details() /*:: : Object */ {
    this.assertFlag('initialized', true);

    // $FlowExpectedError
    return this.myDetails;
  }

  async init(
    app /*:: : Object */
  ) /*:: : Object */ {
    super.init(app);

    const Schema = app.component('./database/index.js').mongoose().Schema;
    const Detail = new Schema(this.structure());

    // $FlowExpectedError
    this.myDetails = app.c('database').mongoose().model(this.tableName(), Detail, this.tableName());

    this.setFlagBool('initialized', true);

    return this;
  }


}

// $FlowExpectedError
module.exports = new Records();
