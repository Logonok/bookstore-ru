'use strict';

module.exports = {

    title: 'Bookstore',

    components: {
        'db': {
            settings: {
                'database': process.env.MONGO_NAME || 'bookstore-ru',
            }
        },
        'cookie': {
            secret: 'bookstore-ru.evado.sign' // key to sign cookie
        },
        'session': {
            secret: 'bookstore-ru.evado.sign'  // key to sign session ID cookie
        },
        'i18n': {
            language: 'ru'
        },
        'router': {
            defaultModule: 'front'
        }
    },
    metaModels: {
        'base': {
            Class: require('evado-meta-base/base/BaseMeta')
        },
        'navigation': {
            Class: require('evado-meta-navigation/base/NavMeta')
        }
    },
    modules: {
        'api': {
            config: {
                modules: {
                    'base': {
                        Class: require('evado-api-base/Module')
                    },
                    'navigation': {
                        Class: require('evado-api-navigation/Module')
                    }
                }
            }
        },
        'studio': {
            Class: require('evado-module-studio/Module')
        },
        'office': {
            Class: require('evado-module-office/Module')
        },
        'account': {
            Class: require('evado-module-account/Module')
        },
        'admin': {
            Class: require('evado-module-admin/Module')
        },
        'front': {
            Class: require('../module/front/Module')
        }
    },
    users: require('./default-users'),
    security: require('./default-security'),
    tasks: require('./default-tasks'),
    utilities: require('./default-utilities'),
    sideMenu: require('./default-sideMenu'),
    params: {
        'enablePasswordChange': true,
        'enablePasswordReset': false,
        'enableSignUp': true,
        'enableSignUpVerification': false,
        'languageToggle': false
    }
};