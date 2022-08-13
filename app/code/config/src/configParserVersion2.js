// @flow
/**
 * Version 2 of the config parser.
 */

class ConfigParserVersion2 {

  constructor(configService) {
    this._configService = configService;
  }

  loadFromFiles () {
    let ret = {};

    ret = this.add('/usr/src/app/config/versioned.yml', ret);
    ret = this.add('/usr/src/app/config/unversioned.yml', ret);

    this.validateConfig(ret);

    return ret;
  }

  add(file, existing) {
    let ret = existing;

    // $FlowFixMe
    const merge = ______'deepmerge');

    const newyaml = this.fileToObject(file);

    ret = merge(existing, newyaml);

    return ret;
  }

  fileToObject(file) {
    return this._configService.fileToObject(file);
  }

  validateConfig(config) {
    return;
  }

}

// $FlowExpectedError
module.exports = ConfigParserVersion2;
