define("JPE/SpringConstraintParticle", function(require, exports, module) {

    var JPE = require("JPE/JPE");
    var RectangleParticle = require("JPE/RectangleParticle");
    var Vector = require("JPE/Vector");
    var MathUtil = require("JPE/MathUtil");
    var RectangleParticle = require("JPE/RectangleParticle");
    var CircleParticle = require("JPE/CircleParticle");

    /**
     * @param p1 The first particle this constraint is connected to.
     * @param p2 The second particle this constraint is connected to.
     * @param stiffness The strength of the spring. Valid values are between 0 and 1. Lower values
     * result in softer springs. Higher values result in stiffer, stronger springs.
     * @param collidable Determines if the constraint will be checked for collision
     * @param rectHeight If the constraint is collidable, the height of the collidable area
     * can be set in pixels. The height is perpendicular to the two attached particles.
     * @param rectScale If the constraint is collidable, the scale of the collidable area
     * can be set in value from 0 to 1. The scale is percentage of the distance between 
     * the the two attached particles.
     * @param scaleToLength If the constraint is collidable and this value is true, the 
     * collidable area will scale based on changes in the distance of the two particles. 
     */
    var SpringConstraintParticle = function(p1, p2, p, rectHeight, rectScale, scaleToLength) {

        this.p1 = p1;
        this.p2 = p2;

        this.lambda = new Vector(0, 0);
        this.avgVelocity = new Vector(0, 0);

        this.parent = p;
        RectangleParticle.prototype.constructor.call(this, 0, 0, 0, 0, 0, false);
        this._rectScale = rectScale;
        this._rectHeight = rectHeight;
        this.scaleToLength = scaleToLength;

        this._fixedEndLimit = 0;
        this.rca = new Vector();
        this.rcb = new Vector();


    };

    JPE.extend(SpringConstraintParticle, RectangleParticle, {

        setRectScale: function(s) {
            this._rectScale = s;
        },


        /**
         * @private
         */
        getRectScale: function() {
            return this._rectScale;
        },


        setRectHeight: function(r) {
            this._rectHeight = r;
        },


        /**
         * @private
         */
        getRectHeight: function() {
            return this._rectHeight;
        },


        /**
         * For cases when the SpringConstraint is both collidable and only one of the
         * two end particles are fixed, this value will dispose of collisions near the
         * fixed particle, to correct for situations where the collision could never be
         * resolved.
         */
        setFixedEndLimit: function(f) {
            this._fixedEndLimit = f;
        },


        /**
         * @private
         */
        getFixedEndLimit: function() {
            return this._fixedEndLimit;
        },


        /**
         * returns the average mass of the two connected particles
         */
        getMass: function() {
            return (this.p1.getMass() + this.p2.getMass()) / 2;
        },


        /**
         * returns the average elasticity of the two connected particles
         */
        getElasticity: function() {
            return (this.p1.getElasticity() + this.p2.getElasticity()) / 2;
        },


        /**
         * returns the average friction of the two connected particles
         */
        getFriction: function() {
            return (this.p1.getFriction() + this.p2.getFriction()) / 2;
        },


        /**
         * returns the average velocity of the two connected particles
         */
        getVelocity: function() {
            var p1v = this.p1.getVelocity();
            var p2v = this.p2.getVelocity();

            this.avgVelocity.setTo(((p1v.x + p2v.x) / 2), ((p1v.y + p2v.y) / 2));
            return this.avgVelocity;
        },

        /**
         * @private
         * returns the average inverse mass.
         */
        getInvMass: function() {
            if (this.p1.getFixed() && this.p2.getFixed()) return 0;
            return 1 / ((this.p1.getMass() + this.p2.getMass()) / 2);
        },


        /**
         * called only on collision
         */
        updatePosition: function() {

            var c = this.parent.getCenter();
            this.curr.setTo(c.x, c.y);

            this.setWidth((this.scaleToLength) ? this.parent.getCurrLength() * this._rectScale : this.parent.getRestLength() * this._rectScale);
            this.setHeight(this.getRectHeight());
            this.setRadian(this.parent.getRadian());

        },


        resolveCollision: function(mtd, vel, n, d, o, p) {

            var t = this.getContactPointParam(p);
            var c1 = (1 - t);
            var c2 = t;
            var p1 = this.p1;
            var p2 = this.p2;
            var fixedEndLimit = this.getFixedEndLimit();
            var lambda = this.lambda;

            // if one is fixed then move the other particle the entire way out of collision.
            // also, dispose of collisions at the sides of the scp. The higher the fixedEndLimit
            // value, the more of the scp not be effected by collision. 
            if (p1.getFixed()) {
                if (c2 <= fixedEndLimit) return;
                lambda.setTo(mtd.x / c2, mtd.y / c2);
                p2.curr.plusEquals(lambda);
                p2.setVelocity(vel);

            } else if (p2.getFixed()) {
                if (c1 <= fixedEndLimit) return;
                lambda.setTo(mtd.x / c1, mtd.y / c1);
                p1.curr.plusEquals(lambda);
                p1.setVelocity(vel);

                // else both non fixed - move proportionally out of collision
            } else {
                var denom = (c1 * c1 + c2 * c2);
                if (denom == 0) return;
                lambda.setTo(mtd.x / denom, mtd.y / denom);

                p1.curr.plusEquals(lambda.mult(c1));
                p2.curr.plusEquals(lambda.mult(c2));

                // if collision is in the middle of SCP set the velocity of both end particles
                if (t == 0.5) {
                    p1.setVelocity(vel);
                    p2.setVelocity(vel);

                    // otherwise change the velocity of the particle closest to contact
                } else {
                    var corrParticle = (t < 0.5) ? p1 : p2;
                    corrParticle.setVelocity(vel);
                }
            }
        },


        /**
         * given point c, returns a parameterized location on this SCP. Note
         * this is just treating the SCP as if it were a line segment (ab).
         */
        closestParamPoint: function(c) {
            var ab = this.p2.curr.minus(this.p1.curr);
            var t = (ab.dot(c.minus(this.p1.curr))) / (ab.dot(ab));
            return MathUtil.clamp(t, 0, 1);
        },


        /**
         * returns a contact location on this SCP expressed as a parametric value in [0,1]
         */
        getContactPointParam: function(p) {

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
                        paramList[i] = s;
                    }
                }
                t = paramList[shortestIndex];
            }
            return t;
        },


        /**
         * 
         */
        setCorners: function(r, i) {

            var rx = r.curr.x;
            var ry = r.curr.y;

            var axes = r.getAxes();
            var extents = r.getExtents();

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
        },


        /**
         * pp1-pq1 will be the SCP line segment on which we need parameterized s. 
         */
        closestPtSegmentSegment: function() {

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
                s = MathUtil.clamp((b * f - c * e) / denom, 0, 1);
            } else {
                s = 0.5 // give the midpoint for parallel lines
            }
            t = (b * s + f) / e;

            if (t < 0) {
                t = 0;
                s = MathUtil.clamp(-c / a, 0, 1);
            } else if (t > 0) {
                t = 1;
                s = MathUtil.clamp((b - c) / a, 0, 1);
            }

            var c1 = pp1.plus(d1.mult(s));
            var c2 = pp2.plus(d2.mult(t));
            var c1mc2 = c1.minus(c2);
            return c1mc2.dot(c1mc2);
        }

    });

    module.exports = SpringConstraintParticle;
});