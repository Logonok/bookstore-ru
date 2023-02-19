'use strict';

Vue.component('my-cart', {
    props: {
        cart: Object
    },
    data () {
        return {
            items: [],
            orderDiscount: null
        };
    },
    computed: {
        empty () {
            return !this.cart.count();
        },
        totalPrice () {
            let total = 0;
            for (let item of this.items) {
                total += this.countItemDiscountPrice(item);
            }
            return total;
        },
        orderDiscountPercent () {
            if (this.orderDiscount) {
                if (this.totalPrice >= this.orderDiscount.price) {
                  return this.orderDiscount.percent;
                }
            }
            return 0;
        },
        finalPrice () {
            return this.totalPrice - Cart.countPercent(this.orderDiscountPercent, this.totalPrice);
        }
    },
    watch: {
        'cart.items': 'reload'
    },
    async created () {
        await this.load();
    },
    methods: {
        onIncrease (item) {
            this.changeQuantity(item, 1);
        },
        onReduce (item) {
            this.changeQuantity(item, -1);
        },
        async onRemove (item) {
            await Jam.dialog.confirm(`Удалить ${item.name} из корзины?`);
            item.cartItem.remove();
        },
        onOrder () {
            if (this.requireAuth()) {
                this.createOrder();
            }
        },
        async createOrder () {
            try {
                const items = this.formatItemsForOrder();
                await this.fetchText('create', {
                    class: 'order',
                    view: 'createFromCart',
                    data: {items}
                });
                this.cart.clear();
                this.$root.$emit('orders');
            } catch (err) {
                const message = Jam.Helper.parseJson(err.message)?.items;
                this.showError(message || err);
            }
        },
        formatItemsForOrder () {
            return this.items.map(({id, quantity}) => ({id, quantity}));
        },
        changeQuantity (item, delta) {
            if (item.cartItem.changeQuantity(delta)) {
                item.quantity = item.cartItem.quantity;
                item.price = item.cartItem.countPrice();
                item.cartItem.cart.save();
                this.updateItemDiscounts();
            }
        },
        async reload () {
            await this.load();
        },
        async load () {
            if (this.empty) {
                this.items = [];
            } else {
                await this.loadItems();
                await this.loadOrderDiscount();
            }
        },
        async loadItems () {
            if (this.empty) {
                this.items = [];
                return;
            }
            const {items} = await this.fetchJson('list', {
                class: 'item',
                view: 'publicList',
                filter: this.getFilter()
            });
            this.cart.sync(items);
            this.items = this.prepareItems(items);
            this.updateItemDiscounts();
        },
        getFilter () {
            return this.cart.items.map(item => ({
                or: true,
                attr: '_id',
                op: 'equal',
                value: item.id
            }));
        },
        prepareItems (items) {
            return items.map((item, index) => this.prepareItem(item));
        },
        prepareItem (item) {
            return {
                id: item._id,
                name: item.name,
                photo: this.getThumbnailUrl('photo', item.mainPhoto?._id, 'xs'),
                price: item.cartItem.countPrice(),
                quantity: item.cartItem.quantity,
                cartItem: item.cartItem,
                discount: item.discount,
                activeDiscount: null
            };
        },
        updateItemDiscounts () {
            for (const item of this.items) {
                item.activeDiscount = this.getActiveItemDiscount(item);
            }
        },
        getActiveItemDiscount (item) {
            if (item.cartItem.quantity >= item.discount?.minQuantity) {
                return item.discount.percent;
            }
        },
        countItemDiscountPrice (item) {
            const value = item.cartItem.countPrice();
            return item.activeDiscount
                ? value - Cart.countPercent(item.activeDiscount, value)
                : value;
        },
        async loadOrderDiscount () {
            const {items} = await this.fetchJson('list', {
                class: 'orderDiscount',
                view: 'current'
            });
            const data = items[0];
            if (data) {
                this.orderDiscount = {
                    percent: data.percent,
                    end: data.endDate,
                    price: data.minPrice
                };
            }
        }
    },
    template: '#my-cart'
});