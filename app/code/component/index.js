// @flow
/**
 *
 * You can test this by running:
 */

const module_exports /*:: : Object */ = class {
  async init(
    app /*:: : Object */
  ) /*:: : Object */ {
    // $FlowFixMe
    this._app = app;
    return this;
  }

  assertInitialized() {
    if (typeof this.app() === 'undefined') {
      throw this.componentName() + ' has not been initialized';
    }
  }

  app() {
    // $FlowFixMe
    return this._app;
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
    return '/usr/src/app/app/' + this.lowerFirstLetter(this.componentName()) + '/';
  }

  componentName() {
    return this.constructor.name;
  }

  invokePlugin(componentName, pluginName, callback) {
    this.assertInitialized();
    const candidateFilename = this.componentDir() + 'plugins/' + componentName + '/' + pluginName + '.js';
    if (require('fs').existsSync(candidateFilename)) {
      // $FlowFixMe
      require(candidateFilename).invoke(this.app(), callback);
    }
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
