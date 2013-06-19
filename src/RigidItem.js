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