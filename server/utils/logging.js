const chalk = require('chalk');

exports._log = (arg1, ...rest) => console.log(chalk.bgCyan.greenBright('[LOG]'), chalk.blueBright(arg1), ...rest);
exports._warn = (arg1, ...rest) => console.warn(chalk.bgYellow.gray('[Warn]'), chalk.greenBright(arg1), ...rest);
exports._error = (arg1, ...rest) => console.log(chalk.bgWhite.red('[ERROR]'), chalk.redBright(arg1), ...rest);