// @flow

/**
 * Singleton representing the whole application.
 *
 * This is not meant to be edited unless if you want to fiddle with the core
 * functionality such as which configuration module to use (see
 * configServiceName()).
 *
 * For regular usage, you can modify ./app/config/versioned.yml and
 * ./app/config/unversioned.yml which will tell the app which services to load.
 *
 * Each service can then have dependencies, an async init() method and a non-
 * async run() method, which are called automatically in the right order.
 */
class App {

  /**
   * Get the configuration module name to use.
   *
   * The configuration module is responsible for loading configuration,
   * normally from ./app/config/versioned.yml and ./app/config/unversioned.yml.
   *
   * If you want to do anything funky, you can modify the config to use here.
   */
  configServiceName() {
    return 'config';
  }

  class(identifier) {
    const parts = identifier.split('/');
    const service = parts.shift();
    const rest = parts.join();
    return this.require('./' + service + '/src/' + rest + '.js');
  }

  /**
   * Get the services we want. Depedencies and order will be managed later.
   *
   * The services should be in the form of an object, where keys, such
   * as 'staticPath', represent services, and values, such as
   * {}, or { paths: ['/usr/src/app/static'] }, represent configuration to pass
   * to those services.
   *
   * The services do not include dependencies. For that, call
   * servicesWithDependencies().
   *
   * servicesWithDependencies() will return required services including
   * dependencies in the order in which they need to be loaded, and will not
   * include configuration values.
   *
   * Therefore if you need to pass configuration values to a dependency of a
   * a module, you might want to consider adding the dependency to the module
   * list in ./app/config/versioned.yml or ./app/config/unversioned.yml.
   */
  services() /*:: : Object */ {
    // https://stackoverflow.com/a/1535650/1207752
    // https://github.com/facebook/flow/issues/8689
    // $FlowFixMe[method-unbinding]
    if (typeof this._services.ret == 'undefined') {
      // https://stackoverflow.com/a/1535650/1207752
      // https://github.com/facebook/flow/issues/8689
      // $FlowFixMe[method-unbinding]
      this._services.ret = Object.keys(this.config().services());
    }
    // https://stackoverflow.com/a/1535650/1207752
    // https://github.com/facebook/flow/issues/8689
    // $FlowFixMe[method-unbinding]
    return this._services.ret;
  }

  /**
   * Get all services, with dependencies, in the order we want to load them.
   *
   * This will return an array of all services that need to be loaded and
   * initialized, including dependencies, but without configuration.
   *
   * If you need a serice's configuration options (for example
   * 'staticPath' might define _where_ its static files are located),
   * then use the services() method.
   */
  servicesWithDependencies() /*:: : Array<string> */ {
    // https://stackoverflow.com/a/1535650/1207752
    // https://github.com/facebook/flow/issues/8689
    // $FlowFixMe[method-unbinding]
    if (typeof this.servicesWithDependencies.ret == 'undefined') {
      // It has not... perform the initialization

      const services = this.service('dependencies')
        .getInOrder(this.services(), this);
      if (services.errors.length) {
        console.log('Errors occurred during initialization phase:');
        console.log(services.errors);
        throw 'Errors occurred while fetching dependencies, see console.';
      }
      // https://stackoverflow.com/a/1535650/1207752
      // https://github.com/facebook/flow/issues/8689
      // $FlowFixMe[method-unbinding]
      this.servicesWithDependencies.ret = services.results;
    }
    // https://stackoverflow.com/a/1535650/1207752
    // https://github.com/facebook/flow/issues/8689
    // $FlowFixMe[method-unbinding]
    return this.servicesWithDependencies.ret;
  }

  /**
   * Mockable wrapper around require().
   */
  require(
    module /*:: : string */
  ) {
    // $FlowFixMe
    return require(module);
  }


  /**
   * Get a service singleton by name.
   */
  service(
    serviceName /*:: : string */
  ) {
    return this.require('./' + serviceName + '/index.js');
  }

  /**
   * Get the site configuration from ./app/config/*.
   *
   * This will be a combination of ./app/config/versioned.yml and
   * ./app/config/unversioned.yml (unless you change the return value of
   * configServiceName()).
   */
  config()  /*:: : Object */ {
    // https://github.com/facebook/flow/issues/8689
    // $FlowFixMe[method-unbinding]
    if (typeof this.config.ret == 'undefined') {
      // https://github.com/facebook/flow/issues/8689
      // $FlowFixMe[method-unbinding]
      this.config.ret = this.service(this.configServiceName()).config();
    }
    // https://github.com/facebook/flow/issues/8689
    // $FlowFixMe[method-unbinding]
    return this.config.ret;
  }

  /**
   * Init the application and all its dependencies.
   *
   * This is done in two phases: the bootstrap, which is core functionality
   * for loading YML configuration from ./app/config/*; then, to initialize
   * the actual application functionality.
   */
  async init() {
    console.log('Init step starting...');
    await this.initBootstrap();
    await this.initModules();
    console.log('...init step complete.');
  }

  /**
   * Bootstrap the application, required before loading modules.
   */
  async initBootstrap() {
    await this.service(this.configServiceName()).init(this);
  }

  /**
   * Load all modules and their dependencies.
   */
  async initModules() {
    const that = this;

    await this.eachServiceAsync(async function(service) {
      if (typeof that.service(service).init === 'function') {
        console.log('[x] ' + service + ' has an init() function; calling it.');
        await that.service(service).init(that);
      }
      else {
        console.log('[ ] ' + service + ' has no init() function; moving on.');
      }
    });
  }

  async eachServiceAsync(actionCallback) {
    for (const service of this.servicesWithDependencies()) {
      await actionCallback(service);
    }
  }

  eachService(actionCallback) {
    for (const service of this.servicesWithDependencies()) {
      actionCallback(service);
    }
  }

  /**
   * Exit gracefully after allowing dependencies to exit gracefully.
   */
  async exitGracefully() {
    await this.service('database/index.js').exitGracefully();
    process.exit(0);
  }

  /**
   * See the "Plugins" section in ./README.md.
   */
  invokePlugin(serviceName, pluginName, callback) {
    // See https://www.geeksforgeeks.org/how-to-execute-multiple-promises-sequentially-in-javascript/.
    let result = {};
    const that = this;
    let promises = [];
    for (const serviceName of this.servicesWithDependencies().services()) {
      that.service(serviceName).invokePlugin(serviceName, pluginName, (result) => {
        // Functions declared within loops referencing an outer scoped variable
        // may lead to confusing semantics. (callback). This may be true, but
        // I'm not sure how to do this otherwise: every single plugin is given
        // the chance to call the callback.
        /* jshint ignore:start */
        callback(serviceName, result);
        /* jshint ignore:end */
      });
    }
  }

  /**
   * Run the application.
   */
  run() {
    console.log('Run step starting...');

    const that = this;

    this.eachService(async function(service) {
      if (typeof that.service(service).run === 'function') {
        console.log('[x] ' + service + ' has a run() function; calling it.');
        that.service(service).run(that);
      }
      else {
        console.log('[ ] ' + service + ' has no run() function; moving on.');
      }
    });

    console.log('...run step complete.');
  }
}

// $FlowExpectedError
module.exports = new App();
