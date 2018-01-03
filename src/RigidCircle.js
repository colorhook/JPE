import RigidItem from './RigidItem'

export default class RigidCircle extends RigidItem {
    constructor(x, y, radius, isFixed, mass, elasticity, friction, radian, angularVelocity) {
        if (mass == null) {
            mass = -1;
        }
        if (mass == -1) {
            mass = Math.PI * radius * radius;
        }
        if(elasticity == null){
            elasticity = 0.3;
        }
        if(friction == null){
            friction = 0.2;
        }
        if(radian == null){
            radian = 0;
        }
        if(angularVelocity == null){
            angularVelocity = 0;
        }
        this._radius = radius;
        super(x, y, radius,
        isFixed, mass, mass * radius * radius / 2, elasticity, friction, radian, angularVelocity);
    }
    getRadius() {
        return this._radius;
    }
    getVertices(axis) {
        var vertices = [];
        for (var i = 0; i < axis.length; i++) {
            vertices.push(axis[i].mult(this._radius).plusEquals(this.samp));
        }
        return vertices;
    }
    getProjection(axis) {
        var c = this.samp.dot(axis);
        this.interval.min = c - this._radius;
        this.interval.max = c + this._radius;

        return this.interval;
    }
    getIntervalX() {
        this.interval.min = this.samp.x - this._radius;
        this.interval.max = this.samp.x + this._radius;
        return this.interval;
    }
    getIntervalY() {
        this.interval.min = this.samp.y - this._radius;
        this.interval.max = this.samp.y + this._radius;
        return this.interval;
    }
}