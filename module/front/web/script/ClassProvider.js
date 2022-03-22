'use strict';

class ClassProvider {

    static filterByNames (names, items) {
        const result = [];
        for (const item of items) {
            if (names.includes(item.name)) {
                result.push(item);
            }
        }
        return result;
    }

    constructor (front) {
        this.front = front;
    }

    getClass (name) {
        return this.getProvider().then(items => this.constructor.filterByNames([name], items)[0]);
    }

    getClasses (names) {
        return this.getProvider().then(this.constructor.filterByNames.bind(this, names));
    }

    getAllClasses () {
        return this.getProvider();
    }

    getProvider () {
        if (!this._provider) {
            this._provider = this.load();
        }
        return this._provider;
    }

    load () {
        return this.front.fetchMeta('classes');
    }

    getPropsAttrs () {
        return this.getGroupAttrs('props', ...arguments);
    }

    getGroupAttrs (group, {attrs, name}) {
        const result = [];
        for (const attr of attrs) {
            if (attr.group === group) {
                attr.className = name;
                result.push(attr);
            }
        }
        return result;
    }
}