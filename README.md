Dcycle Node.js starterkit
=====

[![CircleCI](https://circleci.com/gh/dcycle/starterkit-node/tree/master.svg?style=svg)](https://circleci.com/gh/dcycle/starterkit-node/tree/master)

About
-----

This project is a quick starter for Node applications on Docker. We have implemented a very simple chat application with authentication (see "Resources", below) using Socket.io, Express, and MongoDB.

Strategies, credentials, and accounts
-----

This project uses [Passport](https://www.passportjs.org/) for authentication along with the "Username/password" strategy.

You can create a new account or regenerate a random password for an existing account by typing, on the command line:

    ./scripts/reset-password.sh some-username

Quickstart
-----

Install Docker and run:

    ./scripts/deploy.sh

This will give you a URL, username and password.

Now log on using the the credentials provided.

You will be able to use a simple chat application, and log out.

Creating new users
-----

You can run:

    ./scripts/reset-password.sh some-new-user

The Node.js command line interface (CLI)
-----

There are two ways to interact with Node.js:

### The sandbox CLI

Whether or not your application has been started using ./scripts/deploy.sh (see Quickstart, above), you can type:

    ./scripts/node-cli-sandbox.sh

This allows you to test Javascript in isolation and does not interact with your running application. The simplest example is running:

    1 + 1;

You can also interact with modules in your application, but they will not have been initialized, and they will not have access to your current application's state (for example, they cannot know how many users are currently connected, because that information is stored in memory in the application's process). For example, if you want to test the included ./random/index.js module, you can run, in the sandbox:

    require('./app/random/index.js').random();

The sandbox cli is completely unaware of the database or your running process.

### The app CLI

If you want to run code against your running application once you have deployed it (see Quickstart, above), thus having access to your database, as well as any information stored in memory by your app's process, you can use the app CLI:

    ./scripts/node-cli-app.sh

We achieve this using the Node REPL (see the Resources section below for further reading on the technical aspects of this).

To demonstrate this, you can first log into your application using the credentials provided after running the ./scripts/deploy.sh, at http://0.0.0.0:8428, and you will see something like:

> User(s) currently online: 1

The purpose of the app CLI is to have access to this information in your running application instance. Here is how.

    ./scripts/node-cli-app.sh

    app.numUsers();

## Piping commands to the CLI

You can **pipe** commands to the cli, like this:

    echo 'require("./app/random/index.js").random()' | ./scripts/node-cli-app.sh

or

    echo 'require("./app/random/index.js").random()' | ./scripts/node-cli-sandbox.sh

Resources
-----

* [How to build a real time chat application in Node.js using Express, Mongoose and Socket.io, July 30, 2018, Free Code Camp](https://www.freecodecamp.org/news/simple-chat-application-in-node-js-using-express-mongoose-and-socket-io-ee62d94f5804/).
* [Local Authentication Using Passport in Node.js, Beardscript, April 8, 2020, Sitepoint](https://www.sitepoint.com/local-authentication-using-passport-node-js/).
* [Everything you need to know about the `passport-local` Passport JS Strategy, Zach Gollwitzer, Jan 11, 2020, Level Up Coding (Medium)](https://levelup.gitconnected.com/everything-you-need-to-know-about-the-passport-local-passport-js-strategy-633bbab6195).
* [Mastering the Node.js REPL (part 3), Roman Coedo, Aug 27, 2018, Medium](https://medium.com/trabe/mastering-the-node-js-repl-part-3-c0374be0d1bf)
