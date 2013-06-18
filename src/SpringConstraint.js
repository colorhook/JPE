define("JPE/SpringConstraint", function(require, exports, module) {

    var JPE = require("JPE/JPE");
    var AbstractConstraint = require("JPE/AbstractConstraint");
    var MathUtil = require("JPE/MathUtil");
    var SpringConstraintParticle = require("JPE/SpringConstraintParticle");

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
    var SpringConstraint = function(p1, p2, stiffness, collidable, rectHeight, rectScale, scaleToLength) {
        stiffness = stiffness || 0.5;
        rectHeight = rectHeight || 1;
        rectScale = rectScale || 1;
        AbstractConstraint.prototype.constructor.call(this, stiffness);
        this.p1 = p1;
        this.p2 = p2;
        this.checkParticlesLocation();
        this._restLength = this.getCurrLength();
        this.inited = false;
        this.setCollidable(collidable, rectHeight, rectScale, scaleToLength);
    };

    JPE.extend(SpringConstraint, AbstractConstraint, {

        getRadian: function() {
            var d = this.getDelta();
            return Math.atan2(d.y, d.x);
        },


        /**
         * The rotational value created by the positions of the two particles attached to this
         * SpringConstraint. You can use this property to in your own painting methods, along with the 
         * <code>center</code> property. 
         * 
         * @returns A Number representing the rotation of this SpringConstraint in degrees
         */
        getAngle: function() {
            return this.getRadian() * MathUtil.ONE_EIGHTY_OVER_PI;
        },


        /**
         * The center position created by the relative positions of the two particles attached to this
         * SpringConstraint. You can use this property to in your own painting methods, along with the 
         * rotation property.
         * 
         * @returns A Vector representing the center of this SpringConstraint
         */
        getCenter: function() {
            return (this.p1.curr.plus(this.p2.curr)).divEquals(2);
        },


        /**
         * If the <code>collidable</code> property is true, you can set the scale of the collidible area
         * between the two attached particles. Valid values are from 0 to 1. If you set the value to 1, then
         * the collision area will extend all the way to the two attached particles. Setting the value lower
         * will result in an collision area that spans a percentage of that distance. Setting the value
         * higher will cause the collision rectangle to extend past the two end particles.
         */
        setRectScale: function(s) {
            if (this.scp == null) return;
            this.scp.setRectScale(s);
        },


        /**
         * @private
         */
        getRectScale: function() {
            return this.scp.getRectScale();
        },


        /**
         * Returns the length of the SpringConstraint, the distance between its two 
         * attached particles.
         */
        getCurrLength: function() {
            return this.p1.curr.distance(this.p2.curr);
        },


        /**
         * If the <code>collidable</code> property is true, you can set the height of the 
         * collidible rectangle between the two attached particles. Valid values are greater 
         * than 0. If you set the value to 10, then the collision rect will be 10 pixels high.
         * The height is perpendicular to the line connecting the two particles
         */
        getRectHeight: function() {
            return this.scp.getRectHeight();
        },


        /**
         * @private
         */
        setRectHeight: function(h) {
            if (this.scp == null) return;
            this.scp.setRectHeight(h);
        },


        /**
         * The <code>restLength</code> property sets the length of SpringConstraint. This value will be
         * the distance between the two particles unless their position is altered by external forces. 
         * The SpringConstraint will always try to keep the particles this distance apart. Values must 
         * be > 0.
         */
        getRestLength: function() {
            return this._restLength;
        },


        /**
         * @private
         */
        setRestLength: function(r) {
            if (r <= 0) throw new Error("restLength must be greater than 0");
            this._restLength = r;
        },


        /**
         * Determines if the area between the two particles is tested for collision. If this value is on
         * you can set the <code>rectHeight</code> and <code>rectScale</code> properties 
         * to alter the dimensions of the collidable area.
         */



        /**
         * For cases when the SpringConstraint is <code>collidable</code> and only one of the
         * two end particles are fixed. This value will dispose of collisions near the
         * fixed particle, to correct for situations where the collision could never be
         * resolved. Values must be between 0.0 and 1.0.
         */
        getFixedEndLimit: function() {
            return this.scp.getFixedEndLimit();
        },


        /**
         * @private
         */
        setFixedEndLimit: function(f) {
            if (this.scp == null) return;
            this.scp.setFixedEndLimit(f);
        },

        getCollidable: function() {
            return this._collidable;
        },
        /**
         *
         */
        setCollidable: function(b, rectHeight, rectScale, scaleToLength) {
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
        },


        /**
         * Returns true if the passed particle is one of the two particles attached to this SpringConstraint.
         */
        isConnectedTo: function(p) {
            return (p == this.p1 || p == this.p2);
        },


        /**
         * Returns true if both connected particle's <code>fixed</code> property is true.
         */
        getFixed: function() {
            return this.p1.getFixed() && this.p2.getFixed();
        },


        /**
         * Sets up the visual representation of this SpringContraint. This method is called 
         * automatically when an instance of this SpringContraint's parent Group is added to 
         * the APEngine, when  this SpringContraint's Composite is added to a Group, or this 
         * SpringContraint is added to a Composite or Group.
         */
        initSelf: function() {
            if (this.getCollidable()) {
                this.scp.initSelf();
            }
            this.inited = true;
        },
        cleanup: function() {
            if (this.getCollidable()) {
                this.scp.cleanup();
            }
            this.inited = false
        },


        getDelta: function() {
            return this.p1.curr.minus(this.p2.curr);
        },



        /**
         * @private
         */
        resolve: function() {

            var p1 = this.p1,
                p2 = this.p2;

            if (p1.getFixed() && p2.getFixed()) return;

            var deltaLength = this.getCurrLength();
            var diff = (deltaLength - this.getRestLength()) / (deltaLength * (p1.getInvMass() + p2.getInvMass()));
            var dmds = this.getDelta().mult(diff * this.stiffness);
            this.p1.curr.minusEquals(dmds.mult(p1.getInvMass()));
            this.p2.curr.plusEquals(dmds.mult(p2.getInvMass()));
        },


        /**
         * if the two particles are at the same location offset slightly
         */
        checkParticlesLocation: function() {
            if (this.p1.curr.x == this.p2.curr.x && this.p1.curr.y == this.p2.curr.y) {
                this.p2.curr.x += 0.0001;
            }
        }
    });


    module.exports = SpringConstraint;
});