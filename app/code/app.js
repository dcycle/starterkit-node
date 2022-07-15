// @flow

/**
 * Singleton representing the whole application.
 *
 * This is not meant to be edited unless if you want to fiddle with the core
 * functionality such as which configuration module to use (see
 * configModuleName()).
 *
 * For regular usage, you can modify ./app/config/versioned.yml and
 * ./app/config/unversioned.yml which will tell the app which components
 * (modules) to load.
 *
 * Each component can then have dependencies, an async init() method and a non-
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
  configModuleName() {
    return './config/index.js';
  }

  /**
   * Get the components we want. Depedencies and order will be managed later.
   *
   * The components should be in the form of an object, where keys, such
   * as './staticPath/index.js', represent components, and values, such as
   * {}, or { paths: ['/usr/src/app/static'] }, represent configuration to pass
   * to those components.
   *
   * The components do not include dependencies. For that, call
   * componentsWithDependencies().
   *
   * componentsWithDependencies() will return required components including
   * dependencies in the order in which they need to be loaded, and will not
   * include configuration values.
   *
   * Therefore if you need to pass configuration values to a dependency of a
   * a module, you might want to consider adding the dependency to the module
   * list in ./app/config/versioned.yml or ./app/config/unversioned.yml.
   */
  components() /*:: : object */ {
    // https://stackoverflow.com/a/1535650/1207752
    if (typeof this.components.ret == 'undefined') {
      this.components.ret = Object.keys(this.config().modules);
    }
    return this.components.ret;
  }

  /**
   * Get all components, with dependencies, in the order we want to load them.
   *
   * This will return an array of all components that need to be loaded,
   * including dependencies, but without configuration.
   *
   * If you need a component's configuration options (for example
   * './staticPath/index.js' might define _where_ its static files are located),
   * then use the components() method.
   */
  componentsWithDependencies() /*:: : array[string] */ {
    // https://stackoverflow.com/a/1535650/1207752
    if (typeof this.componentsWithDependencies.ret == 'undefined') {
      // It has not... perform the initialization

      const components = this.component('./dependencies/index.js')
        .getInOrder(this.components(), this);
      if (components.errors.length) {
        console.log('Errors occurred during initialization phase:');
        console.log(components.errors);
        throw 'Errors occurred while fetching dependencies, see console.';
      }
      this.componentsWithDependencies.ret = components.results;
    }
    return this.componentsWithDependencies.ret;
  }

  /**
   * Mockable wrapper around require().
   */
  component(
    component /*:: : string */
  ) {
    // $FlowFixMe
    return require(component);
  }

  /**
   * Get the site configuration from ./app/config/*.
   *
   * This will be a combination of ./app/config/versioned.yml and
   * ./app/config/unversioned.yml (unless you change the return value of
   * configModuleName()).
   */
  config()  /*:: : object */ {
    if (typeof this.config.ret == 'undefined') {
      this.config.ret = this.component(this.configModuleName()).config();
    }
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
    await this.initBootstrap();
    await this.initModules();
  }

  /**
   * Bootstrap the application, required before loading modules.
   */
  async initBootstrap() {
    await this.component(this.configModuleName()).init(this);
  }

  /**
   * Load all modules and their dependencies.
   */
  async initModules() {
    const that = this;

    await this.eachComponentAsync(async function(component) {
      if (typeof that.component(component).init === 'function') {
        await that.component(component).init(that);
      }
    });
  }

  async eachComponentAsync(callback) {
    for (const component of this.componentsWithDependencies()) {
      await callback(component);
    }
  }

  eachComponent(callback) {
    for (const component of this.componentsWithDependencies()) {
      callback(component);
    }
  }

  /**
   * Mockable wrapper around the socket.io module.
   */
  socketIo() {
    // $FlowExpectedError
    return require('socket.io');
  }

  /**
   * Exit gracefully after allowing dependencies to exit gracefully.
   */
  async exitGracefully() {
    await this.component('./database/index.js').exitGracefully();
    process.exit(0);
  }

  /**
   * Run the application.
   */
  run() {
    // $FlowExpectedError
    const expressApp = this.component('./express/index.js').expressApp();

    const expressSession = this.component('express-session')({
      secret: this.component('./env/index.js').required('EXPRESS_SESSION_SECRET'),
      resave: false,
      saveUninitialized: false
    });

    expressApp.use(expressSession);
    expressApp.use(this.component('./authentication/index.js').passport().initialize());
    expressApp.use(this.component('./authentication/index.js').passport().session());

    const that = this;

    expressApp.get('/messages', (req, res) => {
      that.component('./chat/index.js').message().find({},(err, messages)=> {
        res.send(messages);
      });
    });

    const io = this.component('./socket/index.js').socketIoHttp();

    this.component('./chat/index.js').message().find({},(err, messages)=> {
      console.log(messages);
    });

    expressApp.post('/messages', (req, res) => {
      var message = new (that.component('./chat/index.js').message())(req.body);
      message.save((err) =>{
        if(err) {
          res.sendStatus(500);
        }
        io.emit('message', req.body);
        res.sendStatus(200);
      });
    });

    expressApp.get('/login',
      (req, res) => res.sendFile('login.html',
      { root: '/usr/src/app/private' })
    );

    expressApp.post('/login', (req, res, next) => {
      this.component('./authentication/index.js').passport().authenticate('local',
      (err, user, info) => {
        if (err) {
          console.log('error during /login');
          console.log(err);
          return next(err);
        }

        if (!user) {
          console.log('no user during /login');
          console.log(info);
          return res.redirect('/login?info=' + info);
        }

        req.logIn(user, function(err) {
          console.log('There is a user, we are logging in');
          console.log(user);
          if (err) {
            return next(err);
          }

          return res.redirect('/');
        });

      })(req, res, next);
    });

    expressApp.get('/', this.component('./authentication/index.js').loggedIn,
      (req, res) => {
        res.sendFile('private.html',
        { root: '/usr/src/app/private' });
      }
    );

    expressApp.post('/logout', function(req, res, next) {
      req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/');
      });
    });

    this.eachComponent(async function(component) {
      if (typeof that.component(component).run === 'function') {
        console.log(component + ' has a run() function; calling it.');
        that.component(component).run(that);
      }
      else {
        console.log(component + ' has no run() function; moving on.');
      }
    });
  }
}

// $FlowExpectedError
module.exports = new App();
