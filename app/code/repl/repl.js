const Repl = require("repl");
const { extendWith, colorize, defineCommands } = require("./utils");
const { sayBye, sayDoc } = require("./cli");

const app = require('../app.js');

// Define a context initializer
const initializeContext = context => {
  extendWith({
    app: app,
  })(context);
};

const start /*:: : function */ = socket => {
  const repl = Repl.start({
    input: socket,
    output: socket,
    terminal: true,
  });

  defineCommands({
    doc: {
      help: "Get information about the loaded modules",
      action() {
        // $FlowFixMe
        this.clearBufferedCommand();
        sayDoc(socket);
        // $FlowFixMe
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
