import Vector from './Vector'
import MathUtil from './MathUtil'
import AbstractCollection from './AbstractCollection'

export default class Composite extends AbstractCollection{
    constructor() {
        super()
        this.delta = new Vector()
    }
    rotateByRadian(angleRadians, center) {
        for (let i = 0; i < this.particles.length; i++) {
            let p = this.particles[i];
            const radius = p.center.distance(center)
            const angle = this.getRelativeAngle(center, p.center) + angleRadians
            p.px = Math.cos(angle) * radius + center.x
            p.py = Math.sin(angle) * radius + center.y
        }
    }
    rotateByAngle(angleDegrees, center) {
        const angleRadians = angleDegrees * MathUtil.PI_OVER_ONE_EIGHTY;
        this.rotateByRadian(angleRadians, center);
    }
    get fixed() {
        for (let i = 0, l = this.particles.length; i < l; i++) {
            if (!particles[i].fixed) return false;
        }
        return true;
    }
    set fixed(b) {
        for (let i = 0, l = this.particles.length; i < l; i++) {
            this.particles[i].fixed = b;
        }
    }
    getRelativeAngle(center, p) {
        this.delta.setTo(p.x - center.x, p.y - center.y);
        return Math.atan2(this.delta.y, this.delta.x);
    }
}