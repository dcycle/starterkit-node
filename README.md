Dcycle Node.js starterkit
=====

[![CircleCI](https://circleci.com/gh/dcycle/starterkit-node/tree/master.svg?style=svg)](https://circleci.com/gh/dcycle/starterkit-node/tree/master)

* About
* Strategies, credentials, and accounts
* Quickstart
* Let's Encrypt on a server
* Creating new users
* Adding arbitrary unique and non-unique fields, such as email addresses, to users
* Sending emails
* Dcycle Node Starterkit design patterns
  * Component-based modular system
  * Some components require initialization
  * Components can require dependencies at runtime
  * Defining which modules, and their configuration, to load via a yaml file
  * Defining unversioned configuration for environment-specific configuration and sensitive data
  * Components's class names are the same as their directory names but start with an uppercase letter
  * Plugins: how modules can share information with each other
  * Components can define classes
* The Node.js command line interface (CLI)
* MongoDB crud (create - read - update - delete)
* Mongoose vs MongoDB
* Logging in with GitHub
* GitHub Apps
* Security tokens
* REST API
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

Let's Encrypt on a server
-----

(This does not apply to local development, only to publicly-accessible servers.)

We will follow the instructions in the following blog posts:

* [Letsencrypt HTTPS for Drupal on Docker, October 03, 2017, Dcycle Blog](https://blog.dcycle.com/blog/170a6078/letsencrypt-drupal-docker/)
* [Deploying Letsencrypt with Docker-Compose, October 06, 2017, Dcycle Blog](https://blog.dcycle.com/blog/7f3ea9e1/letsencrypt-docker-compose/)

Here are the exact steps:

* Figure out the IP address of your server, for example 1.2.3.4.
* Make sure your domain name, for example example.com, resolves to 1.2.3.4. You can test this by running:

    ping example.com

You should see something like:

    PING example.com (1.2.3.4): 56 data bytes
    64 bytes from 1.2.3.4: icmp_seq=0 ttl=46 time=28.269 ms
    64 bytes from 1.2.3.4: icmp_seq=1 ttl=46 time=25.238 ms

Press control-C to get out of the loop.

* Run your instance (./scripts/deploy.sh)
* edit the file .env
* replace the line VIRTUAL_HOST=localhost with VIRTUAL_HOST=example.com
* Run ./scripts/deploy.sh again

If you have Let's Encrypt already set up for another project on the same server, move on to "Figure out the network name", below. Otherwise, set up Let's Encrypt as per the above blog posts:

    mkdir -p "$HOME"/certs
    docker run -d -p 80:80 -p 443:443 \
      --name nginx-proxy \
      -v "$HOME"/certs:/etc/nginx/certs:ro \
      -v /etc/nginx/vhost.d \
      -v /usr/share/nginx/html \
      -v /var/run/docker.sock:/tmp/docker.sock:ro \
      --label com.github.jrcs.letsencrypt_nginx_proxy_companion.nginx_proxy \
      --restart=always \
      jwilder/nginx-proxy
    docker run -d \
      --name nginx-letsencrypt \
      -v "$HOME"/certs:/etc/nginx/certs:rw \
      -v /var/run/docker.sock:/var/run/docker.sock:ro \
      --volumes-from nginx-proxy \
      --restart=always \
      jrcs/letsencrypt-nginx-proxy-companion

Figure out the network name

    docker network ls

It is something like "starterkit_node_default".

Connect your network and restart the Let's Encrypt container:

    docker network connect starterkit_node_default nginx-proxy
    docker restart nginx-letsencrypt

After 120 seconds the security certificate should work. Now your site should work with LetsEncrypt.

Creating new users
-----

You can run:

    ./scripts/reset-password.sh some-new-user

Adding arbitrary unique and non-unique fields, such as email addresses, to users
-----

By default users only have (and must have) a username which needs to be unique.

It is also possible to add other information to user records.

Here is an example:

By default an "admin" user exists, and we can see its record in the database by running:

    ./scripts/mongo-cli.sh
    ...
    show dbs
    use login
    show collections
    db.userInfo.find();

This will show the record associated with the user admin and potentially other users.

In a new terminal window, create a new user to demonstrate unique vs. non-unique fields:

    ./scripts/reset-password.sh some-new-user

### Adding non-unique fields to users

Back in the Mongo CLI, you will now see two users.

In yet another terminal window, open a CLI for the Node app.

    ./scripts/node-cli.sh

To add a **non-unique** field to both users, run:

    await app.c('authentication')
      .addNonUniqueFieldToUser('admin', 'hello', 'world');
    await app.c('authentication')
      .addNonUniqueFieldToUser('some-new-user', 'hello', 'world');

The same code can be used to modify an existing field. The code does nothing if the user does not exist.

You can also remove this field:

    await app.c('authentication')
      .removeFieldFromUser('admin', 'hello');
    await app.c('authentication')
      .removeFieldFromUser('some-new-user', 'hello');

### Adding unique fields to users

Back the Node CLI, you can add a unique field to the admin user:

    await app.c('authentication')
      .addUniqueFieldToUser('admin', 'hello', 'world');

Now, if you try to add the same field and value to another user, you will get an error:

    await app.c('authentication')
        .addUniqueFieldToUser('some-new-user', 'hello', 'world');
    > Uncaught:
    Error: Cannot add unique field hello to user some-new-user with value world because a different user, admin, already has that value in the same field.
        at /usr/src/app/app/authentication/index.js:154:15

Sending emails
-----

Your node application can send emails using SMTP. For that you need an SMTP server. In development, we use MailHog. Here is how it works:

Start your instance using `./scripts/deploy.sh`.

Once you have a running instance you will have access to mailhog.

You can send an email by running:

   ./scripts/node-cli.js

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

### Components can define classes

Some components, such as dashboardApi, can define classes:

* ./app/code/dashboardApi/src/dashboardSingleNumber.js
* ./app/code/dashboardApi/src/dashboardElement.js

Objects of these classes can be created by calling a very primitive autoloader:

    const dashboardSingleNumber = app.class('dashboardApi/dashboardSingleNumber');
    const myObject = new dashboardSingleNumber('hello', 100);
    myObject.getTitle();
    // hello
    myObject.getNumber();
    // 100

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

MongoDB crud (create - read - update - delete)
-----

To create a record with {hello: "world"} in a collection "arbitraryCollection" in a database called "arbitraryDatabase", you can log into the node CLI (see above) and type:

    await app.c('database').client().db('arbitraryDatabase').collection('arbitraryCollection').insert({hello: "world"});
    {
      acknowledged: true,
      insertedCount: 1,
      insertedIds: { '0': new ObjectId("634447e509ac94b6c97ecac3") }
    }

Now you can, in a separate terminal window, log into the Mongo CLI and see what happened:

    ./scripts/mongo-cli.sh

Show databases by running:

    show dbs;
    ...
    arbitraryDatabase  0.000GB
    ...

    use arbitraryDatabase
    switched to db arbitraryDatabase

    show collections;
    arbitraryCollection

    db.arbitraryCollection.find();
    { "_id" : ObjectId("634447e509ac94b6c97ecac3"), "hello" : "world" }

The ID will be different in your case but let's assume that it is 634447e509ac94b6c97ecac3.

In your Node.js code, if you know the ID, you can find your record by running:

    const ObjectId  = require('mongodb').ObjectID;
    await app.c('database').client().db('arbitraryDatabase').collection('arbitraryCollection').find({_id: ObjectId("634447e509ac94b6c97ecac3")}).toArray();
    [ { _id: new ObjectId("634447e509ac94b6c97ecac3"), hello: 'world' } ]

If you want to find all records where 'hello' == 'world', you can run:

    await app.c('database').client().db('arbitraryDatabase').collection('arbitraryCollection').find({hello: "world"}).toArray();
    [ { _id: new ObjectId("634447e509ac94b6c97ecac3"), hello: 'world' } ]

If you want to attach some arbitrary information to record 634447e509ac94b6c97ecac3, you can run:

    /** if ObjectId is already defined do not redefine it here **/
    const ObjectId  = require('mongodb').ObjectID;
    await app.c('database').client().db('arbitraryDatabase').collection('arbitraryCollection').updateOne({_id: ObjectId("634447e509ac94b6c97ecac3")}, {$set:{some_extra_information: {arbitrary: "extra information"}}});

The "$set" property tells mongoDB that we want to add information to the record.

Now, if you go back to the terminal window where you are connected to the MongoDB CLI, you can run:

    db.arbitraryCollection.find();
    { "_id" : ObjectId("634447e509ac94b6c97ecac3"), "hello" : "world", "some_extra_information" : { "arbitrary" : "extra information" } }

You can also update collections not by ID but by property, for example:

    await app.c('database').client().db('arbitraryDatabase').collection('arbitraryCollection').updateMany({hello: "world"}, {$set:{yet_more_extra_information: {arbitrary: "extra information"}}});

Now, in the command line for MongoDB, you will find:

    db.arbitraryCollection.find();
    { "_id" : ObjectId("634447e509ac94b6c97ecac3"), "hello" : "world", "some_extra_information" : { "arbitrary" : "extra information" }, "yet_more_extra_information" : { "arbitrary" : "extra information" } }

We can now remove all this information in the Node CLI:

    await app.c('database').client().db('arbitraryDatabase').collection('arbitraryCollection').updateMany({hello: "world"}, {$unset:{yet_more_extra_information: "", some_extra_information: ""}});

Now the extra fields are gone in the MongoDB CLI:

    db.arbitraryCollection.find();
    { "_id" : ObjectId("634447e509ac94b6c97ecac3"), "hello" : "world" }

To completely delete the object you can run, in the Node CLI:

    await app.c('database').client().db('arbitraryDatabase').collection('arbitraryCollection').deleteMany({hello: "world"});

Now confirm these are deleted in the MongoDB CLI:

    db.arbitraryCollection.find();
    # Nothing found

Mongoose vs MongoDB
-----

We use both npm [mongoose](https://www.npmjs.com/package/mongoose) and npm [mongodb](https://www.npmjs.com/package/mongodb).

Mongodb is very unstructured and lets you do almost anything; we use it in the above example. Mongoose allows you to define schemas and is used for user storage. I find its learning curve a lot steeper (I still don't fully understand it), but the code works for storing users; and it was taken from the resources in the "Resrouces" section, below.

Logging in with GitHub
-----

It is possible to log in with GitHub.

Here is how it works:

* Make sure you have a publicly-accessible, https domain, for example https://www.example.com.
* Make sure you have a GitHub account
* Fill in the form at https://github.com/settings/applications/new
  * Application name: 'MY APPLICATION NAME'
  * Application URL: https://www.example.com
  * Application description: 'MY APPLICATION DESCRIPTION'.
  * Authorization callback URL: https://www.example.com/auth/github/callback
  * Enable device flow: not enabled.
* Generate a new client secret and take note of the client ID and client secret.
* Make sure you have a file called ./app/config/unversioned.yml; in the file, have a section with your client id and secret:

    # This can be used for API keys or anything which differs from one
    # environment to another.
    ---
    modules:
      ./loginWithGitHub/index.js:
        client: 'client_id'
        secret: 'secret'
        baseUrl: 'https://www.example.com'

Now go to https://www.example.com/auth/github and you will be able to log in with GitHub.

GitHub Apps
-----

Logging in with GitHub will provide access to the GitHub username, email and some other data. GitHub Apps provide acecss to a lot more data, for example private repos.

Here is how to set up a GitHub App:

* Go to https://github.com/settings/apps/new
* Enter, as a name, "Example App"
* Check Request user authorization (OAuth) during installation
* Enter the homepage URL https://starterkit-node.dcycleproject.org
* Enter the callback URL https://starterkit-node.dcycleproject.org
* Generate a client secret
* Copy your client ID and client secret

At this point an authorization token will be provided to your app, allowing you to use the GitHub API endpoints.

For example, if you want your app to be able to access your visitors' public repositories, you can call:

    curl -u GITHUB_USERNAME:ACCESS_TOKEN "https://api.github.com/user/repos?visibility=public"

Security tokens
-----

Security tokens are used to access data, notably via the REST API.

Tokens are generated in one of two ways.

### By logging in to a web page and requesting a token using the token request endpoint

If you are logged in to the system, you can visit this URL:

    /token/request

It will give you a token that lasts 5 minutes.

You can check a token's validity by logging in and running:

    /token/check-valid?token=MY_TOKEN

This will tell you whether the token is valid or not, and why.

### By using the node CLI or in node code

All tokens need to be associated with a user.

To find your user ID, you can log into the Mongo CLI:

    ./scripts/mongo-cli.sh

And run:

    db.userInfo.find();

To create a token for a given user for 60 seconds, log into the node cli:

    ./scripts/node-cli.sh

And run:

    app.c('token').token('some-user-id', 60, {arbitrary: 'options'})

You can verify that the token is valid by typing:

    await app.c('token').tokenStringToObject(t).toObjectAboutValidity();

Tokens are not revocable.

REST API
-----

A REST API is defined at the following endpoing:

    /api/v1

If you simply visit /api/v1, you will see documentation about the API.

Only endpoints that publicly accessible are currently supported, for example:

    /api/v1/endpoints

Typechecking
-----

In January, 2024, we moved away from using [Flow](https://flow.org) and moved to the approach described in [Using Typescript without compilation, by Pascal Schilp, dev.to, Mar 26, 2023](https://dev.to/thepassle/using-typescript-without-compilation-3ko4) and [Type Safe JavaScript with JSDoc, by TruckJS, Medium, Sep. 4, 2018](https://medium.com/@trukrs/type-safe-javascript-with-jsdoc-7a2a63209b76).

For this we are using <https://github.com/dcycle/docker-typescript>.

Resources
-----

* [How to build a real time chat application in Node.js using Express, Mongoose and Socket.io, July 30, 2018, Free Code Camp](https://www.freecodecamp.org/news/simple-chat-application-in-node-js-using-express-mongoose-and-socket-io-ee62d94f5804/).
* [Local Authentication Using Passport in Node.js, Beardscript, April 8, 2020, Sitepoint](https://www.sitepoint.com/local-authentication-using-passport-node-js/).
* [Everything you need to know about the `passport-local` Passport JS Strategy, Zach Gollwitzer, Jan 11, 2020, Level Up Coding (Medium)](https://levelup.gitconnected.com/everything-you-need-to-know-about-the-passport-local-passport-js-strategy-633bbab6195).
* [Mastering the Node.js REPL (part 3), Roman Coedo, Aug 27, 2018, Medium](https://medium.com/trabe/mastering-the-node-js-repl-part-3-c0374be0d1bf)
* [Setup Github OAuth With Node and Passport JS, by Sjlouji, Sept. 22, 2020](https://medium.com/swlh/node-and-passport-js-github-authentication-e33dbd0558c).
* [How to Use the GitHub API to List Repositories, Carlos Schults, 7 May 2022, Fisebit](https://fusebit.io/blog/github-api-list-repositories/)
* [Authorizing GitHub Apps, GitHub docs](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/authorizing-github-apps)
* [How to Build a Secure Node js REST API: 4 Easy Steps, November 3rd, 2021, Hevo](https://hevodata.com/learn/building-a-secure-node-js-rest-api/)
* [Connect to a MongoDB Database Using Node.js, Lauren Schaefer, Feb 04, 2022, Updated Sep 23, 2022](https://www.mongodb.com/developer/code-examples/javascript/node-connect-mongodb-3-3-2/)
* [MongoDB and Node.js Tutorial - CRUD Operations, Lauren Schaefer, Feb 04, 2022, Updated Sep 23, 2022, MongoDB](https://www.mongodb.com/developer/languages/javascript/node-crud-tutorial/)
* [How To Use JSON Web Tokens (JWTs) in Express.js, Danny Denenberg, February 18, 2020, Updated on March 22, 2021, DigitalOcean](https://www.digitalocean.com/community/tutorials/nodejs-jwt-expressjs)
