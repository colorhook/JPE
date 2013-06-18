define("JPE/CircleParticle", function(require, exports, module) {

    var JPE = require("JPE/JPE");
    var AbstractParticle = require("JPE/AbstractParticle");

    var CircleParticle = function(x, y, radius, fixed, mass, elasticity, friction) {
        mass = mass || 1;
        elasticity = elasticity || 0.3;
        friction = friction || 0;
        this._radius = radius;
        AbstractParticle.prototype.constructor.call(this, x, y, fixed, mass, elasticity, friction);
    };

    JPE.extend(CircleParticle, AbstractParticle, {

        getRadius: function() {
            return this._radius;
        },

        /**
         * @private
         */
        setRadius: function(t) {
            this._radius = t;
        },

        /**
         * @private
         */
        getProjection: function(axis) {

            var c = this.samp.dot(axis);

            this.interval.min = c - this._radius;
            this.interval.max = c + this._radius;
            return this.interval;
        },
        /**
         * @private
         */
        getIntervalX: function() {
            this.interval.min = this.curr.x - this._radius;
            this.interval.max = this.curr.x + this._radius;
            return this.interval;
        },

        getIntervalY: function() {
            this.interval.min = this.curr.y - this._radius;
            this.interval.max = this.curr.y + this._radius;
            return this.interval;
        }
    });

    module.exports = CircleParticle;
});