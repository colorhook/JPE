/*!
 * Copyright (c) 2013 http://colorhook.com
 * @author: <a href="colorhook@gmail.com">colorhook</a>
 * @version: 2.0.0
 * @license: Released under the MIT License.
 *
 * Transplant from Flash AS3 APE Engine
 * http://www.cove.org/ape/
 * Copyright (c) 2006, 2007 Alec Cove
 * Released under the MIT License.
 */

//if no CMD or AMD used, use builtin define and require function.
;(function (scope) {

    if(scope.define || scope.require){
        return;
    }

    var modules = {};

    function build(module) {
        var factory = module.factory;
        module.exports = {};
        delete module.factory;
        factory(require, module.exports, module);
        return module.exports;
    }

    //引入模块
    var require = function (id) {
        if (!modules[id]) {
            throw 'module ' + id + ' not found';
        }
        return modules[id].factory ? build(modules[id]) : modules[id].exports;
    };

    //定义模块
    var define = function (id, factory) {
        if (modules[id]) {
            throw 'module ' + id + ' already defined';
        }
        modules[id] = {
            id: id,
            factory: factory
        };
    };

    define.remove = function (id) {
        delete modules[id];
    };

    scope.require = require;
    scope.define = define;

})(this);

define("JPE/JPE", function(require, exports, module) {

    var _guid = 0,
        _forceEnum = [
                'hasOwnProperty',
                'isPrototypeOf',
                'propertyIsEnumerable',
                'toString',
                'toLocaleString',
                'valueOf'
        ],
        _hasEnumBug = !{
            valueOf: 0
        }.propertyIsEnumerable('valueOf'),
        hasOwn = Object.prototype.hasOwnProperty,
        TO_STRING = Object.prototype.toString,
        isFunction = function(o) {
            return TO_STRING.call(o) === '[object Function]';
        },
        isObject = function(o, failfn) {
            var t = typeof o;
            return (o && (t === 'object' ||
                (!failfn && (t === 'function' || isFunction(o))))) || false;
        },

        mix = function(receiver, supplier, overwrite, whitelist, mode, merge) {
            var alwaysOverwrite, exists, from, i, key, len, to;

            if (!receiver || !supplier) {
                return receiver;
            }

            if (mode) {
                if (mode === 2) {
                    mix(receiver.prototype, supplier.prototype, overwrite,
                    whitelist, 0, merge);
                }

                from = mode === 1 || mode === 3 ? supplier.prototype : supplier;
                to = mode === 1 || mode === 4 ? receiver.prototype : receiver;

                if (!from || !to) {
                    return receiver;
                }
            } else {
                from = supplier;
                to = receiver;
            }

            alwaysOverwrite = overwrite && !merge;

            if (whitelist) {
                for (i = 0, len = whitelist.length; i < len; ++i) {
                    key = whitelist[i];

                    if (!hasOwn.call(from, key)) {
                        continue;
                    }
                    exists = alwaysOverwrite ? false : key in to;

                    if (merge && exists && isObject(to[key], true) && isObject(from[key], true)) {
                        mix(to[key], from[key], overwrite, null, 0, merge);
                    } else if (overwrite || !exists) {
                        to[key] = from[key];
                    }
                }
            } else {
                for (key in from) {
                    if (!hasOwn.call(from, key)) {
                        continue;
                    }
                    exists = alwaysOverwrite ? false : key in to;

                    if (merge && exists && isObject(to[key], true) && isObject(from[key], true)) {
                        mix(to[key], from[key], overwrite, null, 0, merge);
                    } else if (overwrite || !exists) {
                        to[key] = from[key];
                    }
                }
                if (_hasEnumBug) {
                    mix(to, from, overwrite, _forceEnum, mode, merge);
                }
            }

            return receiver;
        };

    mix(exports, {
        VERSION: '2.0.0',
        mix: mix,
        guid: function(pre) {
            var id = (_guid++) + "";
            return pre ? pre + id : id;
        },
        isFunction: isFunction,
        isObject: isObject,
        isUndefined: function(o) {
            return o === undefined;
        },

        isBoolean: function(o) {
            return TO_STRING.call(o) === '[object Boolean]';
        },

        isString: function(o) {
            return TO_STRING.call(o) === '[object String]';
        },

        isNumber: function(o) {
            return TO_STRING.call(o) === '[object Number]' && isFinite(o);
        },

        isArray: function(o) {
            return TO_STRING.call(o) === '[object Array]';
        },
        'Array': {
            indexOf: function(arr, item) {
                if (arr.indexOf) {
                    return arr.indexOf(item);
                }
                for (var i = 0, l = arr.length; i < l; i++) {
                    if (arr[i] === item) {
                        return i;
                    }
                }
                return -1;
            },
            each: function(arr, callback) {
                for (var i = 0, l = arr.length; i < l; i++) {
                    callback(arr[i], i, arr);
                }
            },
            remove: function(arr, item) {
                var index = this.indexOf(arr, item);
                if (index != -1) {
                    return arr.splice(index, 1);
                }
            }
        },
        merge: function() {
            var a = arguments,
                o = {}, i, l = a.length;
            for (i = 0; i < l; i = i + 1) {
                mix(o, a[i], true);
            }
            return o;
        },
        extend: function(r, s, px, sx) {
            if (!s || !r) {
                return r;
            }
            var OP = Object.prototype,
                O = function(o) {
                    function F() {}

                    F.prototype = o;
                    return new F();
                },
                sp = s.prototype,
                rp = O(sp);


            r.prototype = rp;
            rp.constructor = r;
            r.superclass = sp;

            if (s != Object && sp.constructor == OP.constructor) {
                sp.constructor = s;
            }

            if (px) {
                mix(rp, px, true);
            }

            if (sx) {
                mix(r, sx, true);
            }
            r.superclass = s;
            return r;
        },

        newClass: function(classDef, superclass, prop, statics) {
            var f = classDef;
            if (!f) {
                f = function() {
                    if (superclass) {
                        superclass.prototype.constructor.apply(this, arguments);
                    }
                }
            }
            if (superclass) {
                this.extend(f, superclass, prop, statics);
            } else {
                this.mix(f.prototype, prop);
                this.mix(f, statics);
            }
            return f;
        }

    });


});