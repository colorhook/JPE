define("JPE/Vector", function(require, exports, module) {

    var JPE = require("JPE/JPE");

    var Vector = function(px, py) {
        this.x = px || 0;
        this.y = py || 0;
    };

    JPE.mix(Vector.prototype, {

        setTo: function(px, py) {
            this.x = px || 0;
            this.y = py || 0;
        },
        copy: function(v) {
            this.x = v.x;
            this.y = v.y;
        },
        dot: function(v) {
            return this.x * v.x + this.y * v.y;
        },
        cross: function(v) {
            return this.x * v.y - this.y * v.x;
        },
        plus: function(v) {
            return new Vector(this.x + v.x, this.y + v.y);
        },
        plusEquals: function(v) {
            this.x += v.x;
            this.y += v.y;
            return this;
        },
        minus: function(v) {
            return new Vector(this.x - v.x, this.y - v.y);
        },
        minusEquals: function(v) {
            this.x -= v.x;
            this.y -= v.y;
            return this;
        },
        mult: function(s) {
            return new Vector(this.x * s, this.y * s);
        },
        multEquals: function(s) {
            this.x *= s;
            this.y *= s;
            return this;
        },
        times: function(v) {
            return new Vector(this.x * v.x, this.y * v.y);
        },
        divEquals: function(s) {
            if (s == 0) {
                s = 0.0001;
            }
            this.x /= s;
            this.y /= s;
            return this;
        },
        magnitude: function() {
            return Math.sqrt(this.x * this.x + this.y * this.y);
        },
        distance: function(v) {
            var delta = this.minus(v);
            return delta.magnitude();
        },
        normalize: function() {
            var m = this.magnitude();
            if (m == 0) {
                m = 0.0001;
            }
            return this.mult(1 / m);
        },
        normalizeEquals: function() {
            var m = this.magnitude();
            if (m == 0) {
                m = 0.0001;
            }
            return this.multEquals(1 / m);
        },
        toString: function() {
            return Math.floor(this.x * 100) / 100 + " : " + Math.floor(this.y * 100) / 100;
        }
    });

    module.exports = Vector;
});