import {
	Engine,
	Group,
	SpringConstraint,

} from '../../src/'

import Body from "./Body";
import Motor from "./Motor";
import Leg from "./Leg";

export default class Robot extends Group {
	
	constructor(px, py, scale, power){

		super()
	// legs
		var legLA = this.legLA = new Leg(px, py, -1, scale, 2, 0x444444, 1, 0x222222, 1);
		var legRA = this.legRA = new Leg(px, py,  1, scale, 2, 0x444444, 1, 0x222222, 1);
		var legLB = this.legLB = new Leg(px, py, -1, scale, 2, 0x666666, 1, 0x444444, 1);
		var legRB = this.legRB = new Leg(px, py,  1, scale, 2, 0x666666, 1, 0x444444, 1);
		var legLC = this.legLC = new Leg(px, py, -1, scale, 2, 0x888888, 1, 0x666666, 1);
		var legRC = this.legRC = new Leg(px, py,  1, scale, 2, 0x888888, 1, 0x666666, 1);
		
		// body
		var body = this.body = new Body(legLA.getFix(), legRA.getFix(), 30 * scale, 2, 0x336699, 1);
		
		// motor
		var motor = this.motor = new Motor(body.center, 8 * scale, 0x336699);
		
		// connect the body to the legs
		var connLA = new SpringConstraint(body.left,  legLA.getFix(), 1);
		var connRA = new SpringConstraint(body.right, legRA.getFix(), 1);
		var connLB = new SpringConstraint(body.left,  legLB.getFix(), 1);
		var connRB = new SpringConstraint(body.right, legRB.getFix(), 1);
		var connLC = new SpringConstraint(body.left,  legLC.getFix(), 1);
		var connRC = new SpringConstraint(body.right, legRC.getFix(), 1);

		
		// connect the legs to the motor
		legLA.getCam().position = motor.getRimA().position;
		legRA.getCam().position = motor.getRimA().position;
		var connLAA = new SpringConstraint(legLA.getCam(), motor.getRimA(), 1);
		var connRAA = new SpringConstraint(legRA.getCam(), motor.getRimA(), 1);
		
		legLB.getCam().position = motor.getRimB().position;
		legRB.getCam().position = motor.getRimB().position;
		var connLBB = new SpringConstraint(legLB.getCam(), motor.getRimB(), 1);
		var connRBB = new SpringConstraint(legRB.getCam(), motor.getRimB(), 1);		
		
		legLC.getCam().position = motor.getRimC().position;
		legRC.getCam().position = motor.getRimC().position;
		var connLCC = new SpringConstraint(legLC.getCam(), motor.getRimC(), 1);
		var connRCC = new SpringConstraint(legRC.getCam(), motor.getRimC(), 1);
		
		connLAA.setLine(2,0x999999);
		connRAA.setLine(2,0x999999);
		connLBB.setLine(2,0x999999);
		connRBB.setLine(2,0x999999);
		connLCC.setLine(2,0x999999);
		connRCC.setLine(2,0x999999);
		
		// add to the engine
		this.addComposite(legLA);
		this.addComposite(legRA);
		this.addComposite(legLB);
		this.addComposite(legRB);
		this.addComposite(legLC);
		this.addComposite(legRC);
			
		this.addComposite(body); 
		this.addComposite(motor);
		
		this.addConstraint(connLA);
		this.addConstraint(connRA);
		this.addConstraint(connLB);
		this.addConstraint(connRB);
		this.addConstraint(connLC);
		this.addConstraint(connRC);			
		
		this.addConstraint(connLAA); 
		this.addConstraint(connRAA);
		this.addConstraint(connLBB); 
		this.addConstraint(connRBB);
		this.addConstraint(connLCC); 
		this.addConstraint(connRCC);
		
		this.direction = -1
		this.powerLevel = power; 
		
		this.powered = true;
		this.legsVisible=true;
	}
	get px () {
		return this.body.center.px;
	}
	
	get py () {
		return this.body.center.py;
	}
	
	run () {
		this.motor.run();
	}
	
	
	togglePower () {
		
		this.powered = !this.powered
		
		if (this.powered) {
			this.motor.setPower(this.powerLevel * this.direction);
			this.setStiffness(1);
			Engine.damping = 0.99;
		} else {
			this.motor.setPower(0);
			this.setStiffness (0.2);				
			Engine.damping = 0.35;
		}
	}
	
	
	toggleDirection () {
		this.direction *= -1;
		this.motor.setPower(this.powerLevel * this.direction);
	}
	
	toggleLegs (){
		this.legsVisible = ! this.legsVisible;

		if (!this.legsVisible) {
			this.legLA.setVisible(false);
			this.legRA.setVisible(false);
			this.legLB.setVisible(false);
			this.legRB.setVisible(false);
		} else {
			this.legLA.setVisible(true);
			this.legRA.setVisible(true);		
			this.legLB.setVisible(true);
			this.legRB.setVisible(true);
		}
	}
	
	setStiffness(s) {
		
		// top level constraints in the group
		for (var i = 0, l = this.constraints.length;i < l; i++) {
			var sp = this.constraints[i]; 
			sp.stiffness = s;
		}
		
		// constraints within this groups composites
		for (var j = 0, m= this.composites.length; j < m; j++) {
			for (i = 0; i < this.composites[j].constraints.length; i++) {
				sp = this.composites[j].constraints[i]; 
				sp.stiffness = s;
			}
		}
	}
}
