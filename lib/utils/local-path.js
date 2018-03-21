/**
 * Copyright (c) 2015-2016 Evan You
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file at
 * https://github.com/vuejs/vue-cli/blob/master/LICENSE
 */

'use strict';

const path = require('path');

module.exports = {
    isLocalPath(templatePath) {
        return /^[./]|(^[a-zA-Z]:)/.test(templatePath);
    },

    getTemplatePath(templatePath) {
        return path.isAbsolute(templatePath)
            ? templatePath
            : path.normalize(path.join(process.cwd(), templatePath));
    }
};
