/**
 * @copyright Copyright (c) 2022 Logonok <logonok@gmail.com>
 *
 * Check that all nested items have the necessary stock
 */
'use strict';

const Base = require('evado/component/validator/CustomValidator');

module.exports = class TotalStockValidator extends Base {

    constructor (config) {
        super({
            skipOnAnyError: true,
            ...config
        });
    }

    async validateAttr (name, model) {
        const stock = model.get('stock');
        const result = await this.validateItem(model, stock, {});
        if (result !== true) {
            model.addError(name, result);
        }
    }

    validateItem (item, quantity, map) {
        const id = item.getId();
        if (map.hasOwnProperty(id)) {
            return true;
        }
        map[id] = id;
        if (item.get('stock') < quantity) {
            return this.getMessage(item.get('name'));
        }
        if (item.get('bundled')) {
            if (item.get('totalStock')) {
                return this.validateNestedItems(item, quantity, map);
            }
        }
        return true;
    }

    async validateNestedItems (item, quantity, map) {
        const items = await item.related.resolve('items');
        for (const item of items) {
            const result = await this.validateItem(item, quantity, map);
            if (result !== true) {
                return result;
            }
        }
        return true;
    }

    getMessage (name) {
        const defaults = 'The bundle stock is greater than the stock of its element {name}';
        return this.createClientMessage(this.message, defaults, {name});
    }
};