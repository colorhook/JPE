define("JPE/VectorForce", function(require, exports, module) {

    var JPE = require("JPE/JPE");
    var IForce = require("JPE/IForce");
    var Vector = require("JPE/Vector");

    var VectorForce = function(useMass, vx, vy) {
        this.fvx = vx;
        this.fvy = vy;
        this.scaleMass = useMass;
        this.value = new Vector(vx, vy);
    };

    JPE.extend(VectorForce, IForce, {
        setVx: function(x) {
            this.fvx = x;
            this.value.x = x;
        },
        setVy: function(y) {
            this.fvy = y;
            this.value.y = y;
        },
        setUseMass: function(b) {
            this.scaleMass = b;
        },
        getValue: function(invMass) {
            if (this.scaleMass) {
                this.value.setTo(this.fvx * invMass, this.fvy * invMass);
            }
            return this.value;
        }
    });

    module.exports = VectorForce;
});