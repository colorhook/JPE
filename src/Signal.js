export default class Signal{
    constructor() {
        this.__bindings = [];
        this.__bindingsOnce = [];
    }
    add(listener) {
        return this.registerListener(listener);
    }
    addOnce(listener) {
        return this.registerListener(listener, true);
    }
    remove(listener) {
        var index = this.find(listener),
            oIndex = this.find(listener, this.__bindingsOnce);
        if (index >= 0) {
            this.__bindings.splice(index, 1);
        }
        if (oIndex >= 0) {
            this.__bindingsOnce.splice(oIndex, 1);
        }
    }
    removeAll() {
        this.__bindings.length = 0;
        this.__bindingsOnce.length = 0;
    }
    dispatch() {
        var args = Array.prototype.slice.call(arguments),
            list = this.__bindings,
            copyList = list.concat(),
            listener;

        for (var i = 0, l = copyList.length; i < l; i++) {
            listener = copyList[i];
            listener.apply(null, args);
            if (this.find(listener, this.__bindingsOnce) != -1) {
                this.remove(listener);
            }
        }
    }
    getNumListeners() {
        return this.__bindings.length;
    }
    registerListener(listener, once) {
        var index = this.find(listener);
        if (index == -1 || !once) {
            this.__bindings.push(listener);
            if (once) {
                this.__bindingsOnce.push(listener);
            }
        }

    }
    find(listener, arr) {
        arr = arr || this.__bindings;
        if (arr.indexOf) {
            return arr.indexOf(listener);
        }
        for (var i = 0, l = arr.length; i < l; i++) {
            if (arr[i] === listener) {
                return i;
            }
        }
        return -1;
    }
}

