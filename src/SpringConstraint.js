import AbstractConstraint from './AbstractConstraint'
import MathUtil from './MathUtil'
import SpringConstraintParticle from './SpringConstraintParticle'

class SpringConstraint extends AbstractConstraint {
    constructor(p1, p2, stiffness, collidable, rectHeight, rectScale, scaleToLength) {
        stiffness = stiffness || 0.5;
        rectHeight = rectHeight || 1;
        rectScale = rectScale || 1;
        super(stiffness)
        this.p1 = p1;
        this.p2 = p2;
        this.checkParticlesLocation();
        this._restLength = this.getCurrLength();
        this.inited = false;
        this.setCollidable(collidable, rectHeight, rectScale, scaleToLength);
    }

    getRadian() {
        var d = this.getDelta();
        return Math.atan2(d.y, d.x);
    }


    getAngle() {
        return this.getRadian() * MathUtil.ONE_EIGHTY_OVER_PI;
    }

    getCenter() {
        return (this.p1.curr.plus(this.p2.curr)).divEquals(2);
    }

    setRectScale(s) {
        if (this.scp == null) return;
        this.scp.setRectScale(s);
    }

    getRectScale() {
        return this.scp.getRectScale();
    }


    getCurrLength() {
        return this.p1.curr.distance(this.p2.curr);
    }

    getRectHeight() {
        return this.scp.getRectHeight();
    }

    setRectHeight(h) {
        if (this.scp == null) return;
        this.scp.setRectHeight(h);
    }

    getRestLength() {
        return this._restLength;
    }

    setRestLength(r) {
        if (r <= 0) throw new Error("restLength must be greater than 0");
        this._restLength = r;
    }

    getFixedEndLimit() {
        return this.scp.getFixedEndLimit();
    }

    setFixedEndLimit(f) {
        if (this.scp == null) return;
        this.scp.setFixedEndLimit(f);
    }

    getCollidable() {
        return this._collidable;
    }

    setCollidable(b, rectHeight, rectScale, scaleToLength) {
        this._collidable = b;
        this.scp = null;

        if (this._collidable) {
            if (this.scp) {
                this.scp.cleanup();
            }
            this.scp = new SpringConstraintParticle(this.p1, this.p2, this, rectHeight, rectScale, scaleToLength);
            if (this.inited) {
                this.scp.initSelf();
            }
        }
    }

    isConnectedTo(p) {
        return (p == this.p1 || p == this.p2);
    }

    getFixed() {
        return this.p1.getFixed() && this.p2.getFixed();
    }

    initSelf() {
        if (this.getCollidable()) {
            this.scp.initSelf();
        }
        this.inited = true;
    }
    cleanup() {
        if (this.getCollidable()) {
            this.scp.cleanup();
        }
        this.inited = false
    }

    getDelta() {
        return this.p1.curr.minus(this.p2.curr);
    }

    resolve() {

        var p1 = this.p1,
            p2 = this.p2;

        if (p1.getFixed() && p2.getFixed()) return;

        var deltaLength = this.getCurrLength();
        var diff = (deltaLength - this.getRestLength()) / (deltaLength * (p1.getInvMass() + p2.getInvMass()));
        var dmds = this.getDelta().mult(diff * this.stiffness);
        this.p1.curr.minusEquals(dmds.mult(p1.getInvMass()));
        this.p2.curr.plusEquals(dmds.mult(p2.getInvMass()));
    }

    checkParticlesLocation() {
        if (this.p1.curr.x == this.p2.curr.x && this.p1.curr.y == this.p2.curr.y) {
            this.p2.curr.x += 0.0001;
        }
    }
}