Dcycle Node.js starterkit
=====

[![CircleCI](https://circleci.com/gh/dcycle/starterkit-node/tree/master.svg?style=svg)](https://circleci.com/gh/dcycle/starterkit-node/tree/master)

About
-----

This project is a quick starter for Node applications on Docker. We have implemented a very simple chat application with authentication (see "Resources", below) using Socket.io, Express, and MongoDB.

Quickstart
-----

Install Docker and run:

    ./scripts/deploy.sh

Authentication
-----

Socket.io
-----

Testing modules
-----

const app = require('./app.js');
undefined
> app.init().then(async () => {  users = await app.authentication().allUsers(); console.log(users); })

Resources
-----

* [How to build a real time chat application in Node.js using Express, Mongoose and Socket.io, July 30, 2018, Free Code Camp](https://www.freecodecamp.org/news/simple-chat-application-in-node-js-using-express-mongoose-and-socket-io-ee62d94f5804/).
