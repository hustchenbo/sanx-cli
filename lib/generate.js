/**
 * @file Generate a template.
 * @author chenbo09
 */

'use strict';
const Metalsmith = require('metalsmith');
const path = require('path');
const getOptions = require('./config');
const askQuestions = require('./plugins/ask-questions-plugin');
const renderTemplateFiles = require('./plugins/render-template-files-plugin');

/**
 * Generate a template.
 *
 * @param {String} name
 * @param {String} src
 * @param {String} dest
 *
 * @return {Promise}
 */

module.exports = function generate(name, src, dest) {

    const promise = new Promise((resolve, reject) => {
        const opts = getOptions(name, src);
        const metalsmith = Metalsmith(path.join(src, 'template'));
        Object.assign(metalsmith.metadata(), {
            destDirName: name,
            inPlace: dest === process.cwd(),
            noEscape: true
        });

        // plugin has been handle in the plugins
        metalsmith.use(askQuestions(opts.prompts))
        .use(renderTemplateFiles(opts.skipInterpolation));

        metalsmith.clean(false)
            .source('.') // start from template root instead of `./src`
            .destination(dest)
            .build(err => {
                if (err) {
                    reject(err);
                } else {
                    resolve(metalsmith.metadata());
                }
            });
    });

    return promise;
};
