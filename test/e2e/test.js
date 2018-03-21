const {expect} = require('chai');
const fs = require('fs');
const path = require('path');
const rm = require('rimraf').sync;
const exists = require('fs').existsSync;
const crypto = require('crypto');
const render = require('consolidate').handlebars.render;
const inquirer = require('inquirer');
const async = require('async');
const generate = require('../../lib/generate');
const metadata = require('../../lib/config');

const MOCK_METADATA_REPO_JS_PATH = path.resolve('./test/e2e/mock-metadata-repo-js');
const MOCK_TEMPLATE_REPO_PATH = path.resolve('./test/e2e/mock-template-repo');
const MOCK_SKIP_GLOB = path.resolve('./test/e2e/mock-skip-glob');
const MOCK_ERROR = path.resolve('./test/e2e/mock-error');
// output dictionary
const OUT_PUT_PATH = path.resolve('./test/e2e/out-put');

function monkInquirer(answers) {
    inquirer.prompt = questions => {
        const key = questions[0].name;
        const temp = {};
        const validate = questions[0].validate;
        const valid = validate(answers[key]);
        if (valid !== true) {
            return Promise.reject(new Error(valid));
        }
        temp[key] = answers[key];
        return Promise.resolve(temp);
    };
}

describe('The e2e test for sanx-cli', () => {
    const answers = {
        name: 'sanx-cli-test',
        author: 'this is a common author name',
        description: 'sanx-cli e2e test',
        noEscape: false
    };

    describe('config metadata setting', () => {
        it('read metadata from json', () => {
            const meta = metadata('test-pkg', MOCK_TEMPLATE_REPO_PATH);
            expect(meta).to.be.an('object');
            expect(meta.prompts).to.have.property('description');
            expect(meta.prompts).to.have.property('name');
            expect(meta).to.have.property('skipInterpolation');
        });

        it('read metadata from js', () => {
            const meta = metadata('test-pkg', MOCK_METADATA_REPO_JS_PATH);
            expect(meta).to.be.an('object');
            expect(meta.prompts).to.have.property('description');
            expect(meta.prompts).to.have.property('name');
            expect(meta).to.have.property('skipInterpolation');
        });
    });


    describe('generate project', () => {
        it('generate basic file', async function () {
            monkInquirer(answers);
            await generate('test', MOCK_METADATA_REPO_JS_PATH, OUT_PUT_PATH);
            const contents = fs.readFileSync(`${OUT_PUT_PATH}/readme.md`, 'utf-8');
            expect(contents).to.equal(answers.name);
        });

        it('adds additional data to meta data', async function () {
            monkInquirer(answers);
            const data = await generate('test', MOCK_TEMPLATE_REPO_PATH, OUT_PUT_PATH);
            expect(data.destDirName).to.equal('test');
            expect(data.inPlace).to.equal(false);
        });

        it('sets `inPlace` to true when generating in same directory', async function () {
            monkInquirer(answers);
            const currentDir = process.cwd();
            process.chdir(OUT_PUT_PATH);
            const data = await generate('test', MOCK_TEMPLATE_REPO_PATH, OUT_PUT_PATH);
            expect(data.destDirName).to.equal('test');
            expect(data.inPlace).to.equal(true);
            process.chdir(currentDir);
        });

        it('template generation', async function () {
            monkInquirer(answers);
            await generate('test', MOCK_TEMPLATE_REPO_PATH, OUT_PUT_PATH);

            expect(exists(`${OUT_PUT_PATH}/src/not-skip.san`)).to.equal(true);
            expect(exists(`${OUT_PUT_PATH}/src/have-no-mustaches.san`)).to.equal(true);

            async.eachSeries([
                'package.json',
                'src/not-skip.san',
                'src/have-no-mustaches.san'
            ], function (file, next) {
                const template = fs.readFileSync(`${MOCK_TEMPLATE_REPO_PATH}/template/${file}`, 'utf8');
                const generated = fs.readFileSync(`${OUT_PUT_PATH}/${file}`, 'utf8');
                render(template, answers, (err, res) => {
                    if (err) {
                        return next(err);
                    }
                    expect(res).to.equal(generated);
                    next();
                });
            });
        });

        it('generate a vaild package.json with escaped author', async function () {
            monkInquirer(answers);
            await generate('test', MOCK_TEMPLATE_REPO_PATH, OUT_PUT_PATH);

            const pkg = fs.readFileSync(`${OUT_PUT_PATH}/package.json`, 'utf8');
            const validData = JSON.parse(pkg);
            expect(validData.author).to.equal(answers.author);
        });

        it('avoid rendering files that do not have mustaches', async function () {
            monkInquirer(answers);
            const binFilePath = `${MOCK_TEMPLATE_REPO_PATH}/template/bin.file`;
            const wstream = fs.createWriteStream(binFilePath);
            wstream.write(crypto.randomBytes(100));
            wstream.end();

            await generate('test', MOCK_TEMPLATE_REPO_PATH, OUT_PUT_PATH);

            const handlebarsPackageJsonFile = fs.readFileSync(`${MOCK_TEMPLATE_REPO_PATH}/template/package.json`, 'utf8');
            const generatedPackageJsonFile = fs.readFileSync(`${OUT_PUT_PATH}/package.json`, 'utf8');

            render(handlebarsPackageJsonFile, answers, (err, res) => {
                if (err) {
                    return err;
                }
                expect(res).to.equal(generatedPackageJsonFile);
                expect(exists(binFilePath)).to.equal(true);
                expect(exists(`${OUT_PUT_PATH}/bin.file`)).to.equal(true);
                rm(binFilePath);
            });
        });

        it('avoid rendering files that match skipInterpolation option', async function () {
            monkInquirer(answers);
            const handlebarsPackageJsonFile = fs.readFileSync(`${MOCK_TEMPLATE_REPO_PATH}/template/package.json`, 'utf8');

            await generate('test', MOCK_TEMPLATE_REPO_PATH, OUT_PUT_PATH);

            render(handlebarsPackageJsonFile, answers, (err, res) => {
                if (err) {
                    return err;
                }
                const originalSanFileOne = fs.readFileSync(`${MOCK_TEMPLATE_REPO_PATH}/template/src/skip-one.san`, 'utf8');
                const originalSanFileTwo = fs.readFileSync(`${MOCK_TEMPLATE_REPO_PATH}/template/src/skip-two.san`, 'utf8');
                const generatedSanFileOne = fs.readFileSync(`${OUT_PUT_PATH}/src/skip-one.san`, 'utf8');
                const generatedSanFileTwo = fs.readFileSync(`${OUT_PUT_PATH}/src/skip-two.san`, 'utf8');

                expect(originalSanFileOne).to.equal(generatedSanFileOne);
                expect(originalSanFileTwo).to.equal(generatedSanFileTwo);
            });
        });

        it('support multiple globs in skipInterpolation', async function () {
            monkInquirer(answers);
            await generate('test', MOCK_SKIP_GLOB, OUT_PUT_PATH);

            const originalSanFileOne = fs.readFileSync(`${MOCK_SKIP_GLOB}/template/skip-glob/no.san`, 'utf8');
            const originalSanFileTwo = fs.readFileSync(`${MOCK_SKIP_GLOB}/template/skip-glob/no.js`, 'utf8');
            const generatedSanFileOne = fs.readFileSync(`${OUT_PUT_PATH}/skip-glob/no.san`, 'utf8');
            const generatedSanFileTwo = fs.readFileSync(`${OUT_PUT_PATH}/skip-glob/no.js`, 'utf8');

            expect(originalSanFileOne).to.equal(generatedSanFileOne);
            expect(originalSanFileTwo).to.equal(generatedSanFileTwo);
        });
    });

    describe('error handler', () => {
        it('throw out the error', async function () {
            monkInquirer(answers);
            try {
                await generate('test', MOCK_ERROR, OUT_PUT_PATH);
            } catch (err) {
                expect(err.message).to.match(/^\[readme\.md\] Parse error/);
            }
        });
    });

});
