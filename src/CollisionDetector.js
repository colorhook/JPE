import Vector from './Vector'
import CollisionResolver from './CollisionResolver'
import RigidItem from './RigidItem'
import RectangleParticle from './RectangleParticle'
import CircleParticle from './CircleParticle'
import RigidRectangle from './RigidRectangle'
import RigidCircle from './RigidCircle'
import RigidCollisionResolver from './RigidCollisionResolver'


class CollisionDetector {

    constructor() {
        this.cpa = null
        this.cpb = null
        this.hitpoint = []
        this.hp = new Vector()
        this.collNormal = null
        this.collDepth = null
    }
    
    test(objA, objB) {
        if (objA.getFixed() && objB.getFixed()) return;
        if (objA.getMultisample() == 0 && objB.getMultisample() == 0) {
            this.normVsNorm(objA, objB);
        } else if (objA.getMultisample() > 0 && objB.getMultisample() == 0) {
            this.sampVsNorm(objA, objB);
        } else if (objB.getMultisample() > 0 && objA.getMultisample() == 0) {
            this.sampVsNorm(objB, objA);
        } else if (objA.getMultisample() == objB.getMultisample()) {
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

        var objAsamples = objA.getMultisample(),
            s = 1 / (objAsamples + 1),
            t = s,
            i;
        //objB.samp.copy(objB.curr);

        for (i = 0; i <= objAsamples; i++) {
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

        var objAsamples = objA.getMultisample(),
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


        if (objA instanceof RigidItem && objB instanceof RigidItem) {
            this.testTypes2(objA, objB);
            return false;
        }

        if ((objA instanceof RectangleParticle) && (objB instanceof RectangleParticle)) {
            var r = this.testOBBvsOBB(objA, objB);
            return r;
        } else if ((objA instanceof CircleParticle) && (objB instanceof CircleParticle)) {
            return this.testCirclevsCircle(objA, objB);
        } else if ((objA instanceof RectangleParticle) && (objB instanceof CircleParticle)) {
            return this.testOBBvsCircle(objA, objB);
        } else if ((objA instanceof CircleParticle) && (objB instanceof RectangleParticle)) {
            return this.testOBBvsCircle(objB, objA);
        }
        return false;
    }
    testTypes2(objA, objB) {
        var result = false;
        var result2 = false;
        this.hitpoint = [];


        if (objA instanceof RigidRectangle && objB instanceof RigidRectangle) {
            result = this.testOBBvsOBB(objA, objB);
            if (result) {
                result2 = this.findHitPointRR(objA, objB);
            }
        } else if (objA instanceof RigidCircle && objB instanceof RigidCircle) {
            result = this.testCirclevsCircle(objA, objB);
            if (result) {
                result2 = this.findHitPointCC(objA, objB);
            }
        } else if (objA instanceof RigidRectangle && objB instanceof RigidCircle) {
            result = this.testOBBvsCircle(objA, objB);
            if (result) {
                result2 = this.findHitPointRC(objA, objB);
            }
        } else if (objA instanceof RigidCircle && objB instanceof RigidRectangle) {
            result = this.testOBBvsCircle(objB, objA);
            if (result) {
                result2 = this.findHitPointRC(objB, objA);
                if (result2) {
                    this.getHP();
                    RigidCollisionResolver.resolve(objB, objA, this.hp, this.collNormal, this.collDepth);
                    return false;
                }
            }
        }
        if (result2) {
            this.getHP();
            RigidCollisionResolver.resolve(objA, objB, this.hp, this.collNormal, this.collDepth);
            return false;
        } else {
            return result;
        }
    }
    getHP() {
        this.hp = new Vector();
        for (var i = 0; i < this.hitpoint.length; i++) {
            this.hp.plusEquals(this.hitpoint[i]);
        }
        if (this.hitpoint.length > 1) {
            this.hp.multEquals(1 / this.hitpoint.length);
        }
    }
    captures(r, vertices) {
        var re = false;
        for (var i = 0; i < vertices.length; i++) {
            if (r.captures(vertices[i])) {
                this.hitpoint.push(vertices[i]);
                re = true;
            }
        }
        return re;
    }
    findHitPointRR(a, b) {
        var r = false;
        if (this.captures(a, b.getVertices())) {
            r = true;
        }
        if (this.captures(b, a.getVertices())) {
            r = true;
        }
        return r;
    }
    findHitPointRC(a, b) {
        var r = false;
        if (this.captures(b, a.getVertices())) {
            r = true;
        }
        if (this.captures(a, b.getVertices(a.getNormals()))) {
            r = true;
        }
        return r;
    }
    findHitPointCC(a, b) {
        var d = b.samp.minus(a.samp);
        if (d.magnitude() <= (a.range + b.range)) {
            this.hitpoint.push(d.normalize().multEquals(a.range).plusEquals(a.samp));
            return true;
        } else {
            return false;
        }
    }
    testOBBvsOBB(ra, rb) {

        this.collDepth = POSITIVE_INFINITY;

        for (var i = 0; i < 2; i++) {
            var axisA = ra.getAxes()[i],
                rai = ra.getProjection(axisA),
                rbi = rb.getProjection(axisA),
                depthA = this.testIntervals(rai, rbi);

            if (depthA == 0) return false;

            var axisB = rb.getAxes()[i],
                depthB = this.testIntervals(ra.getProjection(axisB), rb.getProjection(axisB));

            if (depthB == 0) return false;

            var absA = Math.abs(depthA),
                absB = Math.abs(depthB);

            if (absA < Math.abs(this.collDepth) || absB < Math.abs(this.collDepth)) {
                var altb = absA < absB;
                this.collNormal = altb ? axisA : axisB;
                this.collDepth = altb ? depthA : depthB;
            }

        }

        this.cpa = ra;
        this.cpb = rb;
        return true;
    }
    testOBBvsCircle(ra, ca) {
        this.collDepth = POSITIVE_INFINITY;
        var depths = new Array(2),
            i = 0,
            boxAxis,
            depth,
            r;

        for (; i < 2; i++) {
            boxAxis = ra.getAxes()[i];
            depth = this.testIntervals(ra.getProjection(boxAxis), ca.getProjection(boxAxis));
            if (depth == 0) return false;

            if (Math.abs(depth) < Math.abs(this.collDepth)) {
                this.collNormal = boxAxis;
                this.collDepth = depth;
            }
            depths[i] = depth;
        }

        r = ca.getRadius();

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
        var depthX = this.testIntervals(ca.getIntervalX(), cb.getIntervalX());
        if (depthX == 0) return false;

        var depthY = this.testIntervals(ca.getIntervalY(), cb.getIntervalY());
        if (depthY == 0) return false;

        this.collNormal = ca.samp.minus(cb.samp);
        var mag = this.collNormal.magnitude();
        this.collDepth = ca.getRadius() + cb.getRadius() - mag;

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

        var lenA = intervalB.max - intervalA.min,
            lenB = intervalB.min - intervalA.max;

        return (Math.abs(lenA) < Math.abs(lenB)) ? lenA : lenB;
    }
    closestVertexOnOBB(p, r) {
        var d = p.minus(r.samp),
            q = new Vector(r.samp.x, r.samp.y),
            i = 0;

        for (; i < 2; i++) {
            var dist = d.dot(r.getAxes()[i]);
            if (dist >= 0) {
                dist = r.getExtents()[i];
            } else if (dist < 0) {
                dist = -r.getExtents()[i];
            }
            q.plusEquals(r.getAxes()[i].mult(dist));
        }
        return q;
    }
}

export default new CollisionDetector