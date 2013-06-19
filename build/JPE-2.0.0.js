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
define("JPE/AbstractCollection", function(require, exports, module) {

    var JPE = require("JPE/JPE");
    var CollisionDetector = require("JPE/CollisionDetector");

    var AbstractCollection = function() {
        this.isParented = false;
        this.container = null;
        this.particles = [];
        this.constraints = [];
    };

    JPE.mix(AbstractCollection.prototype, {

        initSelf: function() {
            var ps = this.particles,
                cs = this.constraints,
                pl = ps.length,
                cl = cs.length,
                i;

            for (i = 0; i < pl; i++) {
                ps[i].initSelf();
            }
            for (i = 0; i < cl; i++) {
                cs[i].initSelf();
            }
        },
        /**
         * @param p {AbstractParticle}
         */
        addParticle: function(p) {
            this.particles.push(p);
            if (this.isParented) {
                p.initSelf();
            }
        },
        removeParticle: function(p) {
            var ppos = JPE.Array.indexOf(this.particles, p);
            if (ppos == -1) {
                return;
            }
            this.particles.splice(ppos, 1);
            p.cleanup();
        },
        /**
         * Adds a Composite to the Group
         * @param c {Composite} The Composite to be added.
         */
        addConstraint: function(c) {
            this.constraints.push(c);
            c.isParented = true;
            if (this.isParented) {
                c.initSelf();
            }
        },
        /**
         * Remove a Composite from the Group
         * @param c {Composite} The Composite to be removed.
         */
        removeConstraint: function(c) {
            var cpos = JPE.Array.indexOf(this.constraints, c);
            if (cpos === -1) {
                return;
            }
            this.constraints.splice(cpos, 1);
            c.cleanup();
        },
        /**
         * Paints every members of this AbstractCollection by calling each members
         * <code>paint()</code> method.
         */
        paint: function() {
            var ps = this.particles,
                cs = this.constraints,
                pl = ps.length,
                cl = cs.length,
                p,
                c,
                i;

            for (i = 0; i < pl; i++) {
                p = ps[i];
                if ((!p.getFixed()) || p.getAlwaysRepaint()) {
                    p.paint();
                }
            }
            for (i = 0; i < cl; i++) {
                c = cs[i];
                if ((!c.getFixed()) || c.getAlwaysRepaint()) {
                    c.paint();
                }
            }
        },

        getAll: function() {
            return this.particles.concat(this.constraints);
        },
        /**
         * Calls the <code>cleanup()</code> methid if every member if 
         * this Group.
         * The cleanup() method is called automatically when a Group is 
         * removed form the JPE.
         */
        cleanup: function() {
            var ps = this.particles,
                cs = this.constraints,
                pl = ps.length,
                cl = cs.length,
                i;

            for (i = 0; i < pl; i++) {
                ps[i].cleanup();
            }
            for (i = 0; i < cl; i++) {
                cs[i].cleanup();
            }
        },
        integrate: function(dt2) {

            var ps = this.particles,
                pl = ps.length,
                i = 0;
            for (; i < pl; i++) {
                ps[i].update(dt2);
            }

        },
        satisfyConstraints: function() {
            var cs = this.constraints,
                cl = cs.length,
                i = 0;
            for (; i < cl; i++) {
                cs[i].resolve();
            }
        },
        checkInternalCollisions: function() {
            var ps = this.particles,
                cs = this.constraints,
                pl = ps.length,
                cl = cs.length,
                p,
                p2,
                c,
                i,
                j,
                k;

            for (i = 0; i < pl; i++) {

                p = ps[i];
                if (!p.getCollidable()) continue;

                for (j = i + 1; j < pl; j++) {
                    p2 = ps[j];
                    if (p2.getCollidable()) {
                        CollisionDetector.test(p, p2);
                    }
                }

                for (k = 0; k < cl; k++) {
                    c = cs[k];
                    if (c.getCollidable() && !c.isConnectedTo(p)) {
                        c.scp.updatePosition();
                        CollisionDetector.test(p, c.scp);
                    }
                }
            }
        },
        /**
         * @param ac {AbstractCollection}
         */
        checkCollisionsVsCollection: function(ac) {
            var ps = this.particles,
                acps = ac.particles,
                accs = ac.constraints,
                pl = ps.length,
                acpl = acps.length,
                accl = accs.length,
                p,
                p2,
                c,
                i,
                j,
                k;

            for (i = 0; i < pl; i++) {
                p = ps[i];
                if (!p.getCollidable()) continue;

                for (j = 0; j < acpl; j++) {
                    p2 = acps[j];
                    if (p2.getCollidable()) {
                        CollisionDetector.test(p, p2);
                    }
                }

                for (k = 0; k < accl; k++) {
                    c = accs[k];
                    if (c.getCollidable() && !c.isConnectedTo(p)) {
                        c.scp.updatePosition();
                        CollisionDetector.test(p, c.scp);

                    }
                }
            }

            //constraints start
            // every constraint in this collection...
            var _constraints = this.constraints,
                clen = _constraints.length,
                n,
                cga;

            for (j = 0; j < clen; j++) {
                cga = _constraints[j];
                if (!cga.getCollidable()) continue;

                for (n = 0; n < acpl; n++) {
                    p = acps[n];
                    if (p.getCollidable() && !cga.isConnectedTo(p)) {
                        cga.scp.updatePosition();
                        CollisionDetector.test(p, cga.scp);
                    }
                }
            }
            //constraints end
        }
    }, true);

    module.exports = AbstractCollection;
});
define("JPE/AbstractConstraint", function(require, exports, module) {

    var JPE = require("JPE/JPE");
    var AbstractItem = require("JPE/AbstractItem");
    var Signal = require("JPE/Signal");

    var AbstractConstraint = function(stiffness) {
        this.stiffness = stiffness;
        this.setStyle();
        this._pool = {};
        this.beforeRenderSignal = new Signal();
        this.afterRenderSignal = new Signal();
    };

    JPE.extend(AbstractConstraint, AbstractItem, {
        resolve: function() {}
    });

    module.exports = AbstractConstraint;
});
define("JPE/AbstractItem", function(require, exports, module) {

    var JPE = require("JPE/JPE");
    var Signal = require("JPE/Signal");
    var Engine = require("JPE/Engine");

    var AbstractItem = function() {
        this._visible = true;
        this._alwaysRepaint = true;
        this.lineTickness = 0;
        this.lineColor = 0x000000;
        this.lineAlpha = 1;
        this.fillColor = 0x333333;
        this.fillAlpha = 1;
        this.solid = true;
        this._pool = {};
        this.beforeRenderSignal = new Signal();
        this.afterRenderSignal = new Signal();
    }

    JPE.mix(AbstractItem.prototype, {
        get: function(name) {
            return this._pool[name];
        },
        set: function(name, value) {
            this._pool[name] = value;
        },
        initSelf: function() {
            var initSelfFunction = this.initSelfFunction || this.constructor.initSelfFunction;
            if (JPE.isFunction(initSelfFunction)) {
                initSelfFunction(this);
            } else {
                Engine.renderer.initSelf(this);
            }
            this.paint();
        },
        cleanup: function() {
            var cleanupFunction = this.cleanupFunction || this.constructor.cleanupFunction;
            if (JPE.isFunction(cleanupFunction)) {
                cleanupFunction(this);
            } else {
                Engine.renderer.cleanup(this);
            }
        },
        paint: function() {
            this.render();
        },

        render: function() {
            this.beforeRenderSignal.dispatch(this);
            var renderFunction = this.renderFunction || this.constructor.renderFunction;
            if (JPE.isFunction(renderFunction)) {
                renderFunction(this);
            } else {
                Engine.renderer.render(this);
            }
            this.afterRenderSignal.dispatch(this);
        },

        /**
         * visible setter & getter
         */
        getVisible: function() {
            return this._visible;
        },
        setVisible: function(value) {
            if (value == this._visible) {
                return;
            }
            this._visible = value;
            Engine.renderer.setVisible(this);
        },
        /**
         * awaysRepaint setter & getter
         */
        getAlwaysRepaint: function() {
            return this._alwaysRepaint;
        },
        setAlwaysRepaint: function(value) {
            this._alwaysRepaint = value
        },
        setStyle: function(lineThickness, lineColor, lineAlpha, fillColor, fillAlpha) {
            lineThickness = lineThickness || 0;
            lineColor = lineColor || 0x000;
            lineAlpha = lineAlpha || 1;
            fillColor = fillColor || 0x000;
            fillAlpha = fillAlpha || 1;
            this.setLine(lineThickness, lineColor, lineAlpha);
            this.setFill(fillColor, fillAlpha);
        },
        /**
         * Sets the style of the line for this Item. 
         */
        setLine: function(thickness, color, alpha) {
            this.lineThickness = thickness;
            this.lineColor = color;
            this.lineAlpha = alpha;
        },

        /**
         * Sets the style of the fill for this Item. 
         */
        setFill: function(color, alpha) {
            this.fillColor = color;
            this.fillAlpha = alpha;
        }
    });

    module.exports = AbstractItem;

});
define("JPE/AbstractParticle", function(require, exports, module) {

    var JPE = require("JPE/JPE");
    var Engine = require("JPE/Engine");
    var Collision = require("JPE/Collision");
    var AbstractItem = require("JPE/AbstractItem");
    var Interval = require("JPE/Interval");
    var Vector = require("JPE/Vector");
    var Signal = require("JPE/Signal");

    var AbstractParticle = function(x, y, isFixed, mass, elasticity, friction) {

        AbstractItem.prototype.constructor.apply(this, null);

        this.interval = new Interval(0, 0);

        this.curr = new Vector(x, y);
        this.prev = new Vector(x, y);
        this.samp = new Vector();
        this.temp = new Vector();
        this.smashable = false;
        this.maxExitVelocity = 0;
        this.smashSignal = new Signal();

        this.forces = new Vector();
        this.forceList = [];
        this.collision = new Collision(new Vector(), new Vector());
        this.firstCollision = false;
        this._fixed = isFixed;
        this._collidable = true;
        this.setMass(mass);
        this._elasticity = elasticity;
        this._friction = friction;
        this._center = new Vector();
        this._multisample = 0;
        this.setStyle();

    }

    JPE.extend(AbstractParticle, AbstractItem, {

        getElasticity: function() {
            return this._elasticity;
        },
        setElasticity: function(value) {
            this._elasticity = value;
        },
        /**
         * multisample getter & setter
         */
        getMultisample: function() {
            return this._multisample;
        },
        setMultisample: function(value) {
            return this._multisample = value;
        },
        /**
         * collidable getter & setter
         */
        getCollidable: function() {
            return this._collidable;
        },
        setCollidable: function(collidable) {
            this._collidable = collidable;
        },
        /**
         * fixed getter & setter
         */
        getFixed: function() {
            return this._fixed;
        },
        setFixed: function(fixed) {
            this._fixed = fixed;
        },
        /**
         * The mass of the particle. Valid values are greater than zero. By default, all particles
         * have a mass of 1. The mass property has no relation to the size of the particle.
         * 
         * @throws ArgumentError ArgumentError if the mass is set less than zero. 
         */
        getMass: function() {
            return this._mass;
        },


        /**
         * @private
         */
        setMass: function(m) {
            if (m <= 0) throw new Error("mass may not be set <= 0");
            this._mass = m;
            this._invMass = 1 / this._mass;
        },


        /**
         * The elasticity of the particle. Standard values are between 0 and 1. 
         * The higher the value, the greater the elasticity.
         * 
         * <p>
         * During collisions the elasticity values are combined. If one particle's
         * elasticity is set to 0.4 and the other is set to 0.4 then the collision will
         * be have a total elasticity of 0.8. The result will be the same if one particle
         * has an elasticity of 0 and the other 0.8.
         * </p>
         * 
         * <p>
         * Setting the elasticity to greater than 1 (of a single particle, or in a combined
         * collision) will cause particles to bounce with energy greater than naturally 
         * possible.
         * </p>
         */



        /**
         * Returns A Vector of the current location of the particle
         */
        getCenter: function() {
            this._center.setTo(this.getPx(), this.getPy())
            return this._center;
        },


        /**
         * The surface friction of the particle. Values must be in the range of 0 to 1.
         * 
         * <p>
         * 0 is no friction (slippery), 1 is full friction (sticky).
         * </p>
         * 
         * <p>
         * During collisions, the friction values are summed, but are clamped between 1 and 0.
         * For example, If two particles have 0.7 as their surface friction, then the resulting
         * friction between the two particles will be 1 (full friction).
         * </p>
         * 
         * <p>
         * In the current release, only dynamic friction is calculated. Static friction
         * is planned for a later release.
         * </p>
         *
         * <p>
         * There is a bug in the current release where colliding non-fixed particles with friction
         * greater than 0 will behave erratically. A workaround is to only set the friction of
         * fixed particles.
         * </p>
         * @throws ArgumentError ArgumentError if the friction is set less than zero or greater than 1
         */
        getFriction: function() {
            return this._friction;
        },


        /**
         * @private
         */
        setFriction: function(f) {
            if (f < 0 || f > 1) throw new Error("Legal friction must be >= 0 and <=1");
            this._friction = f;
        },




        /**
         * The position of the particle. Getting the position of the particle is useful
         * for drawing it or testing it for some custom purpose. 
         * 
         * <p>
         * When you get the <code>position</code> of a particle you are given a copy of the current
         * location. Because of this you cannot change the position of a particle by
         * altering the <code>x</code> and <code>y</code> components of the Vector you have retrieved from the position property.
         * You have to do something instead like: <code> position = new Vector(100,100)</code>, or
         * you can use the <code>px</code> and <code>py</code> properties instead.
         * </p>
         * 
         * <p>
         * You can alter the position of a particle three ways: change its position, set
         * its velocity, or apply a force to it. Setting the position of a non-fixed particle
         * is not the same as setting its fixed property to true. A particle held in place by 
         * its position will behave as if it's attached there by a 0 length spring constraint. 
         * </p>
         */
        getPosition: function() {
            return new Vector(this.curr.x, this.curr.y);
        },


        /**
         * @private
         */
        setPosition: function(p) {
            this.curr.copy(p);
            this.prev.copy(p);
        },


        /**
         * The x position of this particle
         */
        getPx: function() {
            return this.curr.x;
        },


        /**
         * @private
         */
        setPx: function(x) {
            this.curr.x = x;
            this.prev.x = x;
        },


        /**
         * The y position of this particle
         */
        getPy: function() {
            return this.curr.y;
        },


        /**
         * @private
         */
        setPy: function(y) {
            this.curr.y = y;
            this.prev.y = y;
        },


        /**
         * The velocity of the particle. If you need to change the motion of a particle, 
         * you should either use this property, or one of the addForce methods. Generally,
         * the addForce methods are best for slowly altering the motion. The velocity property
         * is good for instantaneously setting the velocity, e.g., for projectiles.
         * 
         */
        getVelocity: function() {
            return this.curr.minus(this.prev);
        },


        /**
         * @private
         */
        setVelocity: function(v) {
            this.prev = this.curr.minus(v);
        },
        /**
         * Adds a force to the particle. The mass of the particle is taken into 
         * account when using this method, so it is useful for adding forces 
         * that simulate effects like wind. Particles with larger masses will
         * not be affected as greatly as those with smaller masses. Note that the
         * size (not to be confused with mass) of the particle has no effect 
         * on its physical behavior with respect to forces.
         * 
         * @param f A Vector represeting the force added.
         */
        addForce: function(f) {
            this.forceList.push(f);
        },


        accumulateForces: function() {
            var f;
            var len = this.forceList.length;
            for (var i = 0; i < len; i++) {
                f = this.forceList[i];
                this.forces.plusEquals(f.getValue(this._invMass));
            }

            var globalForces = Engine.forces;
            len = globalForces.length;
            for (i = 0; i < len; i++) {
                f = globalForces[i];
                this.forces.plusEquals(f.getValue(this._invMass));
            }
        },

        clearForces: function() {
            this.forceList.length = 0;
            this.forces.setTo(0, 0);
        },

        /**
         * The <code>update()</code> method is called automatically during the
         * APEngine.step() cycle. This method integrates the particle.
         */
        update: function(dt2) {

            if (this.getFixed()) return;

            this.accumulateForces();

            // integrate
            this.temp.copy(this.curr);

            var nv = this.getVelocity().plus(this.forces.multEquals(dt2));

            this.curr.plusEquals(nv.multEquals(Engine.damping));
            this.prev.copy(this.temp);

            // clear the forces
            this.clearForces();
        },

        resetFirstCollision: function() {
            this.firstCollision = false;
        },

        getComponents: function(collisionNormal) {
            var vel = this.getVelocity();
            var vdotn = collisionNormal.dot(vel);
            this.collision.vn = collisionNormal.mult(vdotn);
            this.collision.vt = vel.minus(this.collision.vn);
            return this.collision;
        },


        resolveCollision: function(mtd, vel, n, d, o, p) {
            if (this.smashable) {
                var ev = vel.magnitude();
                if (ev > this.maxExitVelocity) {
                    this.smashSignal.dispatch("collision");
                }
            }
            if (this.getFixed() || !this.solid || !p.solid) {
                return;
            }
            this.curr.copy(this.samp);
            this.curr.plusEquals(mtd);
            this.setVelocity(vel);

        },

        getInvMass: function() {
            return (this.getFixed()) ? 0 : this._invMass;
        }
    });

    module.exports = AbstractParticle;

});
define("JPE/CircleParticle", function(require, exports, module) {

    var JPE = require("JPE/JPE");
    var AbstractParticle = require("JPE/AbstractParticle");

    var CircleParticle = function(x, y, radius, fixed, mass, elasticity, friction) {
        mass = mass || 1;
        elasticity = elasticity || 0.3;
        friction = friction || 0;
        this._radius = radius;
        AbstractParticle.prototype.constructor.call(this, x, y, fixed, mass, elasticity, friction);
    };

    JPE.extend(CircleParticle, AbstractParticle, {

        getRadius: function() {
            return this._radius;
        },

        /**
         * @private
         */
        setRadius: function(t) {
            this._radius = t;
        },

        /**
         * @private
         */
        getProjection: function(axis) {

            var c = this.samp.dot(axis);

            this.interval.min = c - this._radius;
            this.interval.max = c + this._radius;
            return this.interval;
        },
        /**
         * @private
         */
        getIntervalX: function() {
            this.interval.min = this.curr.x - this._radius;
            this.interval.max = this.curr.x + this._radius;
            return this.interval;
        },

        getIntervalY: function() {
            this.interval.min = this.curr.y - this._radius;
            this.interval.max = this.curr.y + this._radius;
            return this.interval;
        }
    });

    module.exports = CircleParticle;
});
define("JPE/Collision", function(require, exports, module) {

    module.exports = function(vn, vt) {
        this.vn = vn;
        this.vt = vt;
    }

});
define("JPE/CollisionDetector", function(require, exports, module) {

    var POSITIVE_INFINITY = Number.POSITIVE_INFINITY;
    var Vector = require("JPE/Vector");
    var CollisionResolver = require("JPE/CollisionResolver");
    var RigidItem = require("JPE/RigidItem");
    var RectangleParticle = require("JPE/RectangleParticle");
    var CircleParticle = require("JPE/CircleParticle");
    var RigidRectangle = require("JPE/RigidRectangle");
    var RigidCircle = require("JPE/RigidCircle");
    var RigidCollisionResolver = require("JPE/RigidCollisionResolver");

    var CollisionDetector = {

        cpa: null,
        cpb: null,
        hitpoint: [],
        hp: new Vector(),
        collNormal: null,
        collDepth: null,
        /**
         * Tests the collision between two objects. If there is a collision
         * it is passsed off to the CollisionResolver class.
         * @param objA {AbstractParticle}
         * @param objB {AbstractParticle}
         */
        test: function(objA, objB) {
            if (objA.getFixed() && objB.getFixed()) return;
            if (objA.getMultisample() == 0 && objB.getMultisample() == 0) {
                this.normVsNorm(objA, objB);
            } else if (objA.getMultisample() > 0 && objB.getMultisample() == 0) {
                this.sampVsNorm(objA, objB);
            } else if (objB.getMultisample() > 0 && objA.getMultisample() == 0) {
                this.sampVsNorm(objB, objA);
            } else if (objA.getMultisample() == objB.getMultisample()) {
                this.sampVsSamp(objA, objB);
            } else {
                this.normVsNorm(objA, objB);
            }
        },
        /**
         * default test for two non-multisampled particles
         */
        normVsNorm: function(objA, objB) {
            objA.samp.copy(objA.curr);
            objB.samp.copy(objB.curr);
            if (this.testTypes(objA, objB)) {
                CollisionResolver.resolve(this.cpa, this.cpb, this.collNormal, this.collDepth);
                return true;
            }
            return false;
        },

        /**
         * Tests two particles where one is multisampled and the
         * other is not. Let objectA be the mulitsampled particle.
         */
        sampVsNorm: function(objA, objB) {

            if (this.normVsNorm(objA, objB)) return;

            var objAsamples = objA.getMultisample(),
                s = 1 / (objAsamples + 1),
                t = s,
                i;
            //objB.samp.copy(objB.curr);

            for (i = 0; i <= objAsamples; i++) {
                objA.samp.setTo(objA.prev.x + t * (objA.curr.x - objA.prev.x),
                objA.prev.y + t * (objA.curr.y - objA.prev.y));
                if (this.testTypes(objA, objB)) {
                    CollisionResolver.resolve(this.cpa, this.cpb, this.collNormal, this.collDepth);
                    return;
                }
                t += s;
            }

        },
        /**
         * Tests two particles where both are of equal multisample rate
         */
        sampVsSamp: function(objA, objB) {

            if (this.normVsNorm(objA, objB)) return;

            var objAsamples = objA.getMultisample(),
                s = 1 / (objAsamples + 1),
                t = s,
                i;

            for (i = 0; i <= objAsamples; i++) {
                objA.samp.setTo(objA.prev.x + t * (objA.curr.x - objA.prev.x),
                objA.prev.y + t * (objA.curr.y - objA.prev.y));
                objB.samp.setTo(objB.prev.x + t * (objB.curr.x - objB.prev.x),
                objB.prev.y + t * (objB.curr.y - objB.prev.y));
                if (this.testTypes(objA, objB)) {
                    CollisionResolver.resolve(this.cpa, this.cpb, this.collNormal, this.collDepth);
                    return;
                }
                t += s;
            }
        },
        testTypes: function(objA, objB) {


            if (objA instanceof RigidItem && objB instanceof RigidItem) {
                this.testTypes2(objA, objB);
                return false;
            }

            if ((objA instanceof RectangleParticle) && (objB instanceof RectangleParticle)) {
                var r = this.testOBBvsOBB(objA, objB);
                return r;
            } else if ((objA instanceof CircleParticle) && (objB instanceof CircleParticle)) {
                return this.testCirclevsCircle(objA, objB);
            } else if ((objA instanceof RectangleParticle) && (objB instanceof CircleParticle)) {
                return this.testOBBvsCircle(objA, objB);
            } else if ((objA instanceof CircleParticle) && (objB instanceof RectangleParticle)) {
                return this.testOBBvsCircle(objB, objA);
            }
            return false;
        },
        testTypes2: function(objA, objB) {
            var result = false;
            var result2 = false;
            this.hitpoint = [];


            if (objA instanceof RigidRectangle && objB instanceof RigidRectangle) {
                result = this.testOBBvsOBB(objA, objB);
                if (result) {
                    result2 = this.findHitPointRR(objA, objB);
                }
            } else if (objA instanceof RigidCircle && objB instanceof RigidCircle) {
                result = this.testCirclevsCircle(objA, objB);
                if (result) {
                    result2 = this.findHitPointCC(objA, objB);
                }
            } else if (objA instanceof RigidRectangle && objB instanceof RigidCircle) {
                result = this.testOBBvsCircle(objA, objB);
                if (result) {
                    result2 = this.findHitPointRC(objA, objB);
                }
            } else if (objA instanceof RigidCircle && objB instanceof RigidRectangle) {
                result = this.testOBBvsCircle(objB, objA);
                if (result) {
                    result2 = this.findHitPointRC(objB, objA);
                    if (result2) {
                        this.getHP();
                        RigidCollisionResolver.resolve(objB, objA, this.hp, this.collNormal, this.collDepth);
                        return false;
                    }
                }
            }
            if (result2) {
                this.getHP();
                RigidCollisionResolver.resolve(objA, objB, this.hp, this.collNormal, this.collDepth);
                return false;
            } else {
                return result;
            }
        },
        getHP: function() {
            this.hp = new Vector();
            for (var i = 0; i < this.hitpoint.length; i++) {
                this.hp.plusEquals(this.hitpoint[i]);
            }
            if (this.hitpoint.length > 1) {
                this.hp.multEquals(1 / this.hitpoint.length);
            }
        },
        captures: function(r, vertices) {
            var re = false;
            for (var i = 0; i < vertices.length; i++) {
                if (r.captures(vertices[i])) {
                    this.hitpoint.push(vertices[i]);
                    re = true;
                }
            }
            return re;
        },
        findHitPointRR: function(a, b) {
            var r = false;
            if (this.captures(a, b.getVertices())) {
                r = true;
            }
            if (this.captures(b, a.getVertices())) {
                r = true;
            }
            return r;
        },
        findHitPointRC: function(a, b) {
            var r = false;
            if (this.captures(b, a.getVertices())) {
                r = true;
            }
            if (this.captures(a, b.getVertices(a.getNormals()))) {
                r = true;
            }
            return r;
        },
        findHitPointCC: function(a, b) {
            var d = b.samp.minus(a.samp);
            if (d.magnitude() <= (a.range + b.range)) {
                this.hitpoint.push(d.normalize().multEquals(a.range).plusEquals(a.samp));
                return true;
            } else {
                return false;
            }
        },
        /**
         * Tests the collision between two RectangleParticles (aka OBBs).
         * If there is a collision it determines its axis and depth, and
         * then passes it off to the CollisionResolver for handling.
         *
         * @param ra {RectangleParticle}
         * @param rb {RectangleParticle}
         */
        testOBBvsOBB: function(ra, rb) {

            this.collDepth = POSITIVE_INFINITY;

            for (var i = 0; i < 2; i++) {
                var axisA = ra.getAxes()[i],
                    rai = ra.getProjection(axisA),
                    rbi = rb.getProjection(axisA),
                    depthA = this.testIntervals(rai, rbi);

                if (depthA == 0) return false;

                var axisB = rb.getAxes()[i],
                    depthB = this.testIntervals(ra.getProjection(axisB), rb.getProjection(axisB));

                if (depthB == 0) return false;

                var absA = Math.abs(depthA),
                    absB = Math.abs(depthB);

                if (absA < Math.abs(this.collDepth) || absB < Math.abs(this.collDepth)) {
                    var altb = absA < absB;
                    this.collNormal = altb ? axisA : axisB;
                    this.collDepth = altb ? depthA : depthB;
                }

            }

            this.cpa = ra;
            this.cpb = rb;
            return true;
        },
        /**
         * Tests the collision between a RectangleParticle (aka an OBB) and a
         * CircleParticle. If thereis a collision it determines its axis and 
         * depth, and then passws it off to the CollisionResolver.
         * @param ra {RectangleParticle}
         * @param ca {CircleParticle}
         */
        testOBBvsCircle: function(ra, ca) {
            this.collDepth = POSITIVE_INFINITY;
            var depths = new Array(2),
                i = 0,
                boxAxis,
                depth,
                r;

            for (; i < 2; i++) {
                boxAxis = ra.getAxes()[i];
                depth = this.testIntervals(ra.getProjection(boxAxis), ca.getProjection(boxAxis));
                if (depth == 0) return false;

                if (Math.abs(depth) < Math.abs(this.collDepth)) {
                    this.collNormal = boxAxis;
                    this.collDepth = depth;
                }
                depths[i] = depth;
            }

            r = ca.getRadius();

            if (Math.abs(depths[0]) < r && Math.abs(depths[1]) < r) {
                var vertex = this.closestVertexOnOBB(ca.samp, ra);

                this.collNormal = vertex.minus(ca.samp);
                var mag = this.collNormal.magnitude();
                this.collDepth = r - mag;
                if (this.collDepth > 0) {
                    this.collNormal.divEquals(mag);
                } else {
                    return false;
                }
            }
            this.cpa = ra;
            this.cpb = ca;
            return true;
        },
        /**
         * Tests the colision between two CircleParticles.
         * If there is a collision it determines its axis and depth, 
         * and then passes it off to the CollisionResolver for handing.
         */
        testCirclevsCircle: function(ca, cb) {
            var depthX = this.testIntervals(ca.getIntervalX(), cb.getIntervalX());
            if (depthX == 0) return false;

            var depthY = this.testIntervals(ca.getIntervalY(), cb.getIntervalY());
            if (depthY == 0) return false;

            this.collNormal = ca.samp.minus(cb.samp);
            var mag = this.collNormal.magnitude();
            this.collDepth = ca.getRadius() + cb.getRadius() - mag;

            if (this.collDepth > 0) {
                this.collNormal.divEquals(mag);
                this.cpa = ca;
                this.cpb = cb;
                return true;
            }
            return false;
        },
        /**
         * Return 0 if the intervals do not overlap.
         * Return smallest depth if they do.
         * @param intervalA {Interval}
         * @param intervalB {Interval}
         */
        testIntervals: function(intervalA, intervalB) {
            if (intervalA.max < intervalB.min) return 0;
            if (intervalB.max < intervalA.min) return 0;

            var lenA = intervalB.max - intervalA.min,
                lenB = intervalB.min - intervalA.max;

            return (Math.abs(lenA) < Math.abs(lenB)) ? lenA : lenB;
        },
        /**
         * Returns the location of the closest vertex on r to point p
         * @param p {Vector}
         * @param r {RectangleParticle}
         */
        closestVertexOnOBB: function(p, r) {
            var d = p.minus(r.samp),
                q = new Vector(r.samp.x, r.samp.y),
                i = 0;

            for (; i < 2; i++) {
                var dist = d.dot(r.getAxes()[i]);
                if (dist >= 0) {
                    dist = r.getExtents()[i];
                } else if (dist < 0) {
                    dist = -r.getExtents()[i];
                }
                q.plusEquals(r.getAxes()[i].mult(dist));
            }
            return q;
        }
    };

    module.exports = CollisionDetector;

});
define("JPE/CollisionResolver", function(require, exports, module) {

    exports.resolve = function(pa, pb, normal, depth) {

        // a collision has occured. set the current positions to sample locations
        //pa.curr.copy(pa.samp);
        //pb.curr.copy(pb.samp);
        var mtd = normal.mult(depth);
        var te = pa.getElasticity() + pb.getElasticity();

        var sumInvMass = pa.getInvMass() + pb.getInvMass();
        // the total friction in a collision is combined but clamped to [0,1]
        var tf = this.clamp(1 - (pa.getFriction() + pb.getFriction()), 0, 1);

        // get the collision components, vn and vt
        var ca = pa.getComponents(normal);
        var cb = pb.getComponents(normal);

        // calculate the coefficient of restitution based on the mass, as the normal component
        var vnA = (cb.vn.mult((te + 1) * pa.getInvMass()).plus(
        ca.vn.mult(pb.getInvMass() - te * pa.getInvMass()))).divEquals(sumInvMass);

        var vnB = (ca.vn.mult((te + 1) * pb.getInvMass()).plus(
        cb.vn.mult(pa.getInvMass() - te * pb.getInvMass()))).divEquals(sumInvMass);

        // apply friction to the tangental component
        ca.vt.multEquals(tf);
        cb.vt.multEquals(tf);

        // scale the mtd by the ratio of the masses. heavier particles move less 
        var mtdA = mtd.mult(pa.getInvMass() / sumInvMass);
        var mtdB = mtd.mult(-pb.getInvMass() / sumInvMass);

        // add the tangental component to the normal component for the new velocity 
        vnA.plusEquals(ca.vt);
        vnB.plusEquals(cb.vt);


        pa.resolveCollision(mtdA, vnA, normal, depth, -1, pb);
        pb.resolveCollision(mtdB, vnB, normal, depth, 1, pa);
    };

    exports.clamp = function(input, min, max) {
        if (input > max) return max;
        if (input < min) return min;
        return input;
    };

});
define("JPE/Composite", function(require, exports, module) {

    var JPE = require("JPE/JPE");
    var Vector = require("JPE/Vector");
    var MathUtil = require("JPE/MathUtil");
    var AbstractCollection = require("JPE/AbstractCollection");

    var Composite = function() {
        AbstractCollection.prototype.constructor.apply(this);
        this.delta = new Vector();
    };

    JPE.extend(Composite, AbstractCollection, {

        rotateByRadian: function(angleRadians, center) {
            var p,
                pa = this.particles,
                len = pa.length;

            for (var i = 0; i < len; i++) {
                p = pa[i];
                var radius = p.getCenter().distance(center);
                var angle = this.getRelativeAngle(center, p.getCenter()) + angleRadians;
                p.setPx(Math.cos(angle) * radius + center.x);
                p.setPy(Math.sin(angle) * radius + center.y);
            }
        },
        /**
         * Rotates the Composite to an angle specified in degrees, around a given center
         */
        rotateByAngle: function(angleDegrees, center) {
            var angleRadians = angleDegrees * MathUtil.PI_OVER_ONE_EIGHTY;
            this.rotateByRadian(angleRadians, center);
        },


        /**
         * The fixed state of the Composite. Setting this value to true or false will
         * set all of this Composite's component particles to that value. Getting this 
         * value will return false if any of the component particles are not fixed.
         */
        getFixed: function() {
            for (var i = 0, l = this.particles.length; i < l; i++) {
                if (!particles[i].getFixed()) return false;
            }
            return true;
        },


        /**
         * @private
         */
        setFixed: function(b) {
            for (var i = 0, l = this.particles.length; i < l; i++) {
                this.particles[i].setFixed(b);
            }
        },


        getRelativeAngle: function(center, p) {
            this.delta.setTo(p.x - center.x, p.y - center.y);
            return Math.atan2(this.delta.y, this.delta.x);
        }
    });

    module.exports = Composite;
});
define("JPE/EaselRenderer", function(require, exports, module) {

    var JPE = require("JPE/JPE");
    var Renderer = require("JPE/Renderer");
    var RectangleParticle = require("JPE/RectangleParticle");
    var RigidRectangle = require("JPE/RigidRectangle");
    var CircleParticle = require("JPE/CircleParticle");
    var RigidCircle = require("JPE/RigidCircle");
    var WheelParticle = require("JPE/WheelParticle");
    var SpringConstraintParticle = require("JPE/SpringConstraintParticle");
    var SpringConstraint = require("JPE/SpringConstraint");


    var EaselRenderer = function(stage) {
        Renderer.prototype.constructor.apply(this, arguments);
        this.stage = stage;
        this.registerDelegate('RectangleParticle', RectangleParticle, new EaselRenderer.RectangleParticleDelegate(this));
        this.registerDelegate('RigidRectangle', RigidRectangle, new EaselRenderer.RectangleParticleDelegate(this));
        this.registerDelegate('CircleParticle', CircleParticle, new EaselRenderer.CircleParticleDelegate(this));
        this.registerDelegate('RigidCircle', RigidCircle, new EaselRenderer.WheelParticleDelegate(this));
        this.registerDelegate('WheelParticle', WheelParticle, new EaselRenderer.WheelParticleDelegate(this));
        this.registerDelegate('SpringConstraintParticle', SpringConstraintParticle, new EaselRenderer.SpringConstraintParticleDelegate(this));
        this.registerDelegate('SpringConstraint', SpringConstraint, new EaselRenderer.SpringConstraintDelegate(this));
    };

    JPE.extend(EaselRenderer, Renderer);

    EaselRenderer.AbstractDelegate = function(renderer) {
        this.renderer = renderer;
        this.stage = renderer.stage;
    };

    JPE.mix(EaselRenderer.AbstractDelegate.prototype, {
        initSelf: function(item) {
            var sprite = new Container(),
                shape = new Shape();
            sprite.addChild(shape);
            if (!item.getVisible()) {
                sprite.visible = false;
            }
            this.stage.addChild(sprite);
            item.set('sprite', sprite);
            item.set('shape', shape);
            this.drawShape(item);
        },
        cleanup: function(item) {
            var s = item.get('sprite');
            if (s) {
                this.stage.removeChild(s);
            }
        },
        drawShape: function(item) {},
        setVisible: function(item) {
            var sprite = item.get('sprite');
            if (sprite) {
                sprite.visible = item.getVisible();
            }
        },
        render: function(item) {}
    }, true);

    EaselRenderer.RectangleParticleDelegate = function() {
        EaselRenderer.AbstractDelegate.apply(this, arguments);
    }
    JPE.extend(EaselRenderer.RectangleParticleDelegate, EaselRenderer.AbstractDelegate, {
        drawShape: function(item) {
            var shape = item.get('shape'),
                g = shape.graphics,
                w = item.getExtents()[0] * 2,
                h = item.getExtents()[1] * 2;
            shape.x = -w / 2;
            shape.y = -h / 2;
            g.clear();
            if (item.lineThickness) {
                g.setStrokeStyle(item.lineThickness)
                g.beginStroke(Graphics.getRGB(item.lineColor, item.lineAlpha));
            }
            g.beginFill(Graphics.getRGB(item.fillColor, item.fillAlpha));
            g.drawRect(0, 0, w, h);
            g.endFill();
        },
        render: function(item) {
            var sprite = item.get('sprite'),
                x = item.curr.x,
                y = item.curr.y,
                w = item.getExtents()[0] * 2,
                h = item.getExtents()[1] * 2,
                r = item.getAngle();

            if (sprite) {
                this.drawShape(item);
                sprite.rotation = r;
                sprite.x = x;
                sprite.y = y;
            }
        }
    });

    EaselRenderer.CircleParticleDelegate = function() {
        EaselRenderer.AbstractDelegate.apply(this, arguments);
    }
    JPE.extend(EaselRenderer.CircleParticleDelegate, EaselRenderer.AbstractDelegate, {
        drawShape: function(item) {
            var r = item.getRadius(),
                shape = item.get('shape'),
                g = shape.graphics;

            g.clear();
            if (item.lineThickness) {
                g.setStrokeStyle(item.lineThickness)
                g.beginStroke(Graphics.getRGB(item.lineColor, item.lineAlpha));
            }
            g.beginFill(Graphics.getRGB(item.fillColor, item.fillAlpha));
            g.drawCircle(0, 0, r);
            g.endFill();
        },
        render: function(item) {
            var x = item.curr.x,
                y = item.curr.y,
                sprite = item.get('sprite');

            if (sprite) {
                this.drawShape(item);
                sprite.x = x;
                sprite.y = y;
            }
        }
    });


    EaselRenderer.WheelParticleDelegate = function() {
        EaselRenderer.AbstractDelegate.apply(this, arguments);
    }
    JPE.extend(EaselRenderer.WheelParticleDelegate, EaselRenderer.AbstractDelegate, {
        drawShape: function(item) {

            var r = item.getRadius(),
                shape = item.get('shape'),
                g = shape.graphics;

            g.clear();
            if (item.lineThickness) {
                g.setStrokeStyle(item.lineThickness);
                g.beginStroke(Graphics.getRGB(item.lineColor, item.lineAlpha));
            }
            g.beginFill(Graphics.getRGB(item.fillColor, item.fillAlpha));
            g.drawCircle(0, 0, r);

            g.setStrokeStyle(1);
            g.beginStroke(Graphics.getRGB(0xffffff - item.lineColor));
            g.moveTo(-r, 0);
            g.lineTo(r, 0);
            g.moveTo(0, -r);
            g.lineTo(0, r);
            g.endFill();
        },
        render: function(item) {
            var x = item.curr.x,
                y = item.curr.y,
                r = item.getAngle(),
                sprite = item.get('sprite');

            if (sprite) {
                this.drawShape(item);
                sprite.rotation = r;
                sprite.x = x;
                sprite.y = y;
            }

        }
    });


    EaselRenderer.SpringConstraintParticleDelegate = function() {
        EaselRenderer.AbstractDelegate.apply(this, arguments);
    }
    JPE.extend(EaselRenderer.SpringConstraintParticleDelegate, EaselRenderer.AbstractDelegate, {
        initSelf: function(item) {
            var inner = new Container(),
                shape = new Shape(),
                parent = item.parent,
                parentSprite = parent.get('sprite');
            if (!parentSprite) {
                parentSprite = new Container();
                parent.set('sprite', parentSprite);
            }
            item.set('sprite', inner);
            item.set('shape', shape);
            if (!item.getVisible()) {
                sprite.visible = false;
            }
            inner.addChild(shape);
            parentSprite.addChild(inner);
            this.drawShape(item);
            this.stage.addChild(parentSprite);
        },
        cleanup: function(item) {
            var parent = item.parent;
            this.stage.removeChild(parent.get('sprite'));
        },
        drawShape: function(item) {
            var shape = item.get('shape'),
                g = shape.graphics,
                parent = item.parent,
                c = parent.getCenter(),
                w = parent.getCurrLength() * item.getRectScale(),
                h = item.getRectHeight();


            g.clear();
            if (parent.lineThickness) {
                g.setStrokeStyle(parent.lineThickness);
                g.beginStroke(Graphics.getRGB(parent.lineColor, parent.lineAlpha));
            }
            g.beginFill(Graphics.getRGB(parent.fillColor, parent.fillAlpha));
            g.drawRect(-w / 2, -h / 2, w, h);
            g.endFill();
        },
        render: function(item) {

            var parent = item.parent,
                c = parent.getCenter(),
                s = item.get('sprite'),
                shape = item.get('shape');

            s.x = c.x;
            s.y = c.y;
            if (item.scaleToLength) {
                s.width = parent.getCurrLength() * item.getRectScale();
            }
            s.rotation = parent.getAngle();


        }
    });

    EaselRenderer.SpringConstraintDelegate = function() {
        EaselRenderer.AbstractDelegate.apply(this, arguments);
    }
    JPE.extend(EaselRenderer.SpringConstraintDelegate, EaselRenderer.AbstractDelegate, {
        initSelf: function(item) {},
        cleanup: function(item) {
            var sprite = item.get('sprite');
            if (sprite) {
                this.stage.removeChild(sprite);
            }
        },
        initShape: function(item) {
            var sprite = new Container(),
                shape = new Shape();

            item.set('sprite', sprite);
            item.set('shape', shape);
            sprite.addChild(shape);
            this.stage.addChild(sprite);
        },
        drawShape: function(item) {

            var shape = item.get('shape'),
                g = shape.graphics,
                p1 = item.p1,
                p2 = item.p2;

            g.clear();
            if (item.lineThickness) {
                g.setStrokeStyle(item.lineThickness);
                g.beginStroke(Graphics.getRGB(item.lineColor, item.lineAlpha));
            }
            g.moveTo(p1.getPx(), p1.getPy());
            g.lineTo(p2.getPx(), p2.getPy());
            g.endFill();
        },
        render: function(item) {
            if (item.getCollidable()) {
                item.scp.paint();
            } else {
                if (!item.get('shape')) {
                    this.initShape(item);
                }
                this.drawShape(item);
            }
        }
    });

    module.exports = EaselRenderer;
});
define("JPE/Engine", function(require, exports, module) {

    module.exports = {
        forces: null,
        masslessForce: null,
        groups: null,
        numGroups: 0,
        timeStep: 0,
        renderer: null,
        damping: 1,
        constraintCycles: 0,
        constraintCollisionCycles: 1,

        init: function(dt) {
            if (isNaN(dt)) {
                dt = 0.25;
            }
            this.timeStep = dt * dt;
            this.groups = [];
            this.forces = [];
        },
        addForce: function(v) {
            this.forces.push(v);
        },
        removeForce: function(v) {
            JPE.Array.remove(this.forces, v);
        },
        removeAllForce: function() {
            this.forces = [];
        },
        addGroup: function(g) {
            this.groups.push(g);
            g.isParented = true;
            this.numGroups++;
            g.initSelf();
        },
        removeGroup: function(g) {
            var gpos = JPE.Array.indexOf(this.groups, g);
            if (gpos == -1) {
                return;
            }
            this.groups.splice(gpos, 1);
            g.isParented = false;
            this.numGroups--;
            g.cleanup();
        },
        step: function() {
            this.integrate();
            for (var j = 0; j < this.constraintCycles; j++) {
                this.satisfyConstraints();
            }
            for (var i = 0; i < this.constraintCollisionCycles; i++) {
                this.satisfyConstraints();
                this.checkCollisions();
            }
        },
        paint: function() {
            for (var j = 0; j < this.numGroups; j++) {
                var g = this.groups[j];
                g.paint();
            }
        },
        integrate: function() {
            for (var j = 0; j < this.numGroups; j++) {
                var g = this.groups[j];
                g.integrate(this.timeStep);
            }
        },
        satisfyConstraints: function() {
            for (var j = 0; j < this.numGroups; j++) {
                var g = this.groups[j];
                g.satisfyConstraints();
            }
        },
        checkCollisions: function() {
            for (var j = 0; j < this.numGroups; j++) {
                var g = this.groups[j];
                g.checkCollisions();
            }
        }
    }
});
define("JPE/Group", function(require, exports, module) {

    var AbstractCollection = require("JPE/AbstractCollection");
    var JPE = require("JPE/JPE");
    /**
     * @param collideInternal {Boolean} Determines if the members 
     * if this Group are checked for collision with one another.
     */
    var Group = function(collideInternal) {
        AbstractCollection.prototype.constructor.call(this);
        this.composites = [];
        this.collisionList = [];
        this.collideInternal = collideInternal;
    };

    JPE.extend(Group, AbstractCollection, {

        initSelf: function() {
            AbstractCollection.prototype.initSelf.apply(this, arguments);
            for (var i = 0, l = this.composites.length; i < l; i++) {
                this.composites[i].initSelf();
            }
        },
        /**
         * Adds a Composite to the Group
         * @param c {Composite} The Composite to be added.
         */
        addComposite: function(c) {
            this.composites.push(c);
            c.isParented = true;
            if (this.isParented) {
                c.initSelf();
            }
        },
        /**
         * Remove a Composite from the Group
         * @param c {Composite} The Composite to be removed.
         */
        removeComposite: function(c) {
            var cpos = JPE.Array.indexOf(this.composites, c);
            if (cpos === -1) {
                return;
            }
            this.composites.splice(cpos, 1);
            c.isParented = false;
            c.cleanup();
        },
        /**
         * Paints all members of this group. This method is called
         * automatically by JPE.
         */
        paint: function() {
            AbstractCollection.prototype.paint.apply(this, arguments);
            var cs = this.composites,
                i = 0,
                c,
                len = this.composites.length;
            for (; i < len; i++) {
                c = cs[i];
                c.paint();
            }
        },
        /**
         * Adds a Group instance to be checked for collision against
         * this one.
         * @param g {Group}
         */
        addCollidable: function(g) {
            this.collisionList.push(g);
        },
        /**
         * Removes a Group from the collidable list of this Group.
         * @param g {Group}
         */
        removeCollidable: function(g) {
            var pos = JPE.Array.indexOf(this.collisionList, g);
            if (pos == -1) {
                return;
            }
            this.collisionList.splice(pos, 1);
        },
        /**
         * Adds an array of AbstractCollection instances to be
         * checked for collision against this one.
         * @param list {Array}
         */
        addCollidableList: function(list) {
            var i = 0,
                l = list.length,
                cl = this.collisionList;
            for (; i < l; i++) {
                cl.push(list[i]);
            }
        },

        /**
         * Return an array of every particle, constraint, and 
         * composite added to the Group.
         */
        getAll: function() {
            return this.particles.concat(this.constraints).concat(this.composites);
        },
        /**
         * Calls the <code>cleanup()</code> methid if every member if 
         * this Group.
         * The cleanup() method is called automatically when a Group is 
         * removed form the JPE.
         */
        cleanup: function() {
            AbstractCollection.prototype.cleanup.apply(this, arguments);
            var cs = this.composites,
                cl = cs.length,
                i = 0;
            for (; i < cl; i++) {
                cs[i].cleanup();
            }
        },
        integrate: function(dt2) {
            AbstractCollection.prototype.integrate.apply(this, arguments);
            var cs = this.composites,
                cl = cs.length,
                i = 0;
            for (; i < cl; i++) {
                cs[i].integrate(dt2);
            }

        },
        satisfyConstraints: function() {
            AbstractCollection.prototype.satisfyConstraints.apply(this, null);
            var cs = this.composites,
                cl = cs.length,
                i = 0;
            for (; i < cl; i++) {
                cs[i].satisfyConstraints();
            }
        },
        checkCollisions: function() {
            if (this.collideInternal) {
                this.checkCollisionGroupInternal();
            }

            var cl = this.collisionList,
                cllen = cl.length,
                i = 0;

            for (; i < cllen; i++) {
                this.checkCollisionVsGroup(cl[i]);
            }
        },
        checkCollisionGroupInternal: function() {
            this.checkInternalCollisions();

            var cs = this.composites,
                c,
                c2,
                clen = cs.length,
                i = 0,
                j;

            for (; i < clen; i++) {
                c = cs[i];
                c.checkCollisionsVsCollection(this);

                for (j = i + 1; j < clen; j++) {
                    c2 = cs[j];
                    c.checkCollisionsVsCollection(c2);
                }
            }
        },
        /**
         * @param g {Group}
         */
        checkCollisionVsGroup: function(g) {
            this.checkCollisionsVsCollection(g);

            var cs = this.composites,
                c,
                gc,
                clen = cs.length,
                gclen = g.composites.length,
                i = 0,
                j;

            for (; i < clen; i++) {
                c = cs[i];
                c.checkCollisionsVsCollection(g);
                for (j = 0; j < gclen; j++) {
                    gc = g.composites[j];
                    c.checkCollisionsVsCollection(gc);
                }
            }

            for (j = 0; j < gclen; j++) {
                gc = g.composites[j];
                this.checkCollisionsVsCollection(gc);
            }
        }
    });

    module.exports = Group;
});
define("JPE/IForce", function(require, exports, module) {
    var IForce = function() {};
    IForce.prototype.getValue = function(invMass) {
        return null;
    };
    module.exports = IForce;
});
define("JPE/Interval", function(require, exports, module) {
    module.exports = function(min, max) {
        this.min = min;
        this.max = max;
    };
});
define("JPE/MathUtil", function(require, exports, module) {

    exports.ONE_EIGHTY_OVER_PI = 180 / Math.PI;
    exports.PI_OVER_ONE_EIGHTY = Math.PI / 180;

    exports.clamp = function(n, min, max) {
        if (n < min) return min;
        if (n > max) return max;
        return n;
    };
    exports.sign = function(val) {
        if (val < 0) return -1
        return 1;
    };

});
define("JPE/RectangleParticle", function(require, exports, module) {

    var JPE = require("JPE/JPE");
    var AbstractParticle = require("JPE/AbstractParticle");
    var Vector = require("JPE/Vector");
    var MathUtil = require("JPE/MathUtil");

    /**
     * @param x The initial x position.
     * @param y The initial y position.
     * @param width The width of this particle.
     * @param height The height of this particle.
     * @param rotation The rotation of this particle in radians.
     * @param fixed Determines if the particle is fixed or not. Fixed particles
     * are not affected by forces or collisions and are good to use as surfaces.
     * Non-fixed particles move freely in response to collision and forces.
     * @param mass The mass of the particle
     * @param elasticity The elasticity of the particle. Higher values mean more elasticity.
     * @param friction The surface friction of the particle. 
     * <p>
     * Note that RectangleParticles can be fixed but still have their rotation property 
     * changed.
     * </p>
     */
    var RectangleParticle = function(x, y, width, height, rotation, fixed, mass, elasticity, friction) {
        rotation = rotation || 0;
        mass = mass || 1;
        elasticity = elasticity || 0.3;
        friction = friction || 0;
        this._extents = [width / 2, height / 2];
        this._axes = [new Vector(0, 0), new Vector(0, 0)];
        this.setRadian(rotation);
        AbstractParticle.prototype.constructor.call(this, x, y, fixed, mass, elasticity, friction);
    };

    JPE.extend(RectangleParticle, AbstractParticle, {

        getRadian: function() {
            return this._radian;
        },

        /**
         * @private
         */
        setRadian: function(t) {
            this._radian = t;
            this.setAxes(t);
        },

        /**
         * The rotation of the RectangleParticle in degrees. 
         */
        getAngle: function() {
            return this.getRadian() * MathUtil.ONE_EIGHTY_OVER_PI;
        },

        /**
         * @private
         */
        setAngle: function(a) {
            this.setRadian(a * MathUtil.PI_OVER_ONE_EIGHTY);
        },


        setWidth: function(w) {
            this._extents[0] = w / 2;
        },


        getWidth: function() {
            return this._extents[0] * 2;
        },


        setHeight: function(h) {
            this._extents[1] = h / 2;
        },


        getHeight: function() {
            return this._extents[1] * 2;
        },

        /**
         * @private
         */
        getExtents: function() {
            return this._extents;
        },


        /**
         * @private
         */
        getProjection: function(axis) {
            var axes = this.getAxes(),
                extents = this.getExtents(),
                radius = extents[0] * Math.abs(axis.dot(axes[0])) +
                    extents[1] * Math.abs(axis.dot(axes[1]));

            var c = this.samp.dot(axis);
            this.interval.min = c - radius;
            this.interval.max = c + radius;
            return this.interval;
        },

        /**
         * @private
         */
        getAxes: function() {
            return this._axes;
        },

        /**
         * 
         */
        setAxes: function(t) {
            var s = Math.sin(t),
                c = Math.cos(t),
                axes = this.getAxes();

            axes[0].x = c;
            axes[0].y = s;
            axes[1].x = -s;
            axes[1].y = c;
        }
    });

    module.exports = RectangleParticle;

});
define("JPE/Renderer", function(require, exports, module) {

    var JPE = require("JPE/JPE");

    var Renderer = function() {
        this._items = {};
        this._delegates = {};
    };

    JPE.mix(Renderer.prototype, {

        registerDelegate: function(type, itemCls, delegate) {
            this._items[type] = itemCls;
            this._delegates[type] = delegate;
        },
        getParticleClass: function(type) {
            return this._items[type];
        },
        getDelegateClass: function(type) {
            return this._delegates[type];
        },
        findDelegateByParticle: function(item) {
            var ic = item.constructor,
                ps = this._items,
                ds = this._delegates;
            while (ic.superclass) {
                for (var prop in ps) {
                    if (ps[prop] === ic) {
                        return ds[prop]
                    }
                }
                ic = ic.superclass;
            }
            return null;
        },
        getRenderDelegate: function(item) {
            var rd = item.get('renderDelegate');
            if (rd == undefined) {
                rd = this.findDelegateByParticle(item)
                item.set('renderDelegate', rd);
            }
            return rd;
        },
        initSelf: function(item) {
            var rd = this.getRenderDelegate(item);
            rd && rd.initSelf(item);
        },
        cleanup: function(item) {
            var rd = this.getRenderDelegate(item);
            rd && rd.cleanup(item);
        },
        render: function(item) {
            var rd = this.getRenderDelegate(item);
            rd && rd.render(item);
        },
        setVisible: function(item) {
            var rd = this.getRenderDelegate(item);
            rd && rd.setVisible(item);
        }
    });

    module.exports = Renderer;
});
define("JPE/RigidCircle", function(require, exports, module) {

    var JPE = require("JPE/JPE");
    var RigidItem = require("JPE/RigidItem");


    var RigidCircle = function(x, y, radius, isFixed, mass, elasticity, friction, radian, angularVelocity) {
        if (mass == null) {
            mass = -1;
        }
        if (mass == -1) {
            mass = Math.PI * radius * radius;
        }
        if(elasticity == null){
            elasticity = 0.3;
        }
        if(friction == null){
            friction = 0.2;
        }
        if(radian == null){
            radian = 0;
        }
        if(angularVelocity == null){
            angularVelocity = 0;
        }
        this._radius = radius;
        RigidItem.prototype.constructor.call(this, x, y, radius,
        isFixed, mass, mass * radius * radius / 2, elasticity, friction, radian, angularVelocity);
    };

    JPE.extend(RigidCircle, RigidItem, {


        getRadius: function() {
            return this._radius;
        },
        getVertices: function(axis) {
            var vertices = [];
            for (var i = 0; i < axis.length; i++) {
                vertices.push(axis[i].mult(this._radius).plusEquals(this.samp));
            }
            return vertices;
        },
        getProjection: function(axis) {
            var c = this.samp.dot(axis);
            this.interval.min = c - this._radius;
            this.interval.max = c + this._radius;

            return this.interval;
        },
        getIntervalX: function() {
            this.interval.min = this.samp.x - this._radius;
            this.interval.max = this.samp.x + this._radius;
            return this.interval;
        },
        getIntervalY: function() {
            this.interval.min = this.samp.y - this._radius;
            this.interval.max = this.samp.y + this._radius;
            return this.interval;
        }
    });

    module.exports = RigidCircle;

});
define("JPE/RigidCollisionResolver", function(require, exports, module) {

    module.exports = {

        resolve: function(pa, pb, hitpoint, normal, depth) {
                
            var mtd = normal.mult(depth);
            var te = pa._elasticity + pb._elasticity;
            var sumInvMass = pa.getInvMass() + pb.getInvMass();

            //rewrite collision resolve
            var vap = pa.getVelocityOn(hitpoint);
            var vbp = pb.getVelocityOn(hitpoint);
            var vabp = vap.minus(vbp);
            var vn = normal.mult(vabp.dot(normal));
            var l = vabp.minus(vn).normalize();
            var n = normal.plus(l.mult(-0.1)).normalize();
            var ra = hitpoint.minus(pa.samp);
            var rb = hitpoint.minus(pb.samp);

            var raxn = ra.cross(n);
            var rbxn = rb.cross(n);
            var j = -vabp.dot(n) * (1 + te / 2) / (sumInvMass + raxn * raxn / pa.mi + rbxn * rbxn / pb.mi);

            var vna = pa.getVelocity().plus(n.mult(j * pa.getInvMass()));
            var vnb = pb.getVelocity().plus(n.mult(-j * pb.getInvMass()));
   
            var aaa = j * raxn / pa.mi;
            var aab = -j * rbxn / pb.mi;
            if (Math.abs(aaa) > 0.1 || Math.abs(aab) > 0.1) {}

            pa.resolveRigidCollision(aaa, pb);
            pb.resolveRigidCollision(aab, pa);
            var mtdA = mtd.mult(pa.getInvMass() / sumInvMass);
            var mtdB = mtd.mult(-pb.getInvMass() / sumInvMass);
            pa.resolveCollision(mtdA, vna, normal, depth, -1, pb);
            pb.resolveCollision(mtdB, vnb, normal, depth, 1, pa);
        }
    }

});
define("JPE/RigidItem", function(require, exports, module) {
    var JPE = require("JPE/JPE");
    var AbstractParticle = require("JPE/AbstractParticle");
    var MathUtil = require("JPE/MathUtil");
    var Vector = require("JPE/Vector");
    var Engine = require("JPE/Engine");

    var RigidItem = function(x, y, range, isFixed, mass, mi, elasticity, friction, radian, angularVelocity) {
        if (mass == null) {
            mass = 1;
        }
        if (mi == null) {
            mi = -1;
        }
        if (elasticity == null) {
            elasticity = 0.3;
        }
        if (friction == null) {
            friction = 0.2;
        }
        radian = radian || 0;
        angularVelocity = angularVelocity || 0;

        this.range = range;
        this.frictionalCoefficient = friction;
        this._radian = radian;
        this.angularVelocity = angularVelocity;
        this.torque = 0;

        if (isFixed) {
            mass = Number.POSITIVE_INFINITY;
            this.mi = Number.POSITIVE_INFINITY;
        } else if (mi == -1) {
            this.mi = mass;
        } else {
            this.mi = mi;
        }
        AbstractParticle.prototype.constructor.call(this, x, y, isFixed, mass, elasticity, 0);
    };

    JPE.extend(RigidItem, AbstractParticle, {

        getRadian: function() {
            return this._radian;
        },
        setRadian: function(n) {
            this._radian = n;
            this.setAxes(n);
        },
        getAngle: function() {
            return this.getRadian() * MathUtil.ONE_EIGHTY_OVER_PI;
        },
        setAngle: function(a) {
            this.setRadian(a * MathUtil.PI_OVER_ONE_EIGHTY);
        },
        setAxes: function() {},
        update: function(dt2) {
            var r = this._radian + this.angularVelocity * Engine.damping;
            this.setRadian(r);
            AbstractParticle.prototype.update.call(this, dt2);
            this.torque = 0;
        },
        addTorque: function(aa) {
            //console.log("addTorque:" + aa);
            this.angularVelocity += aa;
        },
        resolveRigidCollision: function(aa, p) {
            if (this.getFixed() || !this.solid || !p.solid) {
                return;
            }
            this.addTorque(aa);
        },
        captures: function(vertex) {
            var d = vertex.distance(this.samp) - this.range;
            return d <= 0;
        },
        getVelocityOn: function(vertex) {
            var arm = vertex.minus(this.samp);
            var v = arm.normalize();
            var r = this.angularVelocity * arm.magnitude();
            var d = new Vector(-v.y, v.x).multEquals(r);
            return d.plusEquals(this.getVelocity());
        }

    });

    module.exports = RigidItem;

});
define("JPE/RigidRectangle", function(require, exports, module) {

    var JPE = require("JPE/JPE");
    var Vector = require("JPE/Vector");
    var RigidItem = require("JPE/RigidItem");

    var RigidRectangle = function(x, y, width, height, radian, isFixed, mass, elasticity, friction, angularVelocity) {
        if(mass == null){
            mass = -1;
        }
        if (mass == -1) {
            mass = width * height;
        }
        radian = radian || 0;
        if (elasticity == null) {
            elasticity = 0.3;
        }
        if (friction == null) {
            friction = 0.2;
        }

        angularVelocity = angularVelocity || 0;

        RigidItem.prototype.constructor.call(this, x, y, Math.sqrt(width * width / 4 + height * height / 4),
        isFixed, mass, mass * (width * width + height * height) / 12, elasticity, friction, radian, angularVelocity);

        this._extents = [width / 2, height / 2];
        this._axes = [new Vector(0, 0), new Vector(0, 0)];
        this._normals = [];
        this._marginCenters = [];
        this._vertices = [];
        for (var i = 0; i < 4; i++) {
            this._normals.push(new Vector(0, 0));
            this._marginCenters.push(new Vector(0, 0));
            this._vertices.push(new Vector(0, 0));
        }
    };

    JPE.extend(RigidRectangle, RigidItem, {
        getProjection: function(axis) {
            var axes = this.getAxes(),
                extents = this.getExtents(),
                radius = extents[0] * Math.abs(axis.dot(axes[0])) +
                    extents[1] * Math.abs(axis.dot(axes[1]));

            var c = this.samp.dot(axis);
            this.interval.min = c - radius;
            this.interval.max = c + radius;
            return this.interval;
        },

        captures: function(vertex) {
            var marginCenters = this.getMarginCenters();
            for (var i = 0; i < marginCenters.length; i++) {
                var x = vertex.minus(marginCenters[i].plus(this.samp)).dot(this.getNormals()[i]);
                if (x > 0.01) {
                    return false;
                }
            }
            return true;
        },
        getMarginCenters: function() {
            return this._marginCenters;
        },

        getNormals: function() {
            return this._normals;
        },

        getExtents: function() {
            return this._extents;
        },

        getAxes: function() {
            return this._axes;
        },

        setAxes: function(n) {
            var s = Math.sin(n);
            var c = Math.cos(n);
            var axes = this.getAxes();
            var extents = this.getExtents();

            var _normals = this._normals;
            var _marginCenters = this._marginCenters;
            var _vertices = this._vertices;
            axes[0].x = c;
            axes[0].y = s;
            axes[1].x = -s;
            axes[1].y = c;
            //
            _normals[0].copy(axes[0]);
            _normals[1].copy(axes[1]);
            _normals[2] = axes[0].mult(-1);
            _normals[3] = axes[1].mult(-1);

            //.plusEquals(curr)
            _marginCenters[0] = axes[0].mult(extents[0]);
            _marginCenters[1] = axes[1].mult(extents[1]);
            _marginCenters[2] = axes[0].mult(-extents[0]);
            _marginCenters[3] = axes[1].mult(-extents[1]);

            //.minusEquals(curr)
            _vertices[0] = _marginCenters[0].plus(_marginCenters[1]);
            _vertices[1] = _marginCenters[1].plus(_marginCenters[2]);
            _vertices[2] = _marginCenters[2].plus(_marginCenters[3]);
            _vertices[3] = _marginCenters[3].plus(_marginCenters[0]);
        },
        getVertices: function() {
            var r = [];
            var _vertices = this._vertices;
            for (var i = 0; i < _vertices.length; i++) {
                r.push(_vertices[i].plus(this.samp));
            }
            return r;
        }
    });

    module.exports = RigidRectangle;
});
define("JPE/RimParticle", function(require, exports, module) {


    var JPE = require("JPE/JPE");
    var Engine = require("JPE/Engine");
    var Vector = require("JPE/Vector");

    /**
     * The RimParticle is really just a second component of the wheel model.
     * The rim particle is simulated in a coordsystem relative to the wheel's 
     * center, not in worldspace.
     * 
     * Origins of this code are from Raigan Burns, Metanet Software
     */
    var RimParticle = function(r, mt) {

        this.sp = 0;
        this.av = 0;
        this.wr = r;
        this.maxTorque = mt;
        this.curr = new Vector(r, 0);
        this.prev = new Vector(0, 0);
    };

    JPE.mix(RimParticle.prototype, {

        getSpeed: function() {
            return this.sp;
        },

        setSpeed: function(s) {
            this.sp = s;
        },

        getAngularVelocity: function() {
            return this.av;
        },

        setAngularVelocity: function(s) {
            this.av = s;
        },

        /**
         * Origins of this code are from Raigan Burns, Metanet Software
         */
        update: function(dt) {

            //clamp torques to valid range
            this.sp = Math.max(-this.maxTorque, Math.min(this.maxTorque, this.sp + this.av));
            //apply torque
            //this is the tangent vector at the rim particle
            var dx = -this.curr.y;
            var dy = this.curr.x;

            //normalize so we can scale by the rotational speed
            var len = Math.sqrt(dx * dx + dy * dy);
            dx /= len;
            dy /= len;

            this.curr.x += this.sp * dx;
            this.curr.y += this.sp * dy;

            var ox = this.prev.x;
            var oy = this.prev.y;
            var px = this.prev.x = this.curr.x;
            var py = this.prev.y = this.curr.y;

            this.curr.x += Engine.damping * (px - ox);
            this.curr.y += Engine.damping * (py - oy);

            // hold the rim particle in place
            var clen = Math.sqrt(this.curr.x * this.curr.x + this.curr.y * this.curr.y);
            var diff = (clen - this.wr) / clen;

            this.curr.x -= this.curr.x * diff;
            this.curr.y -= this.curr.y * diff;
        }
    });

    module.exports = RimParticle;

});
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
define("JPE/SpringConstraint", function(require, exports, module) {

    var JPE = require("JPE/JPE");
    var AbstractConstraint = require("JPE/AbstractConstraint");
    var MathUtil = require("JPE/MathUtil");
    var SpringConstraintParticle = require("JPE/SpringConstraintParticle");

    /**
     * @param p1 The first particle this constraint is connected to.
     * @param p2 The second particle this constraint is connected to.
     * @param stiffness The strength of the spring. Valid values are between 0 and 1. Lower values
     * result in softer springs. Higher values result in stiffer, stronger springs.
     * @param collidable Determines if the constraint will be checked for collision
     * @param rectHeight If the constraint is collidable, the height of the collidable area
     * can be set in pixels. The height is perpendicular to the two attached particles.
     * @param rectScale If the constraint is collidable, the scale of the collidable area
     * can be set in value from 0 to 1. The scale is percentage of the distance between 
     * the the two attached particles.
     * @param scaleToLength If the constraint is collidable and this value is true, the 
     * collidable area will scale based on changes in the distance of the two particles. 
     */
    var SpringConstraint = function(p1, p2, stiffness, collidable, rectHeight, rectScale, scaleToLength) {
        stiffness = stiffness || 0.5;
        rectHeight = rectHeight || 1;
        rectScale = rectScale || 1;
        AbstractConstraint.prototype.constructor.call(this, stiffness);
        this.p1 = p1;
        this.p2 = p2;
        this.checkParticlesLocation();
        this._restLength = this.getCurrLength();
        this.inited = false;
        this.setCollidable(collidable, rectHeight, rectScale, scaleToLength);
    };

    JPE.extend(SpringConstraint, AbstractConstraint, {

        getRadian: function() {
            var d = this.getDelta();
            return Math.atan2(d.y, d.x);
        },


        /**
         * The rotational value created by the positions of the two particles attached to this
         * SpringConstraint. You can use this property to in your own painting methods, along with the 
         * <code>center</code> property. 
         * 
         * @returns A Number representing the rotation of this SpringConstraint in degrees
         */
        getAngle: function() {
            return this.getRadian() * MathUtil.ONE_EIGHTY_OVER_PI;
        },


        /**
         * The center position created by the relative positions of the two particles attached to this
         * SpringConstraint. You can use this property to in your own painting methods, along with the 
         * rotation property.
         * 
         * @returns A Vector representing the center of this SpringConstraint
         */
        getCenter: function() {
            return (this.p1.curr.plus(this.p2.curr)).divEquals(2);
        },


        /**
         * If the <code>collidable</code> property is true, you can set the scale of the collidible area
         * between the two attached particles. Valid values are from 0 to 1. If you set the value to 1, then
         * the collision area will extend all the way to the two attached particles. Setting the value lower
         * will result in an collision area that spans a percentage of that distance. Setting the value
         * higher will cause the collision rectangle to extend past the two end particles.
         */
        setRectScale: function(s) {
            if (this.scp == null) return;
            this.scp.setRectScale(s);
        },


        /**
         * @private
         */
        getRectScale: function() {
            return this.scp.getRectScale();
        },


        /**
         * Returns the length of the SpringConstraint, the distance between its two 
         * attached particles.
         */
        getCurrLength: function() {
            return this.p1.curr.distance(this.p2.curr);
        },


        /**
         * If the <code>collidable</code> property is true, you can set the height of the 
         * collidible rectangle between the two attached particles. Valid values are greater 
         * than 0. If you set the value to 10, then the collision rect will be 10 pixels high.
         * The height is perpendicular to the line connecting the two particles
         */
        getRectHeight: function() {
            return this.scp.getRectHeight();
        },


        /**
         * @private
         */
        setRectHeight: function(h) {
            if (this.scp == null) return;
            this.scp.setRectHeight(h);
        },


        /**
         * The <code>restLength</code> property sets the length of SpringConstraint. This value will be
         * the distance between the two particles unless their position is altered by external forces. 
         * The SpringConstraint will always try to keep the particles this distance apart. Values must 
         * be > 0.
         */
        getRestLength: function() {
            return this._restLength;
        },


        /**
         * @private
         */
        setRestLength: function(r) {
            if (r <= 0) throw new Error("restLength must be greater than 0");
            this._restLength = r;
        },


        /**
         * Determines if the area between the two particles is tested for collision. If this value is on
         * you can set the <code>rectHeight</code> and <code>rectScale</code> properties 
         * to alter the dimensions of the collidable area.
         */



        /**
         * For cases when the SpringConstraint is <code>collidable</code> and only one of the
         * two end particles are fixed. This value will dispose of collisions near the
         * fixed particle, to correct for situations where the collision could never be
         * resolved. Values must be between 0.0 and 1.0.
         */
        getFixedEndLimit: function() {
            return this.scp.getFixedEndLimit();
        },


        /**
         * @private
         */
        setFixedEndLimit: function(f) {
            if (this.scp == null) return;
            this.scp.setFixedEndLimit(f);
        },

        getCollidable: function() {
            return this._collidable;
        },
        /**
         *
         */
        setCollidable: function(b, rectHeight, rectScale, scaleToLength) {
            this._collidable = b;
            this.scp = null;

            if (this._collidable) {
                if (this.scp) {
                    this.scp.cleanup();
                }
                this.scp = new SpringConstraintParticle(this.p1, this.p2, this, rectHeight, rectScale, scaleToLength);
                if (this.inited) {
                    this.scp.initSelf();
                }
            }
        },


        /**
         * Returns true if the passed particle is one of the two particles attached to this SpringConstraint.
         */
        isConnectedTo: function(p) {
            return (p == this.p1 || p == this.p2);
        },


        /**
         * Returns true if both connected particle's <code>fixed</code> property is true.
         */
        getFixed: function() {
            return this.p1.getFixed() && this.p2.getFixed();
        },


        /**
         * Sets up the visual representation of this SpringContraint. This method is called 
         * automatically when an instance of this SpringContraint's parent Group is added to 
         * the APEngine, when  this SpringContraint's Composite is added to a Group, or this 
         * SpringContraint is added to a Composite or Group.
         */
        initSelf: function() {
            if (this.getCollidable()) {
                this.scp.initSelf();
            }
            this.inited = true;
        },
        cleanup: function() {
            if (this.getCollidable()) {
                this.scp.cleanup();
            }
            this.inited = false
        },


        getDelta: function() {
            return this.p1.curr.minus(this.p2.curr);
        },



        /**
         * @private
         */
        resolve: function() {

            var p1 = this.p1,
                p2 = this.p2;

            if (p1.getFixed() && p2.getFixed()) return;

            var deltaLength = this.getCurrLength();
            var diff = (deltaLength - this.getRestLength()) / (deltaLength * (p1.getInvMass() + p2.getInvMass()));
            var dmds = this.getDelta().mult(diff * this.stiffness);
            this.p1.curr.minusEquals(dmds.mult(p1.getInvMass()));
            this.p2.curr.plusEquals(dmds.mult(p2.getInvMass()));
        },


        /**
         * if the two particles are at the same location offset slightly
         */
        checkParticlesLocation: function() {
            if (this.p1.curr.x == this.p2.curr.x && this.p1.curr.y == this.p2.curr.y) {
                this.p2.curr.x += 0.0001;
            }
        }
    });


    module.exports = SpringConstraint;
});
define("JPE/SpringConstraintParticle", function(require, exports, module) {

    var JPE = require("JPE/JPE");
    var RectangleParticle = require("JPE/RectangleParticle");
    var Vector = require("JPE/Vector");
    var MathUtil = require("JPE/MathUtil");
    var RectangleParticle = require("JPE/RectangleParticle");
    var CircleParticle = require("JPE/CircleParticle");

    /**
     * @param p1 The first particle this constraint is connected to.
     * @param p2 The second particle this constraint is connected to.
     * @param stiffness The strength of the spring. Valid values are between 0 and 1. Lower values
     * result in softer springs. Higher values result in stiffer, stronger springs.
     * @param collidable Determines if the constraint will be checked for collision
     * @param rectHeight If the constraint is collidable, the height of the collidable area
     * can be set in pixels. The height is perpendicular to the two attached particles.
     * @param rectScale If the constraint is collidable, the scale of the collidable area
     * can be set in value from 0 to 1. The scale is percentage of the distance between 
     * the the two attached particles.
     * @param scaleToLength If the constraint is collidable and this value is true, the 
     * collidable area will scale based on changes in the distance of the two particles. 
     */
    var SpringConstraintParticle = function(p1, p2, p, rectHeight, rectScale, scaleToLength) {

        this.p1 = p1;
        this.p2 = p2;

        this.lambda = new Vector(0, 0);
        this.avgVelocity = new Vector(0, 0);

        this.parent = p;
        RectangleParticle.prototype.constructor.call(this, 0, 0, 0, 0, 0, false);
        this._rectScale = rectScale;
        this._rectHeight = rectHeight;
        this.scaleToLength = scaleToLength;

        this._fixedEndLimit = 0;
        this.rca = new Vector();
        this.rcb = new Vector();


    };

    JPE.extend(SpringConstraintParticle, RectangleParticle, {

        setRectScale: function(s) {
            this._rectScale = s;
        },


        /**
         * @private
         */
        getRectScale: function() {
            return this._rectScale;
        },


        setRectHeight: function(r) {
            this._rectHeight = r;
        },


        /**
         * @private
         */
        getRectHeight: function() {
            return this._rectHeight;
        },


        /**
         * For cases when the SpringConstraint is both collidable and only one of the
         * two end particles are fixed, this value will dispose of collisions near the
         * fixed particle, to correct for situations where the collision could never be
         * resolved.
         */
        setFixedEndLimit: function(f) {
            this._fixedEndLimit = f;
        },


        /**
         * @private
         */
        getFixedEndLimit: function() {
            return this._fixedEndLimit;
        },


        /**
         * returns the average mass of the two connected particles
         */
        getMass: function() {
            return (this.p1.getMass() + this.p2.getMass()) / 2;
        },


        /**
         * returns the average elasticity of the two connected particles
         */
        getElasticity: function() {
            return (this.p1.getElasticity() + this.p2.getElasticity()) / 2;
        },


        /**
         * returns the average friction of the two connected particles
         */
        getFriction: function() {
            return (this.p1.getFriction() + this.p2.getFriction()) / 2;
        },


        /**
         * returns the average velocity of the two connected particles
         */
        getVelocity: function() {
            var p1v = this.p1.getVelocity();
            var p2v = this.p2.getVelocity();

            this.avgVelocity.setTo(((p1v.x + p2v.x) / 2), ((p1v.y + p2v.y) / 2));
            return this.avgVelocity;
        },

        /**
         * @private
         * returns the average inverse mass.
         */
        getInvMass: function() {
            if (this.p1.getFixed() && this.p2.getFixed()) return 0;
            return 1 / ((this.p1.getMass() + this.p2.getMass()) / 2);
        },


        /**
         * called only on collision
         */
        updatePosition: function() {

            var c = this.parent.getCenter();
            this.curr.setTo(c.x, c.y);

            this.setWidth((this.scaleToLength) ? this.parent.getCurrLength() * this._rectScale : this.parent.getRestLength() * this._rectScale);
            this.setHeight(this.getRectHeight());
            this.setRadian(this.parent.getRadian());

        },


        resolveCollision: function(mtd, vel, n, d, o, p) {

            var t = this.getContactPointParam(p);
            var c1 = (1 - t);
            var c2 = t;
            var p1 = this.p1;
            var p2 = this.p2;
            var fixedEndLimit = this.getFixedEndLimit();
            var lambda = this.lambda;

            // if one is fixed then move the other particle the entire way out of collision.
            // also, dispose of collisions at the sides of the scp. The higher the fixedEndLimit
            // value, the more of the scp not be effected by collision. 
            if (p1.getFixed()) {
                if (c2 <= fixedEndLimit) return;
                lambda.setTo(mtd.x / c2, mtd.y / c2);
                p2.curr.plusEquals(lambda);
                p2.setVelocity(vel);

            } else if (p2.getFixed()) {
                if (c1 <= fixedEndLimit) return;
                lambda.setTo(mtd.x / c1, mtd.y / c1);
                p1.curr.plusEquals(lambda);
                p1.setVelocity(vel);

                // else both non fixed - move proportionally out of collision
            } else {
                var denom = (c1 * c1 + c2 * c2);
                if (denom == 0) return;
                lambda.setTo(mtd.x / denom, mtd.y / denom);

                p1.curr.plusEquals(lambda.mult(c1));
                p2.curr.plusEquals(lambda.mult(c2));

                // if collision is in the middle of SCP set the velocity of both end particles
                if (t == 0.5) {
                    p1.setVelocity(vel);
                    p2.setVelocity(vel);

                    // otherwise change the velocity of the particle closest to contact
                } else {
                    var corrParticle = (t < 0.5) ? p1 : p2;
                    corrParticle.setVelocity(vel);
                }
            }
        },


        /**
         * given point c, returns a parameterized location on this SCP. Note
         * this is just treating the SCP as if it were a line segment (ab).
         */
        closestParamPoint: function(c) {
            var ab = this.p2.curr.minus(this.p1.curr);
            var t = (ab.dot(c.minus(this.p1.curr))) / (ab.dot(ab));
            return MathUtil.clamp(t, 0, 1);
        },


        /**
         * returns a contact location on this SCP expressed as a parametric value in [0,1]
         */
        getContactPointParam: function(p) {

            var t;

            if (p instanceof CircleParticle) {
                t = this.closestParamPoint(p.curr);
            } else if (p instanceof RectangleParticle) {

                // go through the sides of the colliding rectangle as line segments
                var shortestIndex;
                var paramList = new Array(4);
                var shortestDistance = Number.POSITIVE_INFINITY;

                for (var i = 0; i < 4; i++) {
                    this.setCorners(p, i);

                    // check for closest points on SCP to side of rectangle
                    var d = this.closestPtSegmentSegment();
                    if (d < shortestDistance) {
                        shortestDistance = d;
                        shortestIndex = i;
                        paramList[i] = s;
                    }
                }
                t = paramList[shortestIndex];
            }
            return t;
        },


        /**
         * 
         */
        setCorners: function(r, i) {

            var rx = r.curr.x;
            var ry = r.curr.y;

            var axes = r.getAxes();
            var extents = r.getExtents();

            var ae0_x = axes[0].x * extents[0];
            var ae0_y = axes[0].y * extents[0];
            var ae1_x = axes[1].x * extents[1];
            var ae1_y = axes[1].y * extents[1];

            var emx = ae0_x - ae1_x;
            var emy = ae0_y - ae1_y;
            var epx = ae0_x + ae1_x;
            var epy = ae0_y + ae1_y;

            var rca = this.rca;
            var rcb = this.rcb;

            if (i == 0) {
                // 0 and 1
                rca.x = rx - epx;
                rca.y = ry - epy;
                rcb.x = rx + emx;
                rcb.y = ry + emy;

            } else if (i == 1) {
                // 1 and 2
                rca.x = rx + emx;
                rca.y = ry + emy;
                rcb.x = rx + epx;
                rcb.y = ry + epy;

            } else if (i == 2) {
                // 2 and 3
                rca.x = rx + epx;
                rca.y = ry + epy;
                rcb.x = rx - emx;
                rcb.y = ry - emy;

            } else if (i == 3) {
                // 3 and 0
                rca.x = rx - emx;
                rca.y = ry - emy;
                rcb.x = rx - epx;
                rcb.y = ry - epy;
            }
        },


        /**
         * pp1-pq1 will be the SCP line segment on which we need parameterized s. 
         */
        closestPtSegmentSegment: function() {

            var pp1 = this.p1.curr,
                pq1 = this.p2.curr,
                pp2 = this.rca,
                pq2 = this.rcb,

                d1 = pq1.minus(pp1),
                d2 = pq2.minus(pp2),
                r = pp1.minus(pp2),

                t,
                a = d1.dot(d1),
                e = d2.dot(d2),
                f = d2.dot(r),

                c = d1.dot(r),
                b = d1.dot(d2),
                denom = a * e - b * b;

            if (denom != 0.0) {
                s = MathUtil.clamp((b * f - c * e) / denom, 0, 1);
            } else {
                s = 0.5 // give the midpoint for parallel lines
            }
            t = (b * s + f) / e;

            if (t < 0) {
                t = 0;
                s = MathUtil.clamp(-c / a, 0, 1);
            } else if (t > 0) {
                t = 1;
                s = MathUtil.clamp((b - c) / a, 0, 1);
            }

            var c1 = pp1.plus(d1.mult(s));
            var c2 = pp2.plus(d2.mult(t));
            var c1mc2 = c1.minus(c2);
            return c1mc2.dot(c1mc2);
        }

    });

    module.exports = SpringConstraintParticle;
});
define("JPE/Vector", function(require, exports, module) {

    var JPE = require("JPE/JPE");

    var Vector = function(px, py) {
        this.x = px || 0;
        this.y = py || 0;
    };

    JPE.mix(Vector.prototype, {

        setTo: function(px, py) {
            this.x = px || 0;
            this.y = py || 0;
        },
        copy: function(v) {
            this.x = v.x;
            this.y = v.y;
        },
        dot: function(v) {
            return this.x * v.x + this.y * v.y;
        },
        cross: function(v) {
            return this.x * v.y - this.y * v.x;
        },
        plus: function(v) {
            return new Vector(this.x + v.x, this.y + v.y);
        },
        plusEquals: function(v) {
            this.x += v.x;
            this.y += v.y;
            return this;
        },
        minus: function(v) {
            return new Vector(this.x - v.x, this.y - v.y);
        },
        minusEquals: function(v) {
            this.x -= v.x;
            this.y -= v.y;
            return this;
        },
        mult: function(s) {
            return new Vector(this.x * s, this.y * s);
        },
        multEquals: function(s) {
            this.x *= s;
            this.y *= s;
            return this;
        },
        times: function(v) {
            return new Vector(this.x * v.x, this.y * v.y);
        },
        divEquals: function(s) {
            if (s == 0) {
                s = 0.0001;
            }
            this.x /= s;
            this.y /= s;
            return this;
        },
        magnitude: function() {
            return Math.sqrt(this.x * this.x + this.y * this.y);
        },
        distance: function(v) {
            var delta = this.minus(v);
            return delta.magnitude();
        },
        normalize: function() {
            var m = this.magnitude();
            if (m == 0) {
                m = 0.0001;
            }
            return this.mult(1 / m);
        },
        normalizeEquals: function() {
            var m = this.magnitude();
            if (m == 0) {
                m = 0.0001;
            }
            return this.multEquals(1 / m);
        },
        toString: function() {
            return Math.floor(this.x * 100) / 100 + " : " + Math.floor(this.y * 100) / 100;
        }
    });

    module.exports = Vector;
});
define("JPE/VectorForce", function(require, exports, module) {

    var JPE = require("JPE/JPE");
    var IForce = require("JPE/IForce");
    var Vector = require("JPE/Vector");

    var VectorForce = function(useMass, vx, vy) {
        this.fvx = vx;
        this.fvy = vy;
        this.scaleMass = useMass;
        this.value = new Vector(vx, vy);
    };

    JPE.extend(VectorForce, IForce, {
        setVx: function(x) {
            this.fvx = x;
            this.value.x = x;
        },
        setVy: function(y) {
            this.fvy = y;
            this.value.y = y;
        },
        setUseMass: function(b) {
            this.scaleMass = b;
        },
        getValue: function(invMass) {
            if (this.scaleMass) {
                this.value.setTo(this.fvx * invMass, this.fvy * invMass);
            }
            return this.value;
        }
    });

    module.exports = VectorForce;
});
define("JPE/WheelParticle", function(require, exports, module) {

    var JPE = require("JPE/JPE");
    var RimParticle = require("JPE/RimParticle");
    var CircleParticle = require("JPE/CircleParticle");
    var MathUtil = require("JPE/MathUtil");
    var Vector = require("JPE/Vector");

    /**
     * @param x The initial x position of this particle.
     * @param y The initial y position of this particle.
     * @param radius The radius of this particle.
     * @param fixed Determines if the particle is fixed or not. Fixed particles
     * are not affected by forces or collisions and are good to use as surfaces.
     * Non-fixed particles move freely in response to collision and forces.
     * @param mass The mass of the particle.
     * @param elasticity The elasticity of the particle. Higher values mean more elasticity or 'bounciness'.
     * @param friction The surface friction of the particle.
     */
    var WheelParticle = function(x, y, radius, fixed, mass, elasticity, friction, traction) {
        traction = traction || 1;
        mass = mass || 1;
        elasticity = elasticity || 0.3;
        friction = friction || 0;
        this.lineThickness = 1;
        CircleParticle.prototype.constructor.apply(this, arguments);
        this.tan = new Vector(0, 0);
        this.normSlip = new Vector(0, 0);
        this.rp = new RimParticle(radius, 2);
        this.orientation = new Vector();
        this.setTraction(traction);
    };

    JPE.extend(WheelParticle, CircleParticle, {

        getSpeed: function() {
            return this.rp.getSpeed();
        },


        setSpeed: function(t) {
            this.rp.setSpeed(t);
        },

        getAngularVelocity: function() {
            return this.rp.getAngularVelocity();
        },


        setAngularVelocity: function(t) {
            this.rp.setAngularVelocity(t);
        },

        getTraction: function() {
            return 1 - this._traction;
        },

        setTraction: function(t) {
            this._traction = 1 - t;
        },

        update: function(dt) {
            CircleParticle.prototype.update.call(this, dt);
            this.rp.update(dt);
        },

        /**
         * The rotation of the wheel in radians.
         */
        getRadian: function() {
            this.orientation.setTo(this.rp.curr.x, this.rp.curr.y);
            return Math.atan2(this.orientation.y, this.orientation.x) + Math.PI;
        },


        /**
         * The rotation of the wheel in degrees.
         */
        getAngle: function() {
            return this.getRadian() * MathUtil.ONE_EIGHTY_OVER_PI;
        },


        /**
         * @private
         */
        resolveCollision: function(mtd, vel, n, d, o, p) {
            CircleParticle.prototype.resolveCollision.apply(this, arguments);
            // review the o (order) need here - its a hack fix
            this.resolve(n.mult(MathUtil.sign(d * o)));
        },


        /**
         * simulates torque/wheel-ground interaction - n is the surface normal
         * Origins of this code thanks to Raigan Burns, Metanet software
         */
        resolve: function(n) {

            // this is the tangent vector at the rim particle
            var rp = this.rp,
                tan = this.tan;

            tan.setTo(-rp.curr.y, rp.curr.x);
            // normalize so we can scale by the rotational speed
            tan = tan.normalize();

            // velocity of the wheel's surface 
            var wheelSurfaceVelocity = tan.mult(rp.getSpeed());

            // the velocity of the wheel's surface relative to the ground
            var combinedVelocity = this.getVelocity().plusEquals(wheelSurfaceVelocity);

            // the wheel's comb velocity projected onto the contact normal
            var cp = combinedVelocity.cross(n);

            // set the wheel's spinspeed to track the ground
            tan.multEquals(cp);
            rp.prev.copy(rp.curr.minus(tan));

            // some of the wheel's torque is removed and converted into linear displacement
            var slipSpeed = (1 - this._traction) * rp.getSpeed();
            this.normSlip.setTo(slipSpeed * n.y, slipSpeed * n.x);
            this.curr.plusEquals(this.normSlip);
            rp.setSpeed(rp.getSpeed() * this._traction);
        }

    });

    module.exports = WheelParticle;
});
