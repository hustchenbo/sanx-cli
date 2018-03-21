/**
 * Copyright (c) 2015-2016 Evan You
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file at
 * https://github.com/vuejs/vue-cli/blob/master/LICENSE
 */

'use strict';

const async = require('async');
const inquirer = require('inquirer');
const evaluate = require('../utils/eval');

// Support types from prompt-for which was used before
const promptMapping = {
    string: 'input',
    boolean: 'confirm'
};


/**
 * Create a middleware for asking questions.
 *
 * @param {Object} prompts
 * @return {Function}
 */

module.exports = function askQuestions(prompts) {
    return (files, metalsmith, done) => {
        ask(prompts, metalsmith.metadata(), done);
    };
};


/**
 * Ask questions, return results.
 *
 * @param {Object} prompts
 * @param {Object} data
 * @param {Function} done
 */

function ask(prompts, data, done) {
    async.eachSeries(Object.keys(prompts), (key, next) => {
        prompt(data, key, prompts[key], next);
    }, done);
}

/**
 * Inquirer prompt wrapper.
 *
 * @param {Object} data
 * @param {String} key
 * @param {Object} prompt
 * @param {Function} done
 */

function prompt(data, key, prompt, done) {
    // skip prompts whose when condition is not met
    if (prompt.when && !evaluate(prompt.when, data)) {
        return done();
    }

    let promptDefault = prompt.default;
    if (typeof prompt.default === 'function') {
        promptDefault = function () {
            return prompt.default.bind(this)(data);
        };
    }

    inquirer.prompt([{
        type: promptMapping[prompt.type] || prompt.type,
        name: key,
        message: prompt.message || prompt.label || key,
        default: promptDefault,
        choices: prompt.choices || [],
        validate: prompt.validate || (() => true)
    }])
    .then(answers => {
        if (Array.isArray(answers[key])) {
            data[key] = {};
            answers[key].forEach(multiChoiceAnswer => {
                data[key][multiChoiceAnswer] = true;
            });
        } else if (typeof answers[key] === 'string') {
            data[key] = answers[key].replace(/"/g, '\\"');
        } else {
            data[key] = answers[key];
        }
        done();
    }).catch(done);
}


