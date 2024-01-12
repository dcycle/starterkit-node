// @ts-nocheck
// Based on code by Roman Coedo licensed with MIT license.
// See "The app CLI" section in ./README.md.
// See [Mastering the Node.js REPL (part 3), Roman Coedo, Aug 27, 2018, Medium](https://medium.com/trabe/mastering-the-node-js-repl-part-3-c0374be0d1bf)
// and https://github.com/rcoedo/mastering-the-node-js-repl/tree/master/part-3/express-app-with-sockets

// Color functions
const colors = { red: "31", green: "32", yellow: "33", blue: "34", magenta: "35" };
const colorize = (color, s) => `\x1b[${colors[color]}m${s}\x1b[0m`;

// Function that takes an object o1 and returns another function
// that takes an object o2 to extend it with the o1 properties as
// read-only
const extendWith = properties => context => {
  Object.entries(properties).forEach(([k, v]) => {
    Object.defineProperty(context, k, {
      configurable: false,
      enumerable: true,
      value: v,
    });
  });
};

// Function that takes an object o1 with shape { key: command } and
// returns another function that takes the repl and defines the commands
// in it
const defineCommands = commands => repl => {
  Object.entries(commands).forEach(([k, v]) => {
    repl.defineCommand(k, v);
  });
};

const module_exports /*:: : Object */ = {
  colorize,
  extendWith,
  defineCommands,
};

module.exports = module_exports;
