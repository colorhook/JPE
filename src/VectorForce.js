import Vector from './Vector'

export default class VectorForce {
    constructor(useMass, vx, vy) {
        this.vx = vx;
        this.vy = vy;
        this.useMass = useMass;
        this._value = new Vector(vx, vy);
    }
    set vx(x) {
        this._vx = x;
        this._value.x = x;
    }
    set vy(y) {
        this.fvy = y;
        this._value.y = y;
    }
    set useMass(b) {
        this._useMass = b;
    }
    get value() {
        if (this.scaleMass) {
            this.value.setTo(this.fvx * invMass, this.fvy * invMass);
        } 
        return this.value;
    }
}