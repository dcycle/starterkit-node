// @flow
/**
 * REST API basic formatter.
 */

class RestApiBasicDocFormatter extends require('../component/index.js') {

  format(restModule) {
    let ret = '';

    const endpoints = restModule.endpoints();

    ret += '<h1>REST API</h1>'

    const that = this;

    endpoints.forEach((e) => {
      ret += that.formatEndpoint(restModule, e);
    });

    return ret;
  }

  formatEndpoint(restModule, endpoint) {
    let ret = '<h2>' + endpoint.name() + '</h2>';

    try {
      ret += '<code>' + endpoint.verb() + ' ' + endpoint.fullEndpointPath() + '</code>';
    }
    catch (e) {
      ret += 'Error: ' + e;
    }

    return ret;
  }

}

// $FlowExpectedError
module.exports = new RestApiBasicDocFormatter();
