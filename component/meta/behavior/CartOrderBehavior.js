'use strict';

const Base = require('evado-meta-base/behavior/Behavior');

module.exports = class CartOrderBehavior extends Base {

    afterValidate () {
        if (!this.owner.hasError()) {
            return this.validate();
        }
    }

    async validate () {
        const targets = this.get('items');
        if (!Array.isArray(targets) || !targets.length) {
            return this.addItemError('Invalid items');
        }
        const ids = targets.map(item => item.id);
        const itemMap = await this.getItemMapOnSale(ids);
        if (Object.values(itemMap).length !== targets.length) {
            return this.addItemError('Item not found');
        }
        this._quantityMap = {}; // to count total quantity for item
        for (const target of targets) {
            if (!await this.validateTarget(target, itemMap[target.id], {})) {
                return false;
            }
        }
        this._targets = targets;
    }

    getItemMapOnSale (ids) {
        const query = this.getMetadataClass('item').findById(ids);
        return query.and({onSale: true}).indexByKey().all();
    }

    validateTarget ({quantity}, item) {
        if (!Number.isInteger(quantity) || quantity < 1) {
            return this.addItemError(`Invalid quantity: ${item.get('name')}`);
        }
        return this.validateItem(item, quantity);
    }

    async validateItem (item, quantity) {
        const counter = this.countByQuantityMap(item.getId(), quantity);
        const stock = item.get('stock');
        if (counter > stock) {
            return this.addItemError(`Out of stock: ${item.get('name')}: In stock: ${stock}`);
        }
        if (item.get('bundled') && item.get('totalStock')) {
            const items = await item.related.resolve('items');
            for (const item of items) {
                if (!await this.validateItem(item, quantity)) {
                    return false;
                }
            }
        }
        return true;
    }

    countByQuantityMap (id, quantity) {
        quantity += this._quantityMap.hasOwnProperty(id) ? this._quantityMap[id] : 0;
        this._quantityMap[id] = quantity;
        return quantity;
    }

    addItemError (message) {
        return this.owner.addError('items', message);
    }

    beforeInsert () {
        this.owner.set('customer', this.owner.user.getId());
    }

    async afterInsert () {
        await this.createOrderItems();
    }

    async createOrderItems () {
        if (Array.isArray(this._targets)) {
            for (const target of this._targets) {
                await this.createOrderItem(target);
            }
        }
    }

    createOrderItem (data) {
        const itemClass = this.getMetadataClass('orderItem');
        const model = this.owner.createByView(itemClass);
        model.assign({
            item: itemClass.key.normalize(data.id),
            quantity: data.quantity,
            order: this.owner.getId()
        });
        return model.insert();
    }
};