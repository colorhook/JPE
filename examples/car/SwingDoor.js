import {
	Group,
	CircleParticle,
	RectangleParticle,
	SpringConstraint,
} from '../../src/'

export default class SwingDoor extends Group {
	constructor(colE) {
		super()
		this.collideInternal = true;
		
		var swingDoorP1 = new CircleParticle(543,55,7);
		swingDoorP1.mass = 0.001;
		swingDoorP1.setStyle(1, colE, 1, colE);
		this.addParticle(swingDoorP1);
		
		var swingDoorP2 = new CircleParticle(620,55,7,true);
		swingDoorP2.setStyle(1, colE, 1, colE);
		this.addParticle(swingDoorP2);
		
		var swingDoor = new SpringConstraint(swingDoorP1, swingDoorP2, 1, true, 13);
		swingDoor.setStyle(2, colE, 1, colE);
		this.addConstraint(swingDoor);
		
		var swingDoorAnchor = new CircleParticle(543,5, 2, true);
		swingDoorAnchor.visible = false;
		swingDoorAnchor.collidable = false;
		this.addParticle(swingDoorAnchor);
		
		var swingDoorSpring = new SpringConstraint(swingDoorP1, swingDoorAnchor, 0.02);
		swingDoorSpring.restLength = 40;
		swingDoorSpring.pp = true;
		swingDoorSpring.visible = false;
		this.addConstraint(swingDoorSpring);
		
		var stopperA = new CircleParticle(550,-60,70,true);
		stopperA.visible = false;
		this.addParticle(stopperA);
		
		var stopperB = new RectangleParticle(650,130,42,70,0,true);
		stopperB.visible = false;
		this.addParticle(stopperB);
	}
}