// @flow
/**
 * Loads configuration.
 */

class Config extends require('../service/index.js') {
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
    const candidate = '/usr/src/app/config/versioned.yml';

    return this.parserFromYamlVersion(candidate).loadFromFiles();
  }

  parserFromYamlVersion(candidate) {
    const className = this.parserClassFromFile(candidate);
    return new className(this);
  }

  parserClassFromFile(candidate) {
    const obj = this.fileToObject(candidate);

    if (typeof obj.version === 'undefined') {
      throw candidate + ' needs to have a "version" key. try version: 2';
    }

    const version = String(obj.version);

    switch (version) {
      case '2':
        return this._app.class('config/configParserVersion2');
        break;

      default:
        throw candidate + ' has unsupported version ' + version;
    }
  }

  fileToObject(file) {
    const yaml = require('js-yaml');
    const fs = require('fs');

    if (!fs.existsSync(file)) {
      return {};
    }

    const obj = yaml.load(fs.readFileSync(file, 'utf8'));

    if (obj === null) {
      return {};
    }

    return obj;
  }

}

// $FlowExpectedError
module.exports = new Config();
