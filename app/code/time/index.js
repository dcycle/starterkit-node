// @flow
/**
 * Manage time.
 */

class Time extends require('../component/index.js') {

  nowPlusMilliseconds(milliseconds) {
    const now = new Date();
    return new Date(now.getTime() + milliseconds);
  }

  nowPlusSeconds(seconds) {
    return this.nowPlusMilliseconds(seconds * 1000);
  }

  nowPlusMinutes(minutes) {
    return this.nowPlusSeconds(minutes * 60);
  }

}

// $FlowExpectedError
module.exports = new Time();
