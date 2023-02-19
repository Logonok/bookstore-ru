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
        if (this._quantityMap.hasOwnProperty(id)) {
            quantity += this._quantityMap[id];
        }
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
        const items = await this.createOrderItems();
        await this.setTotalPrice(items);
    }

    async createOrderItems () {
        const items = [];
        if (Array.isArray(this._targets)) {
            for (const target of this._targets) {
                const item = await this.createOrderItem(target);
                items.push(item);
            }
        }
        return items;
    }

    async createOrderItem (data) {
        const itemClass = this.getMetadataClass('orderItem');
        const model = this.owner.createByView(itemClass);
        model.assign({
            item: itemClass.key.normalize(data.id),
            quantity: data.quantity,
            order: this.owner.getId()
        });
        await model.insert();
        return model;
    }

    async setTotalPrice (items) {
        let total = 0;
        for (let item of items) {
            total += item.get('price');
        }
        const discountClass = this.getMetadataClass('orderDiscount');
        const discount = await discountClass.getView('current').find().one();
        if (discount) {
            const minPrice = discount.get('minPrice');
            if (total >= minPrice) {
                const percent = discount.get('percent');
                total -= MathHelper.round(total * percent / 100, 2);
            }
        }
        this.owner.set('totalPrice', total);
        return this.owner.directUpdate();
    }
};

const MathHelper = require('areto/helper/MathHelper');