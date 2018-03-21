/**
 * @file Generate config.
 * @author chenbo09
 */

'use strict';

const packageConfig = require('../package.json');

module.exports = () => packageConfig.version;
