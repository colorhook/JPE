import AbstractParticle from './AbstractParticle'
import MathUtil from './MathUtil'
import Vector from './Vector'
import Engine from './Engine'

export default class RigidItem extends AbstractParticle {
    constructor(x, y, range, isFixed, mass, mi, elasticity, friction, radian, angularVelocity) {
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
        super(x, y, isFixed, mass, elasticity, 0)
    }
    getRadian() {
        return this._radian;
    }
    setRadian(n) {
        this._radian = n;
        this.setAxes(n);
    }
    getAngle() {
        return this.getRadian() * MathUtil.ONE_EIGHTY_OVER_PI;
    }
    setAngle(a) {
        this.setRadian(a * MathUtil.PI_OVER_ONE_EIGHTY);
    }
    setAxes() {}
    update(dt2) {
        var r = this._radian + this.angularVelocity * Engine.damping;
        this.setRadian(r);
        AbstractParticle.prototype.update.call(this, dt2);
        this.torque = 0;
    }
    addTorque(aa) {
        //console.log("addTorque:" + aa);
        this.angularVelocity += aa;
    }
    resolveRigidCollision(aa, p) {
        if (this.getFixed() || !this.solid || !p.solid) {
            return;
        }
        this.addTorque(aa);
    }
    captures(vertex) {
        var d = vertex.distance(this.samp) - this.range;
        return d <= 0;
    }
    getVelocityOn(vertex) {
        var arm = vertex.minus(this.samp);
        var v = arm.normalize();
        var r = this.angularVelocity * arm.magnitude();
        var d = new Vector(-v.y, v.x).multEquals(r);
        return d.plusEquals(this.getVelocity());
    }
}