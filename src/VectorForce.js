JPE.declare('VectorForce', {

	superclass: JPE.IForce,

	constructor: function(useMass, vx, vy){
		this.fvx = vx;
		this.fvy = vy;
		this.scaleMass = useMass;
		this.value = new JPE.Vector(vx, vy);
	},

	setVx: function(x){
		this.fvx = x;
		this.value.x = x;
	},
	setVy: function(y){
		this.fvy = y;
		this.value.y = y;
	},
	setUseMass: function(b){
		this.scaleMass = b;
	},
	getValue: function(invMass){
		if(this.scaleMass){
			this.value.setTo(this.fvx * invMass, this.fvy* invMass);
		}
		return this.value;
	}
});
