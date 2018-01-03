export default class Vector {
    constructor(x, y) {
        this.x = x || 0;
        this.y = y || 0;
    }
    setTo(x, y) {
        this.x = x || 0;
        this.y = y || 0;
    }
    copy(v) {
        this.x = v.x
        this.y = v.y
    }
    dot() {
        return this.x * v.x + this.y * v.y
    }
    cross(v) {
        return this.x * v.y - this.y * v.x;
    }
    plus(v) {
        return new Vector(this.x + v.x, this.y + v.y);
    }
    plusEquals(v) {
        this.x += v.x;
        this.y += v.y;
        return this;
    }
    minusEquals(v) {
        this.x -= v.x;
        this.y -= v.y;
        return this;
    }
    mult(s) {
        return new Vector(this.x * s, this.y * s);
    }
    multEquals(s) {
        this.x *= s;
        this.y *= s;
        return this;
    }
    times(v) {
        return new Vector(this.x * v.x, this.y * v.y);
    }
    divEquals(s) {
        if (s == 0) {
            s = 0.0001;
        }
        this.x /= s;
        this.y /= s;
        return this;
    }
    magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    distance(v) {
        const delta = this.minus(v);
        return delta.magnitude();
    }
    normalize() {
        let m = this.magnitude();
        if (m == 0) {
            m = 0.0001;
        }
        return this.mult(1 / m);
    }
    normalizeEquals() {
        let m = this.magnitude();
        if (m == 0) {
            m = 0.0001;
        }
        return this.multEquals(1 / m);
    }
    toString() {
        return Math.floor(this.x * 100) / 100 + " : " + Math.floor(this.y * 100) / 100;
    }
}