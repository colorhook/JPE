import Vector from './Vector'

export default class VectorForce {
    constructor(useMass, vx, vy) {
        this._useMass = useMass;
        this._vx = vx;
        this._vy = vy;
        this._value = new Vector(vx, vy);
    }
    set vx(x) {
        this._vx = x;
        this._value.x = x;
    }
    set vy(y) {
        this._vy = y;
        this._value.y = y;
    }
    set useMass(b) {
        this._useMass = b;
    }
    getValue(invMass) {
        if (this._useMass) {
            this._value.setTo(this._vx * invMass, this._vy * invMass);
        } 
        return this._value;
    }
}