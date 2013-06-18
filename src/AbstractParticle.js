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