// @flow
/**
 * Singleton representing the whole application.
 */
class Singleton {

  /**
   * Get the components we want. Depedencies and order will be managed later.
   */
  components() {
    return [
      './chat.js',
      './authentication.js',
    ];
  }

  /**
   * Mockable wrapper around require().
   */
  component(
    component /*:: : string */
  ) {
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
   * Mockable wrapper around the express module.
   */
  express() {
    // $FlowExpectedError
    return require('express');
  }

  /**
   * Mockable wrapper around the express-session module.
   */
  expressSessionModule() {
    // $FlowExpectedError
    return require('express-session');
  }

  /**
   * Mockable wrapper around the env module.
   */
  env() {
    return require('./env.js');
  }

  /**
   * Mockable wrapper around the http module.
   */
  http() {
    // $FlowExpectedError
    return require('http');
  }

  /**
   * Init the application and all its dependencies.
   */
  async init() {
    const components = this.component('./dependencies.js')
      .getInOrder(this.components(), this);
    if (components.errors.length) {
      console.log('Errors occured during initialization phase:');
      console.log(components.errors);
    }
    for (const component of components.results) {
      await this.component(component).init(this);
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
    await this.component('./database.js').exitGracefully();
    process.exit(0);
  }

  /**
   * Run the application.
   */
  run(
    port /*:: : string */,
    staticPath /*:: : string */,
  ) {
    // App.
    const app = this.express()();

    // $FlowExpectedError
    const http = this.http().Server(app);

    app.use(this.express().static(staticPath));
    var bodyParser = this.bodyParser();
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: false}));

    const expressSession = this.expressSessionModule()({
      secret: this.env().required('EXPRESS_SESSION_SECRET'),
      resave: false,
      saveUninitialized: false
    });

    app.use(expressSession);
    app.use(this.component('./authentication.js').passport().initialize());
    app.use(this.component('./authentication.js').passport().session());

    const that = this;

    app.get('/messages', (req, res) => {
      that.component('./chat.js').message().find({},(err, messages)=> {
        res.send(messages);
      });
    });

    var io = this.socketIo()(http);

    io.on('connection', () =>{
      console.log('a user is connected');
    });

    this.component('./chat.js').message().find({},(err, messages)=> {
      console.log(messages);
    });

    app.post('/messages', (req, res) => {
      var message = new (that.component('./chat.js').message())(req.body);
      message.save((err) =>{
        if(err) {
          res.sendStatus(500);
        }
        io.emit('message', req.body);
        res.sendStatus(200);
      });
    });

    app.get('/login',
      (req, res) => res.sendFile('login.html',
      { root: '/usr/src/app/private' })
    );

    app.post('/login', (req, res, next) => {
      this.component('./authentication.js').passport().authenticate('local',
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

    app.get('/', this.component('./authentication.js').loggedIn,
      (req, res) => {
        res.sendFile('private.html',
        { root: '/usr/src/app/private' });
      }
    );

    app.post('/logout', function(req, res, next) {
      req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/');
      });
    });

    http.listen(port, function() {
     console.log('listening on *:' + port);
    });
  }
}

// $FlowExpectedError
module.exports = new Singleton();
