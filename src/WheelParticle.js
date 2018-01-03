import RimParticle from './RimParticle'
import CircleParticle from './CircleParticle'
import MathUtil from './MathUtil'
import Vector from './Vector'

class WheelParticle extends CircleParticle {
    constructor(x, y, radius, fixed, mass, elasticity, friction, traction) {
        traction = traction || 1;
        mass = mass || 1;
        elasticity = elasticity || 0.3;
        friction = friction || 0;
        super(x, y, radius, fixed, mass, elasticity, friction, traction)
        this.lineThickness = 1;
        this.tan = new Vector(0, 0);
        this.normSlip = new Vector(0, 0);
        this.rp = new RimParticle(radius, 2);
        this.orientation = new Vector();
        this.setTraction(traction);
    }
    getSpeed() {
        return this.rp.getSpeed();
    }
    setSpeed(t) {
        this.rp.setSpeed(t);
    }
    getAngularVelocity() {
        return this.rp.getAngularVelocity();
    }
    setAngularVelocity(t) {
        this.rp.setAngularVelocity(t);
    }
    getTraction() {
        return 1 - this._traction;
    }
    setTraction(t) {
        this._traction = 1 - t;
    }
    update(dt) {
        CircleParticle.prototype.update.call(this, dt);
        this.rp.update(dt);
    }
    getRadian() {
        this.orientation.setTo(this.rp.curr.x, this.rp.curr.y);
        return Math.atan2(this.orientation.y, this.orientation.x) + Math.PI;
    }
    getAngle() {
        return this.getRadian() * MathUtil.ONE_EIGHTY_OVER_PI;
    }
    resolveCollision(mtd, vel, n, d, o, p) {
        super.resolveCollision(mtd, vel, n, d, o, p)
        // review the o (order) need here - its a hack fix
        this.resolve(n.mult(MathUtil.sign(d * o)));
    }
    resolve(n) {

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
}