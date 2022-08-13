// Based on code by Roman Coedo licensed with MIT license.
// See "The app CLI" section in ./README.md.
// See [Mastering the Node.js REPL (part 3), Roman Coedo, Aug 27, 2018, Medium](https://medium.com/trabe/mastering-the-node-js-repl-part-3-c0374be0d1bf)
// and https://github.com/rcoedo/mastering-the-node-js-repl/tree/master/part-3/express-app-with-sockets

const { colorize } = require("./utils");

const user = colorize("magenta", process.env.USER);

const cwd = colorize("yellow", process.cwd());

const nodeVersion = colorize("green", `${process.title} ${process.version}`);

const say = message => socket => {
  if (socket) {
    socket.write(`${message}\n`);
  }
};

const sayDoc = say(`
  The context has the following modules available:

    * ${colorize("green", "R")}: The ramda library
    * ${colorize("green", "services")}: The application's service layer
`);

const sayBye = say(`
  Goodbye, ${user}!
`);

const module_exports /*:: : Object */ = {
  sayBye,
  sayDoc,
};

module.exports = module_exports;
