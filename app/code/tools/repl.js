// See https://medium.com/trabe/mastering-the-node-js-repl-part-3-c0374be0d1bf
// See "The app CLI" in README.md.

const Repl = require("repl");

const repl = Repl.start('> ');

const extendWith = properties => context => {
  Object.entries(properties).forEach(([k, v]) => {
    Object.defineProperty(context, k, {
      configurable: false,
      enumerable: true,
      value: v,
    });
  });
};

repl.defineCommand("welcome", {
  help: "Prints the welcome message again",
  action() {
    this.clearBufferedCommand();
    sayWelcome();
    this.displayPrompt();
  },
});

const sayWelcome = function() {
  'welcome';
}

const sayBye = function() {
  'bye';
}

// Define a context initializer
const initializeContext = context => {
  extendWith({
    services: require("../app.js"),
  })(context);
};

sayWelcome();

initializeContext(repl.context);

repl.on("reset", initializeContext);
repl.on("exit", sayBye);
