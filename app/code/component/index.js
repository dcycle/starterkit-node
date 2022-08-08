// @flow
/**
 *
 * You can test this by running:
 */

const module_exports /*:: : Object */ = class {
  async init(
    app /*:: : Object */
  ) /*:: : Object */ {
    this._app = app;
    return this;
  }

  /**
   * Make the first letter of a string lowercase.
   */
  lowerFirstLetter(string) {
    // https://stackoverflow.com/a/1026087/1207752
    return string.charAt(0).toLowerCase() + string.slice(1);
  }

  /**
   * Get the full path to the component including the trailing slash.
   */
  componentDir() {
    const className = this.constructor.name;
    return '/usr/src/app/app/' + this.lowerFirstLetter(className) + '/';
  }

  invokePlugin(componentName, pluginName) {
    const candidateFilename = this.componentDir() + 'plugins/' + componentName + '/' + pluginName + '.js';
    if (require('fs').existsSync(candidateFilename)) {
      return require(candidateFilename).invoke(this._app);
    }
    return new Promise((resolve, reject) => {});
  }

  async run(
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
