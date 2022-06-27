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

module.exports = {
  sayBye,
  sayDoc,
};
