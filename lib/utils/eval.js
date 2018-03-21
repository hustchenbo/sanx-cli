/**
 * Copyright (c) 2015-2016 Evan You
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file at
 * https://github.com/vuejs/vue-cli/blob/master/LICENSE
 */

'use strict';

const chalk = require('chalk');

module.exports = function evaluate(exp, data) {
    /* eslint-disable no-new-func */
    const fn = new Function('data', 'with (data) { return ' + exp + '}');
    try {
        return fn(data);
    } catch (e) {
        console.error(chalk.red('Error when evaluating filter condition: ' + exp));
    }
};
