// @flow
const loggedIn = function(req, res, next) {
  return next();
  console.log('zzzzzz');
  console.log(req.user);
  if (req.user) {
    next();
  } else {
    res.redirect('/login');
  }
}

class Singleton {
  authentication() {
    return require('./authentication.js');
  }
  database() {
    return require('./database.js');
  }
  env() {
    return require('./env.js');
  }
  bodyParser() {
    // $FlowExpectedError
    return require('body-parser');
  }
  http() {
    // $FlowExpectedError
    return require('http');
  }
  random() {
    return require('./random.js');
  }
  express() {
    // $FlowExpectedError
    return require('express');
  }
  expressSessionModule() {
    // $FlowExpectedError
    return require('express-session');
  }
  socketIo() {
    // $FlowExpectedError
    return require('socket.io');
  }
  async init() {
    const database = this.database();
    await this.database().init();
    await this.authentication().init(database);
  }
  async exitGracefully() {
    await this.database().exitGracefully();
    process.exit(0);
  }
  run(
    port /*:: : string */,
    staticPath /*:: : string */
  ) {
    var Message = this.database().mongoose().model('Message',{ name : String, message : String});

    // Constants.
    const HOST = '0.0.0.0';

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

    app.get('/messages', (req, res) => {
      Message.find({},(err, messages)=> {
        res.send(messages);
      });
    });

    var io = this.socketIo()(http);

    io.on('connection', () =>{
      console.log('a user is connected');
    });

    Message.find({},(err, messages)=> {
      console.log('***');
      console.log(messages);
      console.log('***');
    });

    app.post('/messages', (req, res) => {
      var message = new Message(req.body);
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
      this.authentication().passport().authenticate('local',
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
          if (err) {
            return next(err);
          }

          return res.redirect('/');
        });

      })(req, res, next);
    });

    app.get('/private', loggedIn,
      (req, res) => {
        res.send({
          bla: "bla",
          user: "a" + req.user,
          isAuthenticated: "b" + req.isAuthenticated,
        });
        // console.log('receiving a request for /private.')
        // console.log('we want to get rid of connect-ensure-login')
        // console.log('https://github.com/jaredhanson/connect-ensure-login/blob/master/lib/ensureLoggedIn.js')
        // console.log('so we will inspect req')
        // console.log(req.user)
        // console.log('aaa')
        // console.log(req)
        // res.sendFile('private.html', {root: '/usr/src/app/private'});
      }
    );

    // app.listen(PORT, HOST);
    http.listen(port, function() {
     console.log('listening on *:' + port);
    });
    console.log(`Running on http://${HOST}:${port}`);
  }
}

// $FlowExpectedError
module.exports = new Singleton();
