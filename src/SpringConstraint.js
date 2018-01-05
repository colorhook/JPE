import AbstractConstraint from './AbstractConstraint'
import MathUtil from './MathUtil'
import SpringConstraintParticle from './SpringConstraintParticle'

export default class SpringConstraint extends AbstractConstraint {
    constructor(p1, p2, stiffness, collidable, rectHeight, rectScale, scaleToLength) {
        stiffness = stiffness || 0.5;
        rectHeight = rectHeight || 1;
        rectScale = rectScale || 1;
        super(stiffness)
        this.p1 = p1;
        this.p2 = p2;
        this.checkParticlesLocation();
        this._restLength = this.currLength;
        this.inited = false;
        this.setCollidable(collidable, rectHeight, rectScale, scaleToLength);
    }

    get radian() {
        var d = this.delta;
        return Math.atan2(d.y, d.x);
    }

    get angle() {
        return this.radian * MathUtil.ONE_EIGHTY_OVER_PI;
    }

    get center() {
        return (this.p1.curr.plus(this.p2.curr)).divEquals(2);
    }

    set rectScale(s) {
        if (this.scp == null) return;
        this.scp.rectScale = s;
    }

    get rectScale() {
        return this.scp.rectScale;
    }


    get currLength() {
        return this.p1.curr.distance(this.p2.curr);
    }

    get rectHeight() {
        return this.scp.rectHeight;
    }

    set rectHeight(h) {
        if (this.scp == null) return;
        this.scp.rectHeight = h;
    }

    get restLength() {
        return this._restLength;
    }

    set restLength(r) {
        if (r <= 0) throw new Error("restLength must be greater than 0");
        this._restLength = r;
    }

    get fixedEndLimit() {
        return this.scp.fixedEndLimit;
    }

    set fixedEndLimit(f) {
        if (this.scp == null) return;
        this.scp.fixedEndLimit = f;
    }

    get collidable() {
        return this._collidable;
    }

    setCollidable(b, rectHeight, rectScale, scaleToLength) {
        this._collidable = b;
        // this.scp = null;

        if (this._collidable) {
            if (this.scp) {
                this.scp.cleanup();
            }
            this.scp = new SpringConstraintParticle(this.p1, this.p2, this, rectHeight, rectScale, scaleToLength);
            if (this.inited) {
                this.scp.init();
            }
        }
    }

    isConnectedTo(p) {
        return (p == this.p1 || p == this.p2);
    }

    get fixed() {
        return this.p1.fixed && this.p2.fixed;
    }

    init() {
        this.cleanup()
        if (this.collidable) {
            this.scp.init();
        }
        this.inited = true;
    }

    cleanup() {
        if (this.collidable) {
            this.scp.cleanup();
        }
        this.inited = false
    }

    get delta() {
        return this.p1.curr.minus(this.p2.curr);
    }

    resolve() {
        if (this.p1.fixed && this.p2.fixed) {
            return;
        }
        const v = this.currLength * (this.p1.invMass + this.p2.invMass)
        const diff = (this.currLength - this.restLength) / v;
        const dmds = this.delta.mult(diff * this.stiffness);
        this.p1.curr.minusEquals(dmds.mult(this.p1.invMass));
        this.p2.curr.plusEquals(dmds.mult(this.p2.invMass));
    }

    checkParticlesLocation() {
        if (this.p1.curr.x == this.p2.curr.x && this.p1.curr.y == this.p2.curr.y) {
            this.p2.curr.x += 0.0001;
        }
    }
}