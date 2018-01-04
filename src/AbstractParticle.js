import Vector from './Vector'
import Interval from './Interval'
import AbstractItem from './AbstractItem'
import Collision from './Collision'
import Engine from './Engine'

export default class AbstractParticle extends AbstractItem {
    constructor(x, y, isFixed, mass, elasticity, friction) {
        super()
        this.interval = new Interval(0, 0);
        this.curr = new Vector(x, y);
        this.prev = new Vector(x, y);
        this.samp = new Vector();
        this.temp = new Vector();
        this.fixed = isFixed;

        this.forces = new Vector();
        this.forceList = [];

        this.collision = new Collision(new Vector(), new Vector());
        this.collidable = true;
        this.firstCollision = false;

        this.mass = mass;
        this.elasticity = elasticity;
        this.friction = friction;
        this._center = new Vector();
        this._multisample = 0;
        this.setStyle();
    }

    get elasticity() {
        return this._elasticity;
    }
    set elasticity(value) {
        this._elasticity = value;
    }
    get multisample() {
        return this._multisample;
    }
    set multisample(value) {
        this._multisample = value;
    }
    get collidable() {
        return this._collidable;
    }
    set collidable(collidable) {
        this._collidable = collidable;
    }
    get fixed() {
        return this._fixed;
    }
    set fixed(fixed) {
        this._fixed = fixed;
    }
    get mass() {
        return this._mass;
    }
    set mass(m) {
        if (m <= 0) throw new Error("mass may not be set <= 0");
        this._mass = m;
        this._invMass = 1 / this._mass;
    }
    get center() {
        this._center.setTo(this.px, this.py)
        return this._center;
    }
    get friction() {
        return this._friction;
    }
    set friction(f) {
        if (f < 0 || f > 1) throw new Error("Legal friction must be >= 0 and <=1");
        this._friction = f;
    }

    get position() {
        return new Vector(this.curr.x, this.curr.y);
    }

    set position(p) {
        this.curr.copy(p);
        this.prev.copy(p);
    }
    get px() {
        return this.curr.x;
    }

    set px(x) {
        this.curr.x = x;
        this.prev.x = x;
    }

    get py() {
        return this.curr.y;
    }
    set py(y) {
        this.curr.y = y;
        this.prev.y = y;
    }
    get velocity() {
        return this.curr.minus(this.prev);
    }

    set velocity(v) {
        this.prev = this.curr.minus(v);
    }

    addForce(f) {
        this.forceList.push(f);
    }

    accumulateForces() {
        for (let i = 0; i < this.forceList.length; i++) {
            let f = this.forceList[i];
            this.forces.plusEquals(f.getValue(this._invMass));
        }

        const globalForces = Engine.forces;
        for (let i = 0; i < globalForces.length; i++) {
            let f = globalForces[i];
            this.forces.plusEquals(f.getValue(this._invMass));
        }
    }

    clearForces() {
        this.forceList.length = 0;
        this.forces.setTo(0, 0);
    }

    update(dt2) {
        if (this.fixed) return;
        this.accumulateForces();
        // integrate
        this.temp.copy(this.curr);
        const nv = this.velocity.plus(this.forces.multEquals(dt2));
        this.curr.plusEquals(nv.multEquals(Engine.damping));
        this.prev.copy(this.temp);
        // clear the forces
        this.clearForces();
    }

    resetFirstCollision() {
        this.firstCollision = false;
    }

    getComponents(collisionNormal) {
        const vdotn = collisionNormal.dot(this.velocity);
        this.collision.vn = collisionNormal.mult(vdotn);
        this.collision.vt = this.velocity.minus(this.collision.vn);
        return this.collision;
    }

    resolveCollision(mtd, vel, n, d, o, p) {
        if (this.fixed || !this.solid || !p.solid) {
            return;
        }
        this.curr.copy(this.samp);
        this.curr.plusEquals(mtd);
        this.velocity = vel;
    }

    get invMass() {
        return this.fixed ? 0 : this._invMass;
    }
}