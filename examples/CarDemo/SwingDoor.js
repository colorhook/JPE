define("SwingDoor", function(require, exports, module){
    
    var JPE = require("JPE/JPE");
    var Group = require("JPE/Group");
    var CircleParticle = require("JPE/CircleParticle");
    var RectangleParticle = require("JPE/RectangleParticle");
    var SpringConstraint = require("JPE/SpringConstraint");

    var SwingDoor = function(colE){

		Group.prototype.constructor.apply(this);
		// setting collideInternal allows the arm to hit the hidden stoppers. 
		// you could also make the stoppers its own group and tell it to collide 
		// with the SwingDoor
		this.collideInternal = true;
		
		var swingDoorP1 = new CircleParticle(543,55,7);
		swingDoorP1.setMass(0.001);
		swingDoorP1.setStyle(1, colE, 1, colE);
		this.addParticle(swingDoorP1);
		
		var swingDoorP2 = new CircleParticle(620,55,7,true);
		swingDoorP2.setStyle(1, colE, 1, colE);
		this.addParticle(swingDoorP2);
		
		var swingDoor = new SpringConstraint(swingDoorP1, swingDoorP2, 1, true, 13);
		swingDoor.setStyle(2, colE, 1, colE);
		this.addConstraint(swingDoor);
		
		var swingDoorAnchor = new CircleParticle(543,5, 2, true);
		swingDoorAnchor.setVisible(false);
		swingDoorAnchor.setCollidable(false);
		this.addParticle(swingDoorAnchor);
		
		var swingDoorSpring = new SpringConstraint(swingDoorP1, swingDoorAnchor, 0.02);
		swingDoorSpring.setRestLength(40);
		swingDoorSpring.pp = true;
		swingDoorSpring.setVisible(false);
		this.addConstraint(swingDoorSpring);
		
		var stopperA = new CircleParticle(550,-60,70,true);
		stopperA.setVisible(false);
		this.addParticle(stopperA);
		
		var stopperB = new RectangleParticle(650,130,42,70,0,true);
		stopperB.setVisible(false);
		this.addParticle(stopperB);
	}

    JPE.extend(SwingDoor, Group);

    module.exports = SwingDoor;

});