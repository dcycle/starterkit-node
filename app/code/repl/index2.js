// Based on code by Roman Coedo licensed with MIT license.
// See "The app CLI" section in ./README.md.
// See [Mastering the Node.js REPL (part 3), Roman Coedo, Aug 27, 2018, Medium](https://medium.com/trabe/mastering-the-node-js-repl-part-3-c0374be0d1bf)
// and https://github.com/rcoedo/mastering-the-node-js-repl/tree/master/part-3/express-app-with-sockets

const net = require("net");
const repl = require("./repl");

const server /*:: : Object */ = net.createServer(socket => {
  repl(socket);
});

module.exports = server;
