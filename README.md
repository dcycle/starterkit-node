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

Type-checking with Flow
-----

We are using [Flow](https://flow.org) to un type-checking on our code.

Logging emails during development
-----

We are using a dummy email server with a full GUI, [Mailhog](https://github.com/mailhog/MailHog), as a destination for our emails during development. This is described in [Debug outgoing emails with Mailhog, a dummy mailserver with a GUI, March 14, 2019, Dcycle Blog](https://blog.dcycle.com/blog/2019-03-14/mailhog/).

Here is how it works:

When you create or update a development environment, using ./scripts/deploy.sh, or at any time by running ./scripts/uli.sh, you will see something like:

    => Node: http://0.0.0.0:8428
    => Dummy email client: http://0.0.0.0:8429

You will now be able to see how your Node server sends emails by running:

(1) visit http://0.0.0.0:8429/user/password
(2) enter "admin"
(3) you should see "Further instructions have been sent to your email address."
(4) to view the actual email in a GUI, visit (in this example) http://0.0.0.0:32781

Caveats
-----

This system uses UUIDs as random strings in some cases, for example in `./scripts/lib/source-env.source.sh`. According to [Moving away from UUIDs, Neil Madden, 30 August, 2018, neilmadden.blog](https://neilmadden.blog/2018/08/30/moving-away-from-uuids/), there are more secure ways to generate random strings, which you might consider in your own application.

Resources
-----

* [How to build a real time chat application in Node.js using Express, Mongoose and Socket.io, July 30, 2018, Free Code Camp](https://www.freecodecamp.org/news/simple-chat-application-in-node-js-using-express-mongoose-and-socket-io-ee62d94f5804/).
* [Local Authentication Using Passport in Node.js, Beardscript, April 8, 2020, Sitepoint](https://www.sitepoint.com/local-authentication-using-passport-node-js/).
* [Node.js - Send Emails via SMTP with Nodemailer, JULY 20 2020, Jason Watmore's blog](https://jasonwatmore.com/post/2020/07/20/nodejs-send-emails-via-smtp-with-nodemailer).
