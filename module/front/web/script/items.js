'use strict';

Vue.component('items', {
    props: {
        pageSize: {
            type: Number,
            default: 8
        },
        cart: Object,
        category: String
    },
    data () {
        return {
            items: [],
            categories: []
        };
    },
    computed: {
        empty () {
            return !this.items.length;
        }
    },
    async created () {
        this.$on('load', this.onLoad);
        await this.reload();
    },
    methods: {
        onCategory (categories) {
            this.categories = categories;
            this.reload();
        },
        onSearch (text) {
            this.search = text;
            this.reload();
        },
        async reload () {
            await this.load(0);
        },
        async load (page) {
            const data = await this.fetchJson('list', {
                class: 'item',
                view: 'publicList',
                length: this.pageSize,
                start: page * this.pageSize,
                filter: this.getFilter()
            });
            const pageSize = this.pageSize;
            this.$emit('load', {...data, pageSize, page});
        },
        getFilter () {
            return [
                this.getCategoryFilter(),
                this.getSearchFilter()
            ].filter(item => item);
        },
        getCategoryFilter () {
            if (this.categories?.length) {
                return {
                    attr: 'categories',
                    op: 'equal',
                    value: this.categories
                };
            }
        },
        getSearchFilter () {
            if (this.search) {
                return {
                    attr: 'name',
                    op: 'contains',
                    value: this.search
                };
            }
        },
        onLoad ({items}) {
            this.items = this.formatItems(items);
        },
        formatItems (items) {
            return items.map(item => ({
                id: item._id,
                name: item.name,
                description: item.description,
                picture: this.getThumbnailUrl('picture', item.picture, 'sm'),
                stock: item.stock,
                price: item.price,
                bundled: item.bundled,
                discount: item.discount
            }));
        }
    },
    template: '#items'
});