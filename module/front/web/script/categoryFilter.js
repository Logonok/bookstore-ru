'use strict';

Vue.component('category-filter', {
    props: {
        name: String,
        label: String,
        items: Array,
        className: String
    },
    data () {
        return {
            value: ''
        };
    },
    watch: {
        value () {
            this.$emit('change', this.value);
        }
    },
    methods: {
        getSearchData () {
            if (this.value) {
                return {
                    type: 'descendant',
                    class: this.className,
                    value: {
                        attr: this.name,
                        op: 'equal',
                        value: this.value
                    }
                };
            }
        },
        clear () {
            this.value = '';
        }
    },
    template: '#categoryFilter'
});