import {
	Vector,
	Group,
	CircleParticle,
	RectangleParticle,
	SpringConstraint,
} from '../../src/'

import RectComposite from "./RectComposite"

export default class Rotator extends Group {
	constructor(colA, colB) {
		super()
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
	}

	rotateByRadian(a) {
		this.rectComposite.rotateByRadian(a, this.ctr);
	}
}