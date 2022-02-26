/**
 * The main server file.
 *
 * Replace this with whatever it is your application does.
 */

(function () {
  'use strict';
  const express = require('express');
  const mongoose = require('mongoose');
  const database = require('./database.js');
  const env = require('./env.js');
  const passport = require('passport');
  const passportLocalMongoose = require('passport-local-mongoose');

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
}());
