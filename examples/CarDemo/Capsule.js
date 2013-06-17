define("Capsule", function(require, exports, module){
    
    var JPE = require("JPE/JPE");
    var Group = require("JPE/Group");
    var CircleParticle = require("JPE/CircleParticle");
    var SpringConstraint = require("JPE/SpringConstraint");

    var Capsule = function(colC){

        Group.prototype.constructor.apply(this);

		var capsuleP1 = new CircleParticle(300, 10, 14, false, 1.3, 0.4);
		capsuleP1.setStyle(0, colC, 1, colC);
		this.addParticle(capsuleP1);
		
		var capsuleP2 = new CircleParticle(325, 35, 14, false, 1.3, 0.4);
		capsuleP2.setStyle(0, colC, 1, colC);
		this.addParticle(capsuleP2);
		
		var capsule = new SpringConstraint(capsuleP1, capsuleP2, 1, true, 24);
		capsule.setStyle(5, colC, 1, colC, 1);
		this.addConstraint(capsule);
    }

    JPE.extend(Capsule, Group);

    module.exports = Capsule;
});
