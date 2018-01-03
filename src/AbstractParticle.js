import Signal from './Signal'
import Vector from './Vector'
import Interval from './Interval'
import AbstractItem from './AbstractItem'
import Collision from './Collision'

export default class AbstractParticle extends AbstractItem {
    constructor(x, y, isFixed, mass, elasticity, friction) {
        super()
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

    getElasticity() {
        return this._elasticity;
    }
    setElasticity(value) {
        this._elasticity = value;
    }
    getMultisample() {
        return this._multisample;
    }
    setMultisample(value) {
        return this._multisample = value;
    }
    getCollidable() {
        return this._collidable;
    }
    setCollidable(collidable) {
        this._collidable = collidable;
    }
    getFixed() {
        return this._fixed;
    }
    setFixed(fixed) {
        this._fixed = fixed;
    }
    getMass() {
        return this._mass;
    }
    setMass(m) {
        if (m <= 0) throw new Error("mass may not be set <= 0");
        this._mass = m;
        this._invMass = 1 / this._mass;
    }
    getCenter() {
        this._center.setTo(this.getPx(), this.getPy())
        return this._center;
    }
    getFriction() {
        return this._friction;
    }
    setFriction(f) {
        if (f < 0 || f > 1) throw new Error("Legal friction must be >= 0 and <=1");
        this._friction = f;
    }

    getPosition() {
        return new Vector(this.curr.x, this.curr.y);
    }


    setPosition(p) {
        this.curr.copy(p);
        this.prev.copy(p);
    }
    getPx() {
        return this.curr.x;
    }

    setPx(x) {
        this.curr.x = x;
        this.prev.x = x;
    }


    getPy() {
        return this.curr.y;
    }
    setPy(y) {
        this.curr.y = y;
        this.prev.y = y;
    }
    getVelocity() {
        return this.curr.minus(this.prev);
    }

    setVelocity(v) {
        this.prev = this.curr.minus(v);
    }

    addForce(f) {
        this.forceList.push(f);
    }


    accumulateForces() {
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
    }

    clearForces() {
        this.forceList.length = 0;
        this.forces.setTo(0, 0);
    }


    update(dt2) {

        if (this.getFixed()) return;

        this.accumulateForces();

        // integrate
        this.temp.copy(this.curr);

        var nv = this.getVelocity().plus(this.forces.multEquals(dt2));

        this.curr.plusEquals(nv.multEquals(Engine.damping));
        this.prev.copy(this.temp);

        // clear the forces
        this.clearForces();
    }

    resetFirstCollision() {
        this.firstCollision = false;
    }

    getComponents(collisionNormal) {
        var vel = this.getVelocity();
        var vdotn = collisionNormal.dot(vel);
        this.collision.vn = collisionNormal.mult(vdotn);
        this.collision.vt = vel.minus(this.collision.vn);
        return this.collision;
    }


    resolveCollision(mtd, vel, n, d, o, p) {
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
    }

    getInvMass() {
        return (this.getFixed()) ? 0 : this._invMass;
    }
}