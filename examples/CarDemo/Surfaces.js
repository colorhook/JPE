define("Surfaces", function(require, exports, module){
    
    var JPE = require("JPE/JPE");
    var Group = require("JPE/Group");
    var CircleParticle = require("JPE/CircleParticle");
    var RectangleParticle = require("JPE/RectangleParticle");
    
    var Surfaces = function(colA, colB, colC, colD, colE){

		Group.prototype.constructor.apply(this);

		var floor = new RectangleParticle(340,327,550,50,0,true);
		floor.setStyle(0, colD, 1, colD);
		this.addParticle(floor);
	
		var ceil = new RectangleParticle(325,-33,649,80,0,true);
		ceil.setStyle(0, colD, 1, colD);
		this.addParticle(ceil);

		var rampRight = new RectangleParticle(375,220,390,20,0.405,true);
		rampRight.setStyle(0, colD, 1, colD);
		this.addParticle(rampRight);
		
		var rampLeft = new RectangleParticle(90,200,102,20,-.7,true);
		rampLeft.setStyle(0, colD, 1, colD);
		this.addParticle(rampLeft);
		
		var rampLeft2 = new RectangleParticle(96,129,102,20,-.7,true);
		rampLeft2.setStyle(0, colD, 1, colD);
		this.addParticle(rampLeft2);
		
		var rampCircle = new CircleParticle(175,190,60,true);
		rampCircle.setStyle(1, colD, 1, colB);
		this.addParticle(rampCircle);
		
		
		var floorBump = new CircleParticle(600,660,400,true);
		floorBump.setStyle(1, colD, 1, colB);
		this.addParticle(floorBump);
		
		var bouncePad = new RectangleParticle(35,370,40,60,0,true);
		bouncePad.setStyle(0, colD, 1, 0x996633);
		bouncePad.setElasticity(4);
		this.addParticle(bouncePad);
		
		var leftWall = new RectangleParticle(1,99,30,500,0,true);
		leftWall.setStyle(0, colD, 1, colD);
		this.addParticle(leftWall);
		
		var leftWallChannelInner = new RectangleParticle(54,300,20,150,0,true);
		leftWallChannelInner.setStyle(0, colD, 1, colD);
		this.addParticle(leftWallChannelInner);
		
		var leftWallChannel = new RectangleParticle(54,122,20,94,0,true);
		leftWallChannel.setStyle(0, colD, 1, colD);
		this.addParticle(leftWallChannel);
		
		var leftWallChannelAng = new RectangleParticle(75,65,60,25,- 0.7,true);
		leftWallChannelAng.setStyle(0, colD, 1, colD);
		this.addParticle(leftWallChannelAng);
		
		var topLeftAng = new RectangleParticle(23,11,65,40,-0.7,true);
		topLeftAng.setStyle(0, colD, 1, colD);
		this.addParticle(topLeftAng);
		
		var rightWall = new RectangleParticle(654,230,50,500,0,true);
		rightWall.setStyle(0, colD, 1, colD);
		this.addParticle(rightWall);

		var bridgeStart = new RectangleParticle(127,49,75,25,0,true);
		bridgeStart.setStyle(0, colD, 1, colD);
		this.addParticle(bridgeStart);
		
		var bridgeEnd = new RectangleParticle(483,55,100,15,0,true);
		bridgeEnd.setStyle(0, colD, 1, colD);
		this.addParticle(bridgeEnd);
	}

    JPE.extend(Surfaces, Group);

    module.exports = Surfaces;
});
