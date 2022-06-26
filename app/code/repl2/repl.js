console.log('AAArepl')

const Repl = require("repl");
const { extendWith, colorize, defineCommands } = require("./utils");
const { sayWelcome, sayBye, sayDoc, prompt } = require("./cli");

const app = require('../app.js');

// Define a context initializer
const initializeContext = context => {
  extendWith({
    app: app,
  })(context);
};

const start = socket => {
  console.log("repl client connected");
  sayWelcome(socket);

  const repl = Repl.start({
    prompt,
    input: socket,
    output: socket,
    terminal: true,
  });

  defineCommands({
    doc: {
      help: "Get information about the loaded modules",
      action() {
        this.clearBufferedCommand();
        sayDoc(socket);
        this.displayPrompt();
      },
    },
  })(repl);

  initializeContext(repl.context);

  repl.on("reset", initializeContext);
  repl.on("exit", sayBye);

  socket.on("error", e => {
    console.log(`repl socket error: ${e}`);
  });

  repl.on("exit", () => {
    console.log("repl client disconnected");
    socket.end();
  });
};

module.exports = start;
