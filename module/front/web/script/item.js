'use strict';

Vue.component('item', {
    props: {
        bundle: String,
        item: String,
        cart: Object,
        classProvider: Object
    },
    data () {
        return {
            id: null,
            name: null,
            description: null,
            picture: null,
            stock: 0,
            price: 0,
            onSale: null,
            bundled: null,
            quantity: 1,
            discount: null,
            items: [],
            propAttrs: [],
            loaded: false,
            categories: []
        };
    },
    computed: {
        inCart () {
            return this.cart.getItem(this.item);
        }
    },
    async created () {
        await this.load();
    },
    methods: {
        onCart () {
            this.$root.$emit('my-cart');
        },
        onBuy () {
            const result = this.validate();
            if (result !== true) {
                return this.showError(result);
            }
            this.cart.add(this.item, this.quantity);
        },
        validate () {
            if (!Number.isInteger(this.quantity) || this.quantity < 1) {
                return 'Неправильное количество';
            }
            if (this.quantity > this.stock) {
                return 'Количество превышает запас';
            }
            return true;
        },
        async load () {
            const data = await this.fetchJson('read', {
                class: 'item',
                view: 'publicView',
                id: this.item
            });
            this.id = data._id;
            this.name = data.name;
            this.description = data.description;
            this.picture = this.getThumbnailUrl('picture', data.picture);
            this.stock = data.stock;
            this.price = data.price;
            this.onSale = data.onSale;
            this.bundled = data.bundled;
            this.categories = this.formatCategories(data.categories);
            this.items = data.bundled ? await this.loadItems() : [];
            this.setDiscount(data.discount);
            await this.setPropAttrs(data);
            this.loaded = true;
        },
        formatCategories (items) {
            items = Array.isArray(items) ? items : [];
            return items.map(item => ({
                id: item._id,
                name: Jam.t(item.name, 'meta')
            }));
        },
        setDiscount (data) {
            if (data) {
                this.discount = {
                    percent: data.percent,
                    end: data.endDate,
                    quantity: data.minQuantity
                };
            }
        },
        async setPropAttrs (data) {
            const cls = await this.classProvider.getClass(data._class);
            const attrs = this.classProvider.getPropsAttrs(cls);
            for (const attr of attrs) {
                if (data[attr.name]) {
                    this.propAttrs.push(this.getPropAttr(attr, data));
                }
            }
        },
        getPropAttr (attr, data) {
            return {
                label: attr.label || attr.name,
                value: this.getPropAttrEnumText(attr, data)
            };
        },
        getPropAttrEnumText (attr, data) {
            if (Array.isArray(attr.enums)) {
                for (const {items} of attr.enums) {
                    for (const item of items) {
                        if (item.value === data[attr.name]) {
                            return item.text;
                        }
                    }
                }
            }
            return data[attr.name];
        },
        async loadItems () {
            const data = await this.fetchJson('list', {
                class: 'item',
                view: 'publicView',
                master: {
                    class: 'item',
                    attr: 'items',
                    id: this.item
                }
            });
            return data.items.map(this.formatItem, this);
        },
        formatItem (item) {
            return {
                id: item._id,
                name: item.name
            };
        }
    },
    template: '#item'
});