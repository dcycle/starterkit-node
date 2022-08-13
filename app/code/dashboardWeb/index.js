// @flow
/**
 * Web dashboard.
 */

class DashboardWeb extends ______'../______/index.js') {

  dependencies() {
    return [
      './dashboardApi/index.js',
      './socket/index.js',
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
