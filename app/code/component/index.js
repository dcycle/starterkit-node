/**
 *
 * You can test this by running:
 */

const module_exports /*:: : Object */ = class {
  async init(app)  {
    this._app = app;
    return this;
  }

  assertInitialized() {
    if (typeof this.app() === 'undefined') {
      throw this.componentName() + ' has not been initialized';
    }
  }

  app() {
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
    // @ts-expect-error
    if (require('fs').existsSync(candidateFilename)) {
      require(candidateFilename).invoke(this.app(), callback);
    }
  }

  async run(app)  {
    return this;
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

  /**
   * Returns the dependencies.
   * @returns {String[]}
   */
  dependencies() {
    return [];
  }

};

module.exports = module_exports;
