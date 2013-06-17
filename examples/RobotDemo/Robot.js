define("Robot", function(require, exports, module){

	var JPE = require("JPE/JPE");
	var Engine = require("JPE/Engine");
	var Group = require("JPE/Group");
	var SpringConstraint = require("JPE/SpringConstraint");

	var Body = require("./Body");
	var Motor = require("./Motor");
	var Leg = require("./Leg");

	var Robot = function(px, py, scale, power){

		Group.prototype.constructor.apply(this);

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
		legLA.getCam().setPosition(motor.getRimA().getPosition());
		legRA.getCam().setPosition(motor.getRimA().getPosition());
		var connLAA = new SpringConstraint(legLA.getCam(), motor.getRimA(), 1);
		var connRAA = new SpringConstraint(legRA.getCam(), motor.getRimA(), 1);
		
		legLB.getCam().setPosition(motor.getRimB().getPosition());
		legRB.getCam().setPosition(motor.getRimB().getPosition());
		var connLBB = new SpringConstraint(legLB.getCam(), motor.getRimB(), 1);
		var connRBB = new SpringConstraint(legRB.getCam(), motor.getRimB(), 1);		
		
		legLC.getCam().setPosition(motor.getRimC().getPosition());
		legRC.getCam().setPosition(motor.getRimC().getPosition());
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
	};

	JPE.extend(Robot, Group, {
	  body:null,
	  motor:null,
	
	  direction:null,
	  powerLevel:null,
	
	  powered:null,
	  legsVisible:null,
	
	  legLA:null,
	  legRA:null,
	  legLB:null,
	  legRB:null,
	  legLC:null,
	  legRC:null,

		getPx: function () {
			return this.body.center.getPx();
		},
		
		
		getPy: function () {
			return this.body.center.getPy();
		},
		
		
		run: function () {
			this.motor.run();
		},
		
		
		togglePower: function () {
			
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
		},
		
		
		toggleDirection: function () {
			this.direction *= -1;
			this.motor.setPower(this.powerLevel * this.direction);
		},
		
		toggleLegs: function (){
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
		},
		
		
		setStiffness: function (s) {
			
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
	});

	module.exports = Robot;

});

