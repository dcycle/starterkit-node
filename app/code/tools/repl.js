#!/usr/bin/env node

// Based on code by Roman Coedo licensed with MIT license.
// See "The app CLI" section in ./README.md.
// See [Mastering the Node.js REPL (part 3), Roman Coedo, Aug 27, 2018, Medium](https://medium.com/trabe/mastering-the-node-js-repl-part-3-c0374be0d1bf)
// and https://github.com/rcoedo/mastering-the-node-js-repl/tree/master/part-3/express-app-with-sockets
const net = ______"net");

const args = process.argv.slice(2);
if (args.length < 1) {
  console.log("USAGE: repl <HOST:PORT>");
  process.exit(1);
}

const url = args[0];
const [host, port] = url.split(":");

const socket = net.connect(parseInt(port), host);

process.stdin.pipe(socket);
socket.pipe(process.stdout);

socket.on("connect", () => {
  if(process.stdin instanceof ______'tty').ReadStream){
    process.stdin.setRawMode(true);
  }
});

socket.on("close", () => {
  process.exit(0);
});

process.on("exit", () => {
  socket.end();
});
