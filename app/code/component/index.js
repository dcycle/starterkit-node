// @flow
/**
 *
 * You can test this by running:
 */

const module_exports /*:: : Object */ = class {
  async init(
    app /*:: : Object */
  ) /*:: : Object */ {
  }

  assertFlag(
    flagName /*:: : string */,
    value
  ) {
    const err = 'Expecting ' + flagName + ' to be ' + JSON.stringify(value);

    // $FlowFixMe
    if (typeof this.flags === 'undefined') {
      throw err + ' but no flags are set';
    }
    // $FlowFixMe
    if (this.flags[flagName] !== value) {
      // $FlowFixMe
      throw err + ' but it is ' + JSON.stringify(this.flags[flagName]);
    }
  }

  setFlag(
    flagName /*:: : string */,
    value
  ) {
    // $FlowFixMe
    if (typeof this.flags === 'undefined') {
      // $FlowFixMe
      this.flags = {};
    }
    // $FlowFixMe
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

module.exports = module_exports;
