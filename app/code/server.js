/**
 * The main server file.
 *
 * Replace this with whatever it is your application does.
 */

(function () {
  'use strict';
  const express = require('express');
  const mongoose = require('mongoose');

  const dbUrl = 'mongodb://' + process.env.MONGO_USER + ':' + process.env.MONGO_PASS + '@' + process.env.MONGO_HOST + ':' + process.env.MONGO_PORT + '/' + process.env.MONGO_DB + '?authSource=admin';

  mongoose.connect(dbUrl , (err) => {
    console.log('mongodb connected',err);
  });

  var Message = mongoose.model('Message',{ name : String, message : String});

  // Constants.
  const PORT = 8080;
  const HOST = '0.0.0.0';

  // App.
  const app = express();
  const http = require('http').Server(app);

  app.use(express.static('/usr/src/app/static'));
  var bodyParser = require('body-parser');
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({extended: false}));

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

  // app.listen(PORT, HOST);
  http.listen(PORT, function() {
   console.log('listening on *:' + PORT);
  });
  console.log(`Running on http://${HOST}:${PORT}`);
}());
