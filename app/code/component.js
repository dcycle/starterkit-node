// @flow
/**
 *
 * You can test this by running:
 */

module.exports = class {
  async init(
    app /*:: : Object */
  ) /*:: : Object */ {
  }

  assertFlag(
    flagName /*:: : string */,
    value
  ) {
    const err = 'Expecting ' + flagName + ' to be ' + JSON.stringify(value);

    if (typeof this.flags === 'undefined') {
      throw err + ' but no flags are set';
    }
    if (this.flags[flagName] !== value) {
      throw err + ' but it is ' + JSON.stringify(this.flags[flagName]);
    }
  }

  setFlag(
    flagName /*:: : string */,
    value
  ) {
    if (typeof this.flags === 'undefined') {
      this.flags = {};
    }
    this.flags[flagName] = value;
  }

  setFlagBool(
    flagName /*:: : string */,
    value /*:: : boolean */,
  ) {
    this.setFlag(flagName, value);
  }

  dependencies() /*:: : Array<string> */ {
    return [];
  }

};
