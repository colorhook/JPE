import Vector from './Vector'
import MathUtil from './MathUtil'
import AbstractCollection from './AbstractCollection'

export default class Composite extends AbstractCollection{
    constructor() {
        super()
        this.delta = new Vector()
    }
    rotateByRadian(angleRadians, center) {
        let p
        const pa = this.particles
        const len = pa.length

        for (let i = 0; i < len; i++) {
            p = pa[i];
            const radius = p.getCenter().distance(center);
            const angle = this.getRelativeAngle(center, p.getCenter()) + angleRadians;
            p.setPx(Math.cos(angle) * radius + center.x);
            p.setPy(Math.sin(angle) * radius + center.y);
        }
    }
    rotateByAngle(angleDegrees, center) {
        const angleRadians = angleDegrees * MathUtil.PI_OVER_ONE_EIGHTY;
        this.rotateByRadian(angleRadians, center);
    }
    getFixed() {
        for (var i = 0, l = this.particles.length; i < l; i++) {
            if (!particles[i].getFixed()) return false;
        }
        return true;
    }
    setFixed(b) {
        for (var i = 0, l = this.particles.length; i < l; i++) {
            this.particles[i].setFixed(b);
        }
    }
    getRelativeAngle(center, p) {
        this.delta.setTo(p.x - center.x, p.y - center.y);
        return Math.atan2(this.delta.y, this.delta.x);
    }
}