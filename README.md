Dcycle Node.js starterkit
=====

[![CircleCI](https://circleci.com/gh/dcycle/starterkit-node/tree/master.svg?style=svg)](https://circleci.com/gh/dcycle/starterkit-node/tree/master)

About
-----

This project is a quick starter for Node applications on Docker. We have implemented a very simple chat application (see "Resources", below) and simple login and authentication feature using Socket.io, Express, and MongoDB.

Quickstart
-----

Install Docker and run:

    ./scripts/deploy.sh

Authentication
-----

The system automatically creates a user account for you, with the username admin and a random password.

You can reset the password by running ./scripts/uli.sh.

Caveats
-----

This system uses UUIDs as random strings in some cases, for example in `./scripts/lib/source-env.source.sh`. According to [Moving away from UUIDs, Neil Madden, 30 August, 2018, neilmadden.blog](https://neilmadden.blog/2018/08/30/moving-away-from-uuids/), there are more secure ways to generate random strings, which you might consider in your own application.

Resources
-----

* [How to build a real time chat application in Node.js using Express, Mongoose and Socket.io, July 30, 2018, Free Code Camp](https://www.freecodecamp.org/news/simple-chat-application-in-node-js-using-express-mongoose-and-socket-io-ee62d94f5804/).
* [Local Authentication Using Passport in Node.js, Beardscript, April 8, 2020, Sitepoint](https://www.sitepoint.com/local-authentication-using-passport-node-js/).
