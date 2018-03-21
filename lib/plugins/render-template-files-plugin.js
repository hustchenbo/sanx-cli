/**
 * Copyright (c) 2015-2016 Evan You
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file at
 * https://github.com/vuejs/vue-cli/blob/master/LICENSE
 */


/**
 *  @file renderTemplateFiles plugin
 */

'use strict';

const async = require('async');
const render = require('consolidate').handlebars.render;
const multimatch = require('multimatch');

/**
 * Template in place plugin.
 *
 * this plugin can skip the some file contains {{name}}, copy from vue-cli.
 * @param {Object} skipInterpolation
 * @return {Function}
 */

module.exports = function renderTemplateFiles(skipInterpolation) {
    skipInterpolation = typeof skipInterpolation === 'string'
        ? [skipInterpolation]
        : skipInterpolation;
    return (files, metalsmith, done) => {
        const keys = Object.keys(files);
        const metalsmithMetadata = metalsmith.metadata();
        async.each(keys, (file, next) => {
            // skipping files with skipInterpolation option
            if (skipInterpolation && multimatch([file], skipInterpolation, {dot: true}).length) {
                return next();
            }
            const str = files[file].contents.toString();
            // do not attempt to render files that do not have mustaches
            if (!/{{([^{}]+)}}/g.test(str)) {
                return next();
            }
            render(str, metalsmithMetadata, (err, res) => {
                if (err) {
                    err.message = `[${file}] ${err.message}`;
                    return next(err);
                }
                files[file].contents = new Buffer(res);
                next();
            });
        }, done);
    };
};


