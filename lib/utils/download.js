/**
 * @file download a repo.
 * @author chenbo09
 */

'use strict';

const fs = require('fs-extra');
const downloadRepo = require('download-git-repo');

function download(repo, dest, options) {
    return new Promise((resolve, reject) => {
        downloadRepo(repo, dest, options, err => {
            if (err) {
                return reject(err);
            }
            resolve(dest);
        });
    });
}

exports.repo = function (repo, dest, options) {
    return fs.remove(dest).then(() => download(repo, dest, options));
};

