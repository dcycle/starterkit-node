// @flow

let numUsers = 0;

/**
 * Singleton representing the whole application.
 */
class Singleton {

  /**
   * Get the number of currently connected users.
   */
  numUsers() {
    return numUsers;
  }

  /**
   * Get the components we want. Depedencies and order will be managed later.
   */
  components() {
    return Object.keys(this._config.modules);
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
   * Mockable wrapper around the body-parser module.
   */
  bodyParser() {
    // $FlowExpectedError
    return require('body-parser');
  }

  /**
   * Mockable wrapper around the express-session module.
   */
  expressSessionModule() {
    // $FlowExpectedError
    return require('express-session');
  }

  config() {
    return this._config;
  }

  /**
   * Init the application and all its dependencies.
   */
  async init(config) {
    try {
      await this.component('./config/index.js').init(this);

      this._config = config;
      console.log(this.component('./config/index.js').config());
      console.log(this._config);

      const that = this;

      await this.eachComponentAsync(async function(component) {
        if (typeof that.component(component).init === 'function') {
          await that.component(component).init(that);
        }
      });
    }
    catch (err) {
      console.log('An error occurred during the initialization phase.');
      console.log(err);
      console.log('For your safety, we will exit now.');
      process.exit(1);
    }
  }

  componentsWithDependencies() {
    const components = this.component('./dependencies/index.js')
      .getInOrder(this.components(), this);
    if (components.errors.length) {
      console.log('Errors occurred during initialization phase:');
      console.log(components.errors);
      throw 'Errors occurred while fetching dependencies, see console.';
    }
    return components.results;
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
  run(
    port /*:: : number */,
    staticPath /*:: : string */,
    cliPort /*:: : number */,
  ) {
    // $FlowExpectedError
    const http = this.component('./express/index.js').httpServer();
    const expressApp = this.component('./express/index.js').expressApp();

    var bodyParser = this.bodyParser();
    expressApp.use(bodyParser.json());
    expressApp.use(bodyParser.urlencoded({extended: false}));

    const expressSession = this.expressSessionModule()({
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

    var io = this.socketIo()(http);

    io.on('connection', (socket) => {
      io.emit('updateNumUsers', ++numUsers);

      socket.on('disconnect', () => {
        io.emit('updateNumUsers', --numUsers);
      });
    });

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

    http.listen(port, function() {
      console.log('listening on *:' + port);
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
module.exports = new Singleton();
