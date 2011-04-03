JPE.declare("Rotator", {

	superclass: JPE.Group,
	
	ctr: null,
	rectComposite: null,

	constructor: function(colA, colB){

		JPE.Rotator.superclass.prototype.constructor.apply(this, [true]);

		var Vector = JPE.Vector,
			CircleParticle = JPE.CircleParticle,
			RectangleParticle = JPE.RectangleParticle,
			RectComposite = JPE.RectComposite,
			SpringConstraint = JPE.SpringConstraint;

		this.collideInternal = true;
	
		var ctr = this.ctr = new Vector(555,175);
		this.rectComposite = new RectComposite(ctr, colA, colB);
		this.addComposite(this.rectComposite);

		var circA  = new CircleParticle(ctr.x, ctr.y, 5);
		circA.setStyle(1, colA, 1, colB);
		this.addParticle(circA);
		
		var rectA = new RectangleParticle(555,160,10,10,0,false,3);
		rectA.setStyle(1, colA, 1, colB);
		this.addParticle(rectA);
		
		var connectorA = new SpringConstraint(this.rectComposite.getPa(), rectA, 1);
		connectorA.setStyle(2, colB);
		this.addConstraint(connectorA);

		var rectB = new RectangleParticle(555,190,10,10,0,false,3);
		rectB.setStyle(1, colA, 1, colB);
		this.addParticle(rectB);
				
		var connectorB = new SpringConstraint(this.rectComposite.getPc(), rectB, 1);
		connectorB.setStyle(2, colB);
		this.addConstraint(connectorB);
		
	},
	
	rotateByRadian: function(a){

		this.rectComposite.rotateByRadian(a, this.ctr);
	}
});