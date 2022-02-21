'use strict';

const Base = require('evado/Application');

module.exports = class BookstoreApplication extends Base {

    constructor (config) {
        super({
            original: Base,
            ...config
        });
    }

};
module.exports.init(module);