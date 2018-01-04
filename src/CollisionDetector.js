import Vector from './Vector'
import CollisionResolver from './CollisionResolver'
import RectangleParticle from './RectangleParticle'
import CircleParticle from './CircleParticle'

class CollisionDetector {

    constructor() {
        this.cpa = null
        this.cpb = null
        this.collNormal = null
        this.collDepth = null
    }
    
    test(objA, objB) {
        if (objA.fixed && objB.fixed) return;
        if (objA.multisample == 0 && objB.multisample == 0) {
            this.normVsNorm(objA, objB);
        } else if (objA.multisample > 0 && objB.multisample == 0) {
            this.sampVsNorm(objA, objB);
        } else if (objB.multisample > 0 && objA.multisample == 0) {
            this.sampVsNorm(objB, objA);
        } else if (objA.multisample == objB.multisample) {
            this.sampVsSamp(objA, objB);
        } else {
            this.normVsNorm(objA, objB);
        }
    }

    normVsNorm(objA, objB) {
        objA.samp.copy(objA.curr);
        objB.samp.copy(objB.curr);
        if (this.testTypes(objA, objB)) {
            CollisionResolver.resolve(this.cpa, this.cpb, this.collNormal, this.collDepth);
            return true;
        }
        return false;
    }

    sampVsNorm(objA, objB) {

        if (this.normVsNorm(objA, objB)) return;

        const objAsamples = objA.multisample
        const s = 1 / (objAsamples + 1)
        let t = s

        for (let i = 0; i <= objAsamples; i++) {
            objA.samp.setTo(objA.prev.x + t * (objA.curr.x - objA.prev.x),
            objA.prev.y + t * (objA.curr.y - objA.prev.y));
            if (this.testTypes(objA, objB)) {
                CollisionResolver.resolve(this.cpa, this.cpb, this.collNormal, this.collDepth);
                return;
            }
            t += s;
        }

    }

    sampVsSamp(objA, objB) {

        if (this.normVsNorm(objA, objB)) return;

        var objAsamples = objA.multisample,
            s = 1 / (objAsamples + 1),
            t = s,
            i;

        for (i = 0; i <= objAsamples; i++) {
            objA.samp.setTo(objA.prev.x + t * (objA.curr.x - objA.prev.x),
            objA.prev.y + t * (objA.curr.y - objA.prev.y));
            objB.samp.setTo(objB.prev.x + t * (objB.curr.x - objB.prev.x),
            objB.prev.y + t * (objB.curr.y - objB.prev.y));
            if (this.testTypes(objA, objB)) {
                CollisionResolver.resolve(this.cpa, this.cpb, this.collNormal, this.collDepth);
                return;
            }
            t += s;
        }
    }
    testTypes(objA, objB) {
        if ((objA instanceof RectangleParticle) && (objB instanceof RectangleParticle)) {
            return this.testOBBvsOBB(objA, objB);
        } else if ((objA instanceof CircleParticle) && (objB instanceof CircleParticle)) {
            return this.testCirclevsCircle(objA, objB);
        } else if ((objA instanceof RectangleParticle) && (objB instanceof CircleParticle)) {
            return this.testOBBvsCircle(objA, objB);
        } else if ((objA instanceof CircleParticle) && (objB instanceof RectangleParticle)) {
            return this.testOBBvsCircle(objB, objA);
        }
        return false;
    }
    
    testOBBvsOBB(ra, rb) {

        this.collDepth = Number.POSITIVE_INFINITY;

        for (let i = 0; i < 2; i++) {
            const axisA = ra.axes[i]
            const depthA = this.testIntervals(ra.getProjection(axisA), rb.getProjection(axisA))

            if (depthA == 0) return false;

            const axisB = rb.axes[i]
            const depthB = this.testIntervals(ra.getProjection(axisB), rb.getProjection(axisB))

            if (depthB == 0) return false;

            const absA = Math.abs(depthA)
            const absB = Math.abs(depthB)

            if (absA < Math.abs(this.collDepth) || absB < Math.abs(this.collDepth)) {
                const altb = absA < absB;
                this.collNormal = altb ? axisA : axisB;
                this.collDepth = altb ? depthA : depthB;
            }

        }

        this.cpa = ra;
        this.cpb = rb;
        return true;
    }
    testOBBvsCircle(ra, ca) {
        this.collDepth = Number.POSITIVE_INFINITY;
        const depths = new Array(2)
        for (let i = 0; i < 2; i++) {
            const boxAxis = ra.axes[i];
            const depth = this.testIntervals(ra.getProjection(boxAxis), ca.getProjection(boxAxis));
            if (depth == 0) return false;

            if (Math.abs(depth) < Math.abs(this.collDepth)) {
                this.collNormal = boxAxis;
                this.collDepth = depth;
            }
            depths[i] = depth;
        }

        const r = ca.radius;

        if (Math.abs(depths[0]) < r && Math.abs(depths[1]) < r) {
            var vertex = this.closestVertexOnOBB(ca.samp, ra);

            this.collNormal = vertex.minus(ca.samp);
            var mag = this.collNormal.magnitude();
            this.collDepth = r - mag;
            if (this.collDepth > 0) {
                this.collNormal.divEquals(mag);
            } else {
                return false;
            }
        }
        this.cpa = ra;
        this.cpb = ca;
        return true;
    }
    testCirclevsCircle(ca, cb) {
        const depthX = this.testIntervals(ca.getIntervalX(), cb.getIntervalX());
        if (depthX == 0) return false;

        const depthY = this.testIntervals(ca.getIntervalY(), cb.getIntervalY());
        if (depthY == 0) return false;

        this.collNormal = ca.samp.minus(cb.samp);
        const mag = this.collNormal.magnitude();
        this.collDepth = ca.radius + cb.radius - mag;

        if (this.collDepth > 0) {
            this.collNormal.divEquals(mag);
            this.cpa = ca;
            this.cpb = cb;
            return true;
        }
        return false;
    }
    testIntervals(intervalA, intervalB) {
        if (intervalA.max < intervalB.min) return 0;
        if (intervalB.max < intervalA.min) return 0;

        const lenA = intervalB.max - intervalA.min
        const lenB = intervalB.min - intervalA.max

        return (Math.abs(lenA) < Math.abs(lenB)) ? lenA : lenB;
    }
    closestVertexOnOBB(p, r) {
        const d = p.minus(r.samp)
        const q = new Vector(r.samp.x, r.samp.y)

        for (let i = 0; i < 2; i++) {
            let dist = d.dot(r.axes[i]);
            if (dist >= 0) {
                dist = r.extents[i];
            } else if (dist < 0) {
                dist = -r.extents[i];
            }
            q.plusEquals(r.axes[i].mult(dist));
        }
        return q;
    }
}

export default new CollisionDetector