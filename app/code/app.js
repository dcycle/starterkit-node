'use strict';

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
  random() {
    return require('./random.js');
  }
  express() {
    return require('express');
  }
  async init() {
    const database = this.database();
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
    const mongoose = require('mongoose');

    var Message = mongoose.model('Message',{ name : String, message : String});

    // Constants.
    const HOST = '0.0.0.0';

    // App.
    const app = this.express()();
    const http = require('http').Server(app);

    app.use(this.express().static(staticPath));
    var bodyParser = require('body-parser');
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: false}));

    const expressSession = require('express-session')({
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

    var io = require('socket.io')(http);

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
        if(err)
          sendStatus(500);
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
          return next(err);
        }

        if (!user) {
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

    app.get('/private',
      this.authentication().connectEnsureLogin().ensureLoggedIn(),
      (req, res) => res.sendFile('private.html', {root: '/usr/src/app/private'})
    );

    app.get('/user',
      this.authentication().connectEnsureLogin().ensureLoggedIn(),
      (req, res) => res.send({user: req.user})
    );

    // app.listen(PORT, HOST);
    http.listen(port, function() {
     console.log('listening on *:' + port);
    });
    console.log(`Running on http://${HOST}:${port}`);
  }
}

module.exports = new Singleton();
