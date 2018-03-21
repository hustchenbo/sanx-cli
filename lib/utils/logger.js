/**
 * @file Logger.
 * @author chenbo09
 */

'use strict';

const chalk = require('chalk');
const prefix = '  sanx-cli';

function log(msg, label) {
    console.log(label, msg);
}

exports.success = function (msg) {
    log(msg, chalk.green(prefix));
};

exports.error = function (msg) {
    log(msg, chalk.red(prefix));
};

exports.warn = function (msg) {
    log(msg, chalk.yellow(prefix));
};

exports.info = function (msg) {
    log(msg, chalk.cyan(prefix));
};


