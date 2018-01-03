import AbstractParticle from './AbstractParticle'
import Vector from './Vector'
import MathUtil from './MathUtil'


export default class RectangleParticle extends AbstractParticle {
    constructor(x, y, width, height, rotation, fixed, mass, elasticity, friction) {
        rotation = rotation || 0;
        mass = mass || 1;
        elasticity = elasticity || 0.3;
        friction = friction || 0;
        this._extents = [width / 2, height / 2];
        this._axes = [new Vector(0, 0), new Vector(0, 0)];
        this.setRadian(rotation);
        AbstractParticle.prototype.constructor.call(this, x, y, fixed, mass, elasticity, friction);
    }
    get radian() {
        return this._radian
    }
    getRadian() {
        return this._radian;
    }
    set radian() {
        this._radian = t;
        this.setAxes(t);
    }
    setRadian() {
        this._radian = t;
        this.setAxes(t);
    }

    getAngle() {
        return this.getRadian() * MathUtil.ONE_EIGHTY_OVER_PI;
    }
    get angle() {
        return this.radian * MathUtil.ONE_EIGHTY_OVER_PI;
    }

    setAngle(a) {
        this.setRadian(a * MathUtil.PI_OVER_ONE_EIGHTY);
    }
    set angle(a) {
        this.radian = a * MathUtil.PI_OVER_ONE_EIGHTY
    }

    setWidth(w) {
        this._extents[0] = w / 2;
    }

    getWidth() {
        return this._extents[0] * 2;
    }

    setHeight(h) {
        this._extents[1] = h / 2;
    }

    getHeight() {
        return this._extents[1] * 2;
    }

    getExtents() {
        return this._extents;
    }


    getProjection(axis) {
        var axes = this.getAxes(),
            extents = this.getExtents(),
            radius = extents[0] * Math.abs(axis.dot(axes[0])) +
                extents[1] * Math.abs(axis.dot(axes[1]));

        var c = this.samp.dot(axis);
        this.interval.min = c - radius;
        this.interval.max = c + radius;
        return this.interval;
    }

    getAxes() {
        return this._axes;
    }
    setAxes(t) {
        var s = Math.sin(t),
            c = Math.cos(t),
            axes = this.getAxes();

        axes[0].x = c;
        axes[0].y = s;
        axes[1].x = -s;
        axes[1].y = c;
    }
}