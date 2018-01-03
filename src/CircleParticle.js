import AbstractParticle from './AbstractParticle'

export default class CircleParticle extends AbstractParticle {
    constructor(x, y, radius, fixed, mass, elasticity, friction) {
        mass = mass || 1;
        elasticity = elasticity || 0.3;
        friction = friction || 0;
        super(x, y, fixed, mass, elasticity, friction)
        this._radius = radius;
    }
    get radius() {
        return this._radius
    }
    getRadius() {
        return this.radius
    }
    getProjection() {
        const c = this.samp.dot(axis); 
        this.interval.min = c - this._radius;
        this.interval.max = c + this._radius;
        return this.interval;
    }
    getIntervalX() {
        this.interval.min = this.curr.x - this._radius;
        this.interval.max = this.curr.x + this._radius;
        return this.interval;
    }

    getIntervalY() {
        this.interval.min = this.curr.y - this._radius;
        this.interval.max = this.curr.y + this._radius;
        return this.interval;
    }
}