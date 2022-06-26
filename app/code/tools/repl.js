#!/usr/bin/env node
const net = require("net");

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
  if(process.stdin instanceof require('tty').ReadStream){
    process.stdin.setRawMode(true);
  }
});

socket.on("close", () => {
  process.exit(0);
});

process.on("exit", () => {
  socket.end();
});
