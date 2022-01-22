/**
 * @copyright Copyright (c) 2022 Logonok <logonok@gmail.com>
 *
 * Check the looping of nested items
 */
'use strict';

const Base = require('evado/component/validator/CustomValidator');

module.exports = class LoopedItemsValidator extends Base {

    async validateAttr (name, model) {
        const result = await this.validateItem(model, {});
        if (result !== true) {
            model.addError(name, result);
        }
    }

    validateItem (item, map) {
        if (map[item.getId()] === true) {
            return this.getMessage(item.get('name'));
        }
        if (item.get('bundled')) {
            return this.validateNestedItems(item, map);
        }
        return true;
    }

    async validateNestedItems (item, map) {
        const id = item.getId();
        map[id] = true;
        const items = await item.related.resolve('items');
        for (const item of items) {
            const result = await this.validateItem(item, map);
            if (result !== true) {
                return result;
            }
        }
        map[id] = false;
        return true;
    }

    getMessage (name) {
        return this.createClientMessage(this.message, 'Looped nesting: {name}', {name});
    }
};