define("JPE/Signal", function(require, exports, module) {

    var JPE = require("JPE/JPE");

    var Signal = function() {
        this.__bindings = [];
        this.__bindingsOnce = [];
    };

    JPE.mix(Signal.prototype, {
        add: function(listener) {
            return this.registerListener(listener);
        },
        addOnce: function(listener) {
            return this.registerListener(listener, true);
        },
        remove: function(listener) {
            var index = this.find(listener),
                oIndex = this.find(listener, this.__bindingsOnce);
            if (index >= 0) {
                this.__bindings.splice(index, 1);
            }
            if (oIndex >= 0) {
                this.__bindingsOnce.splice(oIndex, 1);
            }
        },
        removeAll: function() {
            this.__bindings.length = 0;
            this.__bindingsOnce.length = 0;
        },
        dispatch: function() {
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
        },
        getNumListeners: function() {
            return this.__bindings.length;
        },
        registerListener: function(listener, once) {
            var index = this.find(listener);
            if (index == -1 || !once) {
                this.__bindings.push(listener);
                if (once) {
                    this.__bindingsOnce.push(listener);
                }
            }

        },
        find: function(listener, arr) {
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
    });

    module.exports = Signal;

});