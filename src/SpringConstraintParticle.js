import RectangleParticle from './RectangleParticle'
import CircleParticle from './CircleParticle'
import Vector from './Vector'
import MathUtil from './MathUtil'

export default class SpringConstraintParticle extends RectangleParticle{
    constructor(p1, p2, p, rectHeight, rectScale, scaleToLength) {
        super(0, 0, 0, 0, 0, false)
        this.p1 = p1;
        this.p2 = p2;

        this.s = 0;
        this.lambda = new Vector(0, 0);
        this.avgVelocity = new Vector(0, 0);

        this.parent = p;
        this.rectScale = rectScale;
        this.rectHeight = rectHeight;
        this.scaleToLength = scaleToLength;

        this._fixedEndLimit = 0;
        this.rca = new Vector();
        this.rcb = new Vector();
    }

    set rectScale(s) {
        this._rectScale = s;
    }

    get rectScale() {
        return this._rectScale;
    }

    set rectHeight(r) {
        this._rectHeight = r;
    }

    get rectHeight() {
        return this._rectHeight;
    }
    set fixedEndLimit(f) {
        this._fixedEndLimit = f;
    }

    get fixedEndLimit() {
        return this._fixedEndLimit;
    }
    get mass() {
        return (this.p1.mass + this.p2.mass) / 2;
    }
    set mass(v) {
        // super.mass = v
    }
    get elasticity() {
        return (this.p1.elasticity + this.p2.elasticity) / 2;
    }
    set elasticity(v) {
        // super.elasticity = v
    }
    get friction() {
        return (this.p1.friction + this.p2.friction) / 2;
    }
    set friction(v) {
        // super.friction = v
    }
    get velocity() {
        const p1v = this.p1.velocity;
        const p2v = this.p2.velocity;

        this.avgVelocity.setTo(((p1v.x + p2v.x) / 2), ((p1v.y + p2v.y) / 2));
        return this.avgVelocity;
    }
    set velocity(v) {
        // super.velocity = v
    }

    get invMass() {
        if (this.p1.fixed && this.p2.fixed) return 0;
        return 1 / ((this.p1.mass + this.p2.mass) / 2);
    }
    updatePosition() {
        const c = this.parent.center;
        this.curr.setTo(c.x, c.y);

        this.width = this.scaleToLength ? this.parent.currLength * this._rectScale : this.parent.restLength * this._rectScale;
        this.height = this.rectHeight;
        this.radian = this.parent.radian;
    }
    resolveCollision(mtd, vel, n, d, o, p) {

        if (this.fixed || !p.solid) {
            return
        }

        const t = this.getContactPointParam(p);
        const c1 = (1 - t);
        const c2 = t;

        const p1 = this.p1;
        const p2 = this.p2;
        const fixedEndLimit = this.fixedEndLimit;
        const lambda = this.lambda;
        

        // if one is fixed then move the other particle the entire way out of collision.
        // also, dispose of collisions at the sides of the scp. The higher the fixedEndLimit
        // value, the more of the scp not be effected by collision. 
        if (p1.fixed) {
            if (c2 <= fixedEndLimit) return;
            lambda.setTo(mtd.x / c2, mtd.y / c2);
            p2.curr.plusEquals(lambda);
            p2.velocity = vel;

        } else if (p2.fixed) {
            if (c1 <= fixedEndLimit) return;
            lambda.setTo(mtd.x / c1, mtd.y / c1);
            p1.curr.plusEquals(lambda);
            p1.velocity = vel;

            // else both non fixed - move proportionally out of collision
        } else {
            const denom = (c1 * c1 + c2 * c2);
            if (denom == 0) return;
            lambda.setTo(mtd.x / denom, mtd.y / denom);

            p1.curr.plusEquals(lambda.mult(c1));
            p2.curr.plusEquals(lambda.mult(c2));

            // if collision is in the middle of SCP set the velocity of both end particles
            if (t == 0.5) {
                p1.velocity = vel;
                p2.velocity = vel;

                // otherwise change the velocity of the particle closest to contact
            } else {
                const corrParticle = (t < 0.5) ? p1 : p2;
                corrParticle.velocity = vel;
            }
        }
    }
    closestParamPoint(c) {
        const ab = this.p2.curr.minus(this.p1.curr);
        const t = (ab.dot(c.minus(this.p1.curr))) / (ab.dot(ab));
        return MathUtil.clamp(t, 0, 1);
    }

    getContactPointParam(p) {

        var t;

        if (p instanceof CircleParticle) {
            t = this.closestParamPoint(p.curr);
        } else if (p instanceof RectangleParticle) {

            // go through the sides of the colliding rectangle as line segments
            var shortestIndex;
            var paramList = new Array(4);
            var shortestDistance = Number.POSITIVE_INFINITY;

            for (var i = 0; i < 4; i++) {
                this.setCorners(p, i);

                // check for closest points on SCP to side of rectangle
                var d = this.closestPtSegmentSegment();
                if (d < shortestDistance) {
                    shortestDistance = d;
                    shortestIndex = i;
                    paramList[i] = this.s;
                }
            }
            t = paramList[shortestIndex];
        }
        return t;
    }

    setCorners(r, i) {

        var rx = r.curr.x;
        var ry = r.curr.y;

        var axes = r.axes;
        var extents = r.extents;

        var ae0_x = axes[0].x * extents[0];
        var ae0_y = axes[0].y * extents[0];
        var ae1_x = axes[1].x * extents[1];
        var ae1_y = axes[1].y * extents[1];

        var emx = ae0_x - ae1_x;
        var emy = ae0_y - ae1_y;
        var epx = ae0_x + ae1_x;
        var epy = ae0_y + ae1_y;

        var rca = this.rca;
        var rcb = this.rcb;

        if (i == 0) {
            // 0 and 1
            rca.x = rx - epx;
            rca.y = ry - epy;
            rcb.x = rx + emx;
            rcb.y = ry + emy;

        } else if (i == 1) {
            // 1 and 2
            rca.x = rx + emx;
            rca.y = ry + emy;
            rcb.x = rx + epx;
            rcb.y = ry + epy;

        } else if (i == 2) {
            // 2 and 3
            rca.x = rx + epx;
            rca.y = ry + epy;
            rcb.x = rx - emx;
            rcb.y = ry - emy;

        } else if (i == 3) {
            // 3 and 0
            rca.x = rx - emx;
            rca.y = ry - emy;
            rcb.x = rx - epx;
            rcb.y = ry - epy;
        }
    }
    closestPtSegmentSegment() {

        var pp1 = this.p1.curr,
            pq1 = this.p2.curr,
            pp2 = this.rca,
            pq2 = this.rcb,

            d1 = pq1.minus(pp1),
            d2 = pq2.minus(pp2),
            r = pp1.minus(pp2),

            t,
            a = d1.dot(d1),
            e = d2.dot(d2),
            f = d2.dot(r),

            c = d1.dot(r),
            b = d1.dot(d2),
            denom = a * e - b * b;

        if (denom != 0.0) {
            this.s = MathUtil.clamp((b * f - c * e) / denom, 0, 1);
        } else {
            this.s = 0.5 // give the midpoint for parallel lines
        }
        t = (b * this.s + f) / e;

        if (t < 0) {
            t = 0;
            this.s = MathUtil.clamp(-c / a, 0, 1);
        } else if (t > 0) {
            t = 1;
            this.s = MathUtil.clamp((b - c) / a, 0, 1);
        }

        var c1 = pp1.plus(d1.mult(this.s));
        var c2 = pp2.plus(d2.mult(t));
        var c1mc2 = c1.minus(c2);
        return c1mc2.dot(c1mc2);
    }

}