'use strict';

const front = new Vue({
    el: '#front',
    props: {
        csrf: String,
        authUrl: String,
        dataUrl: String,
        fileUrl: String,
        metaUrl: String,
        thumbnailUrl: String,
        userId: String
    },
    propsData: {
        ...document.querySelector('#front').dataset
    },
    data () {
        this.cart = new Cart;
        return {
            activePage: 'items',
            activeBundle: null,
            activeItem: null,
            activeOrder: null,
            activeCategory: null,
            cart: this.cart
        };
    },
    computed: {
        activePageProps () {
            return {
                ...this.defaultPageProps,
                ...this.pagePros
            };
        },
        defaultPageProps () {
            return {
                cart: this.cart
            };
        },
        pagePros () {
            switch (this.activePage) {
                case 'items':
                    return {
                        category: this.activeCategory
                    };
                case 'item':
                    return {
                        key: this.activeItem,
                        item: this.activeItem,
                        bundle: this.activeBundle
                    };
                case 'order':
                    return {
                        key: this.activeOrder,
                        order: this.activeOrder
                    };
            }
        }
    },
    created () {
        this.$on('item', this.onItem);
        this.$on('items', this.onItems);
        this.$on('my-cart', this.onMyCart);
        this.$on('order', this.onOrder);
        this.$on('orders', this.onOrders);
    },
    methods: {
        onMyCart () {
            this.activePage = 'my-cart';
        },
        onItem (id, bundle) {
            this.activePage = 'item';
            this.activeItem = id;
            this.activeBundle = bundle;
        },
        onItems (category) {
            this.activePage = 'items';
            this.activeCategory = typeof category === 'string' ? category : null;
        },
        onOrder (id) {
            if (this.requireAuth()) {
                this.activePage = 'order';
                this.activeOrder = id;
            }
        },
        onOrders () {
            if (this.requireAuth()) {
                this.activePage = 'orders';
            }
        }
    }
});