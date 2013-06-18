define("JPE/Composite", function(require, exports, module) {

    var JPE = require("JPE/JPE");
    var Vector = require("JPE/Vector");
    var MathUtil = require("JPE/MathUtil");
    var AbstractCollection = require("JPE/AbstractCollection");

    var Composite = function() {
        AbstractCollection.prototype.constructor.apply(this);
        this.delta = new Vector();
    };

    JPE.extend(Composite, AbstractCollection, {

        rotateByRadian: function(angleRadians, center) {
            var p,
                pa = this.particles,
                len = pa.length;

            for (var i = 0; i < len; i++) {
                p = pa[i];
                var radius = p.getCenter().distance(center);
                var angle = this.getRelativeAngle(center, p.getCenter()) + angleRadians;
                p.setPx(Math.cos(angle) * radius + center.x);
                p.setPy(Math.sin(angle) * radius + center.y);
            }
        },
        /**
         * Rotates the Composite to an angle specified in degrees, around a given center
         */
        rotateByAngle: function(angleDegrees, center) {
            var angleRadians = angleDegrees * MathUtil.PI_OVER_ONE_EIGHTY;
            this.rotateByRadian(angleRadians, center);
        },


        /**
         * The fixed state of the Composite. Setting this value to true or false will
         * set all of this Composite's component particles to that value. Getting this 
         * value will return false if any of the component particles are not fixed.
         */
        getFixed: function() {
            for (var i = 0, l = this.particles.length; i < l; i++) {
                if (!particles[i].getFixed()) return false;
            }
            return true;
        },


        /**
         * @private
         */
        setFixed: function(b) {
            for (var i = 0, l = this.particles.length; i < l; i++) {
                this.particles[i].setFixed(b);
            }
        },


        getRelativeAngle: function(center, p) {
            this.delta.setTo(p.x - center.x, p.y - center.y);
            return Math.atan2(this.delta.y, this.delta.x);
        }
    });

    module.exports = Composite;
});