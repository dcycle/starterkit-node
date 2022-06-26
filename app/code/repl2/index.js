console.log('AAAindex')

const net = require("net");
console.log(net)
const repl = require("./repl");

const server = net.createServer(socket => {
  repl(socket);
});

module.exports = server;
