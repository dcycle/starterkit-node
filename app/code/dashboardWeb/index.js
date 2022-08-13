// @flow
/**
 * Web dashboard.
 */

class DashboardWeb extends require('../service/index.js') {

  dependencies() {
    return [
      'dashboardApi',
      'socket',
    ];
  }

  async run(
    app /*:: : Object */
  ) /*:: : Object */ {
    const path = this.config('path');

    app.service('express').addRoute('dashboardWeb', 'get', path, (req, res) => {
        res.sendFile('dashboard.html',
        { root: this.privateRoot() });
      }
    );

  }

}

// $FlowExpectedError
module.exports = new DashboardWeb();
