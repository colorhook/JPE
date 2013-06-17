define("Car", function(require, exports, module){

    var JPE = require("JPE/JPE");
    var Group = require("JPE/Group");
    var Vector = require("JPE/Vector");
    var CircleParticle = require("JPE/CircleParticle");
    var WheelParticle = require("JPE/WheelParticle");
    var SpringConstraint = require("JPE/SpringConstraint");

    var Car = function(colC, colE){

		Group.prototype.constructor.apply(this);

		var wheelParticleA = new WheelParticle(140,10,14,false,2);
		wheelParticleA.setStyle(0, colC, 1, colE);
		this.addParticle(wheelParticleA);
		
		var wheelParticleB = new WheelParticle(200,10,14,false,2);
		wheelParticleB.setStyle(1, colC, 1, colE);
		this.addParticle(wheelParticleB);
		
		var wheelConnector = new SpringConstraint(wheelParticleA, wheelParticleB, 0.5, true, 8);
		wheelConnector.setStyle(1, colC, 1, colE);
		this.addConstraint(wheelConnector);

		this.wheelParticleA = wheelParticleA;
		this.wheelParticleB = wheelParticleB;
	}


    JPE.extend(Car, Group, {
        wheelParticleA: null,
        wheelParticleB: null,
        setSpeed: function(s){
          this.wheelParticleA.setAngularVelocity(s);
		  this.wheelParticleB.setAngularVelocity(s);
        }
    });

    module.exports = Car;
});
