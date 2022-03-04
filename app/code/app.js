/**
 * The app functionality.
 */

(function () {
  'use strict';

  const express = require('express');
  const mongoose = require('mongoose');
  const database = require('./database.js');
  const webserver = require('./webserver.js');
  const authentication = require('./authentication.js');
  const env = require('./env.js');
  const passport = require('passport');
  const message = require('./collection/message.js');
  const userpass = require('./collection/userpass.js');
  const bodyParser = require('body-parser');

  module.exports = {
    database: function() {
      return require('./database.js');
    },
    modules: function() {
      return [
        this.database(),
      ];
    },
    run: function(port) {
      this.modules().forEach(function(module) {
        module.init();
      });

      webserver.app().use(authentication.expressSession());
      webserver.app().use(express.static('/usr/src/app/static'));
      webserver.app().use(bodyParser.json());
      webserver.app().use(bodyParser.urlencoded({extended: true}));
      webserver.app().use(passport.initialize());
      webserver.app().use(passport.session());

      // Passport authentication.
      passport.use(userpass.model().createStrategy());
      passport.serializeUser(userpass.model().serializeUser());
      passport.deserializeUser(userpass.model().deserializeUser());

      webserver.app().get('/messages', (req, res) => {
        message.model().find({},(err, messages)=> {
          res.send(messages);
        });
      });

      const io = require('socket.io')(webserver.http());

      io.on('connection', () =>{
        console.log('a user is connected');
      });

      message.model().find({},(err, messages)=> {
        console.log('***');
        console.log(messages);
        console.log('***');
      });

      const connectEnsureLogin = require('connect-ensure-login');

      webserver.app().post('/login', (req, res, next) => {
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

      webserver.app().get('/login',
        (req, res) => res.sendFile('private-html/login.html',
        { root: __dirname })
      );

      webserver.app().get('/',
        connectEnsureLogin.ensureLoggedIn(),
        (req, res) => res.sendFile('private-html/index.html', {root: __dirname})
      );

      webserver.app().get('/private',
        connectEnsureLogin.ensureLoggedIn(),
        (req, res) => res.sendFile('private-html/private.html', {root: __dirname})
      );

      webserver.app().get('/user',
        connectEnsureLogin.ensureLoggedIn(),
        (req, res) => res.send({user: req.user})
      );

      webserver.app().post('/messages', (req, res) => {
        const myMessage = new message.model()(req.body);
        myMessage.save((err) =>{
          if(err) {
            sendStatus(500);
          }
          io.emit('message', req.body);
          res.sendStatus(200);
        });
      });

      webserver.http().listen(port, function() {
       console.log('listening on *:' + port);
      });
    },
  };

}());
