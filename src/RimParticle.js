import Vector from './Vector'
import Engine from './Engine'

export default class RimParticle {
    constructor(r, mt) {
        this.sp = 0;
        this.av = 0;
        this.wr = r;
        this.maxTorque = mt;
        this.curr = new Vector(r, 0);
        this.prev = new Vector(0, 0);
    }
    getSpeed() {
        return this.sp;
    }

    setSpeed(s) {
        this.sp = s;
    }

    getAngularVelocity() {
        return this.av;
    }

    setAngularVelocity(s) {
        this.av = s;
    }
    update(dt) {
        
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
}