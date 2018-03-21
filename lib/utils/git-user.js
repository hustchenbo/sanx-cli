/**
 * Copyright (c) 2015-2016 Evan You
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file at
 * https://github.com/vuejs/vue-cli/blob/master/LICENSE
 */

'use strict';

const exec = require('child_process').execSync;

module.exports = () => {
    let name;
    let email;

    try {
        name = exec('git config --get user.name');
        email = exec('git config --get user.email');
    } catch (e) {
        // let it go
    }

    name = name && JSON.stringify(name.toString().trim()).slice(1, -1);
    email = email && (' <' + email.toString().trim() + '>');
    return (name || '') + (email || '');
};
