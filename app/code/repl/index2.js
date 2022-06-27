const net = require("net");
const repl = require("./repl");

const server /*:: : Object */ = net.createServer(socket => {
  repl(socket);
});

module.exports = server;
