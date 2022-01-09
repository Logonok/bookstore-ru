'use strict';

Vue.component('order', {
    props: {
        order: String,
        cart: Object
    },
    data () {
        return {
            id: null,
            date: null,
            state: null,
            stateTitle: null,
            items: [],
            price: null
        };
    },
    computed: {
        approved () {
            return this.state === 'approved';
        },
        draft () {
            return this.state === 'draft';
        }
    },
    async created () {
        await this.load();
    },
    methods: {
        async onConfirm () {
            await Jam.dialog.confirm('Подтвердить этот заказ?');
            await this.confirmOrder();
        },
        async confirmOrder () {
            try {
                await this.fetchText('transit', {
                    class: 'order',
                    view: 'viewByCustomer',
                    id: this.order,
                    transition: 'confirm'
                });
                this.load();
            } catch (err) {
                this.showError(err);
            }
        },
        async onDelete () {
            await Jam.dialog.confirmDeletion('Удалить этот заказ?');
            await this.deleteOrder();
        },
        async deleteOrder () {
            try {
                await this.fetchText('delete', {
                    class: 'order',
                    view: 'deleteByCustomer',
                    id: this.order
                });
                this.toOrders();
            } catch (err) {
                this.showError(err);
            }
        },
        async load () {
            const data = await this.fetchJson('read', {
                class: 'order',
                view: 'viewByCustomer',
                id: this.order
            });
            this.id = data._id;
            this.state = data._state;
            this.stateTitle = this.getValueTitle('_state', data);
            this.date = data._createdAt;
            this.items = this.formatItems(data.items);
            this.price = data.totalPrice;
        },
        formatItems (items) {
            return items.map(item => ({
                id: item._id,
                itemId: item.item?._id || item.item,
                name: item.item?.name || item.item,
                picture: this.getThumbnailUrl('picture', item.item?.picture, 'xs'),
                price: item.price,
                quantity: item.quantity
            }));
        }
    },
    template: '#order'
});