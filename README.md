Dcycle Node.js starterkit
=====

[![CircleCI](https://circleci.com/gh/dcycle/starterkit-node/tree/master.svg?style=svg)](https://circleci.com/gh/dcycle/starterkit-node/tree/master)

* About
* Strategies, credentials, and accounts
* Quickstart
* Creating new users
* Sending emails
* Dcycle Node Starterkit design patterns
  * Component-based modular system
  * Some components require initialization
  * Components can require dependencies at runtime
  * Defining which modules, and their configuration, to load via a yaml file
  * Defining unversioned configuration for environment-specific configuration and sensitive data
  * Components's class names are the same as their directory names but start with an uppercase letter
  * Plugins: how modules can share information with each other
* The Node.js command line interface (CLI)
* Resources

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

Sending emails
-----

Your node application can send emails using SMTP. For that you need an SMTP server. In development, we use MailHog. Here is how it works:

Start your instance using `./scripts/deploy.sh`.

Once you have a running instance you will have access to mailhog.

You can send an email by running:

   ./scripts/node-cli-app.js

Then, on the prompt:

    app.component('./mail/index.js').sendMailInDefaultServer({from: 'test@example.com', to: 'test@example.com', subject: 'Hello World', html: '<p>Hello</p>', text: 'Hello'}, (error, info) => { console.log(error); console.log(info); });

Then, you can run:

    docker-compose ps

And visit the URL for MailHog, and you will see your message.

If you would like to use a real SMTP mail server, for production for example, then create a new file `./app/config/unversioned.yml` based on `./app/config/unversioned.example.yml`, and in the myServer section, put your actual SMTP information. The `./app/config/unversioned.example.yml` is not in version control, so you need to edit it directly on your production server.

Dcycle Node Starterkit design patterns
-----

In your own project, you are welcome to delete everything in ./app/code except ./app/code/server.js and put your own code in ./app/code/server.js.

If you are interested in keeping the structure of the current project, here are some design patterns we have used to make things easier.

### Component-based modular system

We have split our code in a series of components which are our custom node modules; they are all singleton class objects. The simplest one is ./app/code/random/index.js. It is self-contained and self explanatory; it serves to make random numbers.

You can try it by running:

    echo 'app.c("random").random()' | ./scripts/node-cli.sh

### Some components require initialization

Components like ./app/code/database/index.js require initialization before use. That is why ./app/code/server.js calls app.init() before app.run(). app.init() initializes all components that need to be initialized before the application can be run.

### Components can require dependencies at runtime

Some components, like ./app/code/chatWeb/index.js, require that other components be initiliazed before they themselves can bre initialized and eventually run.

In the case of ChatWeb, its dependency chain is as follows:

* ChatWeb depends on Express and ChatApi
* Express has no dependencies
* ChatApi depends on Express and Chat
* Chat depends on Database and BodyParser
* BodyParser depends on Express
* Database depends on Env

We use a simple dependency manager, ./app/code/dependencies/index.js, to calculate the dependency chain. You can try it at:

    echo "app.c('dependencies').getInOrder(['./chatWeb/index.js'], app);" | ./scripts/node-cli.sh

This should give you a result or ordered dependencies:

    {
      errors: [],
      results: [
        './express/index.js',
        './bodyParser/index.js',
        './env/index.js',
        './database/index.js',
        './chat/index.js',
        './chatApi/index.js',
        './chatWeb/index.js'
      ]
    }

This is used internally to initialize dependencies in the correct order. For example, in this example the database needs to be fully initialized beofre chatWeb (the web interface of our chat program) can be used.

### Defining which modules, and their configuration, to load via a yaml file

You can change which components are used by changing the yaml file ./app/config/versioned.yml, and, optionally, ./app/config/unversioned.yml, the latter being ignored in version control.

Different modules can have configuration. For example, ChatWeb needs to know on which path it should be active. That is why you will see, in ./app/config/versioned.yml, the following:

    modules:
      ...
      ./chatWeb/index.js:
        path: '/'

This tells our system that we want chatWeb to load; and, furthermore, we want to tell it that its path should be '/'. You can install the chat application on a different path if you want by changing that.

### Defining unversioned configuration for environment-specific configuration and sensitive data

Configuration can differ between environments. Here are some examples:

* The default mail server might be the included MailHog test server by default, but, on production, you'd use your own server.
* Certain components might require API keys. This can be achieved using environment variables, but you can also define unversioned configuration in ./app/config/unversioned.yml

Take a look at ./app/config/unversioned.example.yml which is an example for a file you can create called ./app/config/unversioned.example.yml.

It shows you how to change the default mail server, and include API keys if you so desire.

### Components's class names are the same as their directory names but start with an uppercase letter

For example, the class defined in ./app/code/staticPath/index.js is called StaticPath. This is more than a convention: all classes must have the same name as their directory except that they start with an uppercase letter. All our code, particularly loading plugins, depends on this.

###  Plugins: how modules can share information with each other

Some components, such ./dashboardApi/index.js, can request information from other components. In the case of dashboardApi, it can attempt to get all information that other components wish to expose on a dashboard. For example, Chat may want to expose the current total number of messages, and Authentication may wish to expose the total number of user account.

You can _invoke_ plugins like this:

    app.invokePlugin('dashboardApi', 'all', function(component, result) {
      console.log(component + ' responds:');
      console.log(result);
    });

Indeed this is what DashboardApi does.

In this case, the system will look in each of its components, including its dependencies, for files that look like:

    ./app/code/*/plugins/dashboardApi/all.js

For example ./app/code/chat/plugins/dashboardApi/all.js fits the bill, as does ./app/code/authentication/plugins/dashboardApi/all.js, but there could eventually be others.

The Node.js command line interface (CLI)
-----

There are two ways to interact with Node.js:

### The sandbox CLI

Whether or not your application has been started using ./scripts/deploy.sh (see Quickstart, above), you can type:

    docker-compose run --rm node /bin/sh -c 'node'

This allows you to test Javascript in isolation and does not interact with your running application. The simplest example is running:

    1 + 1;

### The app CLI

If you want to run code against your running application once you have deployed it (see Quickstart, above), thus having access to your database, as well as any information stored in memory by your app's process, you can use the app CLI:

    ./scripts/node-cli.sh

We achieve this using the Node REPL (see the Resources section below for further reading on the technical aspects of this).

To demonstrate this, you can first log into your application using the credentials provided after running the ./scripts/deploy.sh, at http://0.0.0.0:8428, and you will see something like:

> User(s) currently online: 1

The purpose of the app CLI is to have access to this information in your running application instance. Here is how.

    ./scripts/node-cli.sh

    app.component('./numUsers/index.js').numUsers();

This should give you the same number of users online as you see in the web interface.

## Piping commands to the CLI

You can **pipe** commands to the cli, like this:

    echo 'app.c("random").random()' | ./scripts/node-cli.sh

Resources
-----

* [How to build a real time chat application in Node.js using Express, Mongoose and Socket.io, July 30, 2018, Free Code Camp](https://www.freecodecamp.org/news/simple-chat-application-in-node-js-using-express-mongoose-and-socket-io-ee62d94f5804/).
* [Local Authentication Using Passport in Node.js, Beardscript, April 8, 2020, Sitepoint](https://www.sitepoint.com/local-authentication-using-passport-node-js/).
* [Everything you need to know about the `passport-local` Passport JS Strategy, Zach Gollwitzer, Jan 11, 2020, Level Up Coding (Medium)](https://levelup.gitconnected.com/everything-you-need-to-know-about-the-passport-local-passport-js-strategy-633bbab6195).
* [Mastering the Node.js REPL (part 3), Roman Coedo, Aug 27, 2018, Medium](https://medium.com/trabe/mastering-the-node-js-repl-part-3-c0374be0d1bf)
