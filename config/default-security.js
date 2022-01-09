'use strict';

const parent = require('evado/config/default-security');

module.exports = {

    metaPermissions: [{
        description: 'Полный доступ к данным',
        roles: 'administrator',
        type: 'allow',
        actions: 'all',
        targets: {
            type: 'all'
        }
    }, {
        description: 'Гости и пользователи могуть читать изображения',
        roles: ['guest', 'user'],
        type: 'allow',
        actions: 'read',
        targets: {
            type: 'class',
            class: 'picture'
        }
    }, {
        description: 'Гости и пользователи могуть читать публичные представления товаров',
        roles: ['guest', 'user'],
        type: 'allow',
        actions: 'read',
        targets: {
            type: 'view',
            class: 'item',
            view: ['publicList', 'publicView']
        }
    }, {
        description: 'Пользователи могуть читать собственные заказы',
        roles: 'user',
        type: 'allow',
        actions: 'read',
        targets: {
            type: 'view',
            class: 'order',
            view: ['listByCustomer', 'viewByCustomer']
        }
    }, {
        description: 'Пользователи могуть читать собственные элементы заказов',
        roles: 'user',
        type: 'allow',
        actions: 'read',
        targets: {
            type: 'view',
            class: 'orderItem',
            view: 'viewByCustomer'
        }
    }, {
        description: 'Пользователи могуть создать заказ из корзины',
        roles: 'user',
        type: 'allow',
        actions: 'create',
        targets: {
            type: 'view',
            class: 'order',
            view: 'createFromCart'
        }
    }, {
        description: 'Пользователи могуть подтвержать заказы',
        roles: 'user',
        type: 'allow',
        actions: 'update',
        targets: {
            type: 'transition',
            class: 'order',
            transition: 'confirm'
        }
    }, {
        description: 'Пользователи могуть удалять собственные не согласованные заказы',
        roles: 'user',
        type: 'allow',
        actions: 'delete',
        targets: {
            type: 'view',
            class: 'order',
            view: 'deleteByCustomer'
        }
    }],

    permissions: {
        ...parent.permissions,

        'moduleAdmin': {
            label: 'Модуль Администрирование',
            description: 'Доступ до модуля Администрирование'
        },
        'moduleOffice': {
            label: 'Модуль Офис',
            description: 'Доступ до модуля Офис'
        },
        'moduleStudio': {
            label: 'Модуль Студия',
            description: 'Доступ до модуля Студия'
        },
        'moduleApiBaseUpload': {
            label: 'Загрузка файлов',
            description: 'Загрузка файлов через модуль API базовых метаданных'
        }
    },

    roles: {
        'administrator': {
            label: 'Администратор',
            description: 'Полный доступ к системе',
            children: [
                'moduleAdmin',
                'moduleOffice',
                'moduleStudio',
                'moduleApiBaseUpload'
            ]
        },
        'guest': {
            label: 'Гость',
            description: 'Роль по умолчанию для анонимных посетителей'
        },
        'user': {
            label: 'Пользователь',
            description: 'Роль по умолчанию для идентифицированных посетителей'
        }
    },

    // правила определяют доступность разрешения
    rules: {
    },

    // привязка пользователей к ролям
    assignments: {
        'Adam': 'administrator'
    },

    // правила для автоматической привязки пользователей к ролям
    assignmentRules: {        
    }
};