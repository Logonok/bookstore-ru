'use strict';

const Base = require('evado-meta-base/behavior/Behavior');

module.exports = class OrderItemBehavior extends Base {

    afterValidate () {
        if (this.owner.isNew() && !this.owner.hasError()) {
            return this.validate();
        }
    }

    async validate () {
        const item = await this.resolveItem();
        if (!item) {
            return this.owner.addError('item', 'Item is required');
        }
        if (!item.get('onSale')) {
            return this.owner.addError('item', 'This item is not for sale');
        }
        const quantity = this.getQuantity();
        if (quantity < 1) {
            return this.owner.addError('quantity', 'Invalid quantity');
        }
        if (!await this.validateStock(item)) {
            return this.owner.addError('quantity', 'Out of stock');
        }
    }

    async validateStock (item) {
        const stock = item.get('stock');
        if (this.getQuantity()> stock) {
            return false;
        }
        if (this.hasTotalStock(item)) {
            const items = await item.related.resolve('items');
            for (const item of items) {
                if (!await this.validateStock(item)) {
                    return false;
                }
            }
        }
        return true;
    }

    hasTotalStock (item) {
        return item.get('bundled') && item.get('totalStock');
    }

    getQuantity () {
        return this.get('quantity');
    }

    resolveItem () {
        return this.owner.related.resolve('item');
    }

    async beforeInsert () {
        await this.setPrice();
        await this.changeStock(-this.getQuantity());
    }

    afterDelete () {
        return this.changeStock(this.getQuantity());
    }

    async setPrice () {
        let item = await this.resolveItem();
        let quantity = this.getQuantity();
        let price = item.get('price');
        let discount = await item.related.resolve('discount');
        if (discount) {
            const minQuantity = discount.get('minQuantity');
            if (quantity >= minQuantity) {
                const percent = discount.get('percent');
                price -= price * percent / 100;
            }
        }
        price = MathHelper.round(price * quantity, 2);
        this.owner.set('price', price);
    }

    async changeStock (delta) {
        const item = await this.resolveItem();
        if (item) {
            await this.changeItemStock(item, delta);
            if (this.hasTotalStock(item)) {
                const items = await item.related.resolve('items');
                for (const item of items) {
                    await this.changeItemStock(item, delta);
                }
            }
        }
    }

    changeItemStock (item, delta) {
        const stock = item.get('stock') + delta;
        return item.findSelf().update({stock});
    }
};

const MathHelper = require('areto/helper/MathHelper');