/**
 * The app functionality.
 */

(function () {
  'use strict';

  const express = require('express');
  const mongoose = require('mongoose');
  const database = require('./database.js');
  const env = require('./env.js');
  const passport = require('passport');
  const passportLocalMongoose = require('passport-local-mongoose');

  module.exports = {
    run: function() {

      database.init();

      // express-session is required for login/authentication.
      const secret = String(env.required('SESSION_SECRET'));
      const expressSession = require('express-session')({
        secret: secret,
        resave: false,
        saveUninitialized: false
      });

      // Set up the database for messages.
      var Message = mongoose.model('Message', {
        name : String,
        message : String,
      });

      // Set up the database for usernames and hashed passwords.
      const Schema = mongoose.Schema;
      const UserDetail = new Schema({
        username: String,
        password: String
      });
      UserDetail.plugin(passportLocalMongoose);
      const UserDetails = mongoose.model('userInfo', UserDetail, 'userInfo');

      // Constants.
      const PORT = 8080;
      const HOST = '0.0.0.0';

      // App.
      const app = express();
      const http = require('http').Server(app);

      app.use(expressSession);
      app.use(express.static('/usr/src/app/static'));
      const bodyParser = require('body-parser');
      app.use(bodyParser.json());
      app.use(bodyParser.urlencoded({extended: true}));
      app.use(passport.initialize());
      app.use(passport.session());

      // Passport authentication.
      passport.use(UserDetails.createStrategy());
      passport.serializeUser(UserDetails.serializeUser());
      passport.deserializeUser(UserDetails.deserializeUser());

      app.get('/messages', (req, res) => {
        Message.find({},(err, messages)=> {
          res.send(messages);
        });
      });

      const io = require('socket.io')(http);

      io.on('connection', () =>{
        console.log('a user is connected');
      });

      Message.find({},(err, messages)=> {
        console.log('***');
        console.log(messages);
        console.log('***');
      });

      const connectEnsureLogin = require('connect-ensure-login');

      app.post('/login', (req, res, next) => {
        passport.authenticate('local',
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

      app.get('/login',
        (req, res) => res.sendFile('private-html/login.html',
        { root: __dirname })
      );

      app.get('/',
        connectEnsureLogin.ensureLoggedIn(),
        (req, res) => res.sendFile('private-html/index.html', {root: __dirname})
      );

      app.get('/private',
        connectEnsureLogin.ensureLoggedIn(),
        (req, res) => res.sendFile('private-html/private.html', {root: __dirname})
      );

      app.get('/user',
        connectEnsureLogin.ensureLoggedIn(),
        (req, res) => res.send({user: req.user})
      );

      app.post('/messages', (req, res) => {
        const message = new Message(req.body);
        message.save((err) =>{
          if(err) {
            sendStatus(500);
          }
          io.emit('message', req.body);
          res.sendStatus(200);
        });
      });

      // app.listen(PORT, HOST);
      http.listen(PORT, function() {
       console.log('listening on *:' + PORT);
      });
      console.log(`Running on http://${HOST}:${PORT}`);
    },
  };

}());
