'use strict';

Vue.component('category-filters', {
    props: {
        activeCategory: Object,
        classProvider: Object
    },
    data () {
        return {
            sets: []
        };
    },
    watch: {
        activeCategory: {
            async handler () {
                const names = this.activeCategory.filterClasses;
                this.sets = names?.length
                    ? await this.resolvePropsSets(names)
                    : [];
            },
            immediate: true
        }
    },
    methods: {
        onChange () {
            this.$emit('change', this.getSearchData());
        },
        onApply () {
            this.$emit('apply', this.getSearchData());
        },
        onClear () {
            this.clear();
        },
        clear () {
            this.getRefArray('filter').map(ref => ref.clear());
        },
        getSearchData () {
            const result = [];
            for (const ref of this.getRefArray('filter')) {
                const data = ref.getSearchData();
                if (data) {
                    result.push(data);
                }
            }
            return this.groupSearchData(result);
        },
        groupSearchData (items) {
            const map = Jam.ArrayHelper.indexArrays('class', items);
            if (Object.values(map).length < 2) {
                return items;
            }
            items = Object.values(map).map(items => ({items, or: true}));
            return [{items}];
        },
        async resolvePropsSets (names) {
            const classes = await this.classProvider.getClasses(names);
            return this.getPropsSets(classes);
        },
        getPropsSets (classes) {
            const result = [];
            for (const cls of classes) {
                const attrs = this.classProvider.getPropsAttrs(cls);
                if (attrs.length) {
                    const label = cls.label;
                    result.push({
                        label: cls.label,
                        items: attrs.map(this.resolvePropsItem, this)
                    });
                }
            }
            return result;
        },
        resolvePropsItem (data) {
            return {
                name: data.name,
                label: data.label,
                items: data.enums[0]?.items,
                className: data.className
            };
        }
    },
    template: '#categoryFilters'
});