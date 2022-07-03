// @flow
/**
 * Loads configuration.
 */

class Singleton extends require('../component/index.js') {
  async init(
    app /*:: : Object */
  ) /*:: : Object */ {
    this._app = app;
    this._config = this.loadFromFiles();
  }

  config() {
    return this._config;
  }

  loadFromFiles() {
    let ret = {};

    ret = this.add('/usr/src/app/config/versioned.yml', ret);
    ret = this.add('/usr/src/app/config/unversioned.yml', ret);

    this.validateConfig(ret);

    return ret;
  }

  add(file, existing) {
    let ret = existing;

    // $FlowFixMe
    const merge = require('deepmerge');

    const newyaml = this.fileToObject(file);

    ret = merge(existing, newyaml);

    return ret;
  }

  fileToObject(file) {
    const yaml = this._app.component('js-yaml');
    const fs   = require('fs');

    if (!fs.existsSync(file)) {
      return {};
    }

    const obj = yaml.load(fs.readFileSync(file, 'utf8'));

    if (obj === null) {
      return {};
    }

    return obj;
  }

  validateConfig(config) {
    return;
  }

}

// $FlowExpectedError
module.exports = new Singleton();
