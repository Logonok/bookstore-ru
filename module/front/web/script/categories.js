'use strict';

Vue.component('categories', {
    props: {
        category: String
    },
    data () {
        return {
            items: [],
            roots: []
        };
    },
    computed: {
        empty () {
            return !this.items.length;
        },
        visibleLevels () {
            let levels = [];
            let items = this.roots;
            while (items?.length) {
                levels.push(items);
                items = this.getActiveItem(items)?.children;
            }
            return levels;
        }
    },
    async created () {
        this.load();
    },
    activated () {
        if (this.category) {
            this.selectCategory(this.category);
        }
    },
    methods: {
        onItem (item, items) {
            const active = !item.active;
            this.clearActiveItems(items);
            item.active = active;
            this.emitChange();
        },
        emitChange () {
            const last = this.getLastActiveItem(this.items);
            this.$emit('change', this.getDescendantIds(last));
        },
        getItem (id) {
            for (const item of this.items) {
                if (item.id === id) {
                    return item;
                }
            }
        },
        getActiveItem (items) {
            for (const item of items) {
                if (item.active) {
                    return item;
                }
            }
        },
        getLastActiveItem (items) {
            for (const item of items) {
                if (item.active) {
                    return this.getLastActiveItem(item.children) || item;
                }
            }
        },
        clearActiveItems (items) {
            if (items) {
                for (const item of items) {
                    item.active = false;
                    this.clearActiveItems(item.children);
                }
            }
        },
        getDescendantIds (item) {
            const result = [];
            if (item) {
                result.push(item.id);
                for (const child of item.children) {
                    result.push(...this.getDescendantIds(child));
                }
            }
            return result;
        },
        async load (page) {
            const data = await this.fetchJson('list', {
                class: 'category',
                view: 'publicList'
            });
            this.items = data.items.map(this.formatItem, this);
            this.resolveHierarchy();
        },
        formatItem (data) {
            return {
                id: data._id,
                name: data.name,
                parent: data.parent,
                children: [],
                active: false
            };
        },
        resolveHierarchy () {
            for (const item of this.items) {
                if (item.parent) {
                    item.parent = this.getItem(item.parent);
                    item.parent.children.push(item);
                } else {
                    this.roots.push(item);
                }
            }
        },
        selectCategory (id) {
            const item = this.getItem(id);
            if (item) {
                this.clearActiveItems(this.items);
                this.activeAncestors(item);
                this.emitChange();
            }
        },
        activeAncestors (item) {
            if (item) {
                item.active = true;
                this.activeAncestors(item.parent);
            }
        }
    },
    template: '#categories'
});