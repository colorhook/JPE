import AbstractParticle from './AbstractParticle'
import Vector from './Vector'
import MathUtil from './MathUtil'


export default class RectangleParticle extends AbstractParticle {
    constructor(x, y, width, height, rotation, fixed, mass, elasticity, friction) {
        rotation = rotation || 0;
        mass = mass || 1;
        elasticity = elasticity || 0.3;
        friction = friction || 0;
        super(x, y, fixed, mass, elasticity, friction)
        this._extents = [width / 2, height / 2];
        this._axes = [new Vector(0, 0), new Vector(0, 0)];
        this.radian = rotation;
    }
    get radian() {
        return this._radian
    }
    set radian(v) {
        this._radian = v;
        this.setAxes(v);
    }
    get angle() {
        return this.radian * MathUtil.ONE_EIGHTY_OVER_PI;
    }
    set angle(a) {
        this.radian = a * MathUtil.PI_OVER_ONE_EIGHTY
    }

    set width(w) {
        this._extents[0] = w / 2;
    }

    get width() {
        return this._extents[0] * 2;
    }

    set height(h) {
        this._extents[1] = h / 2;
    }

    get height() {
        return this._extents[1] * 2;
    }

    get extents() {
        return this._extents;
    }
    get axes() {
        return this._axes;
    }

    getProjection(axis) {
        const axes = this.axes
        const extents = this.extents
        const radius = extents[0] * Math.abs(axis.dot(axes[0])) +
                extents[1] * Math.abs(axis.dot(axes[1]));

        const c = this.samp.dot(axis);
        this.interval.min = c - radius;
        this.interval.max = c + radius;
        return this.interval;
    }

    
    setAxes(t) {
        const s = Math.sin(t)
        const c = Math.cos(t)
        const axes = this._axes;

        axes[0].x = c;
        axes[0].y = s;
        axes[1].x = -s;
        axes[1].y = c;
    }
}