JPE.declare("Car", {

	superclass: JPE.Group,
	
	wheelParticleA: null,
	wheelParticleB: null,

	constructor: function(colC, colE){

		JPE.Car.superclass.prototype.constructor.apply(this);

		var CircleParticle = JPE.CircleParticle,
			WheelParticle = JPE.WheelParticle,
			SpringConstraint = JPE.SpringConstraint;

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
	},
	
	setSpeed: function(s){
		this.wheelParticleA.setAngularVelocity(s);
		this.wheelParticleB.setAngularVelocity(s);
	}
});