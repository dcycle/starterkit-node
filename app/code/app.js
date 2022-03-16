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
    const express = require('express');
    const mongoose = require('mongoose');

    var Message = mongoose.model('Message',{ name : String, message : String});

    // Constants.
    const HOST = '0.0.0.0';

    // App.
    const app = express();
    const http = require('http').Server(app);

    app.use(express.static(staticPath));
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
    http.listen(port, function() {
     console.log('listening on *:' + port);
    });
    console.log(`Running on http://${HOST}:${port}`);
  }
}

module.exports = new Singleton();
