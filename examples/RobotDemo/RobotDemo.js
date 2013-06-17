define("RobotDemo", function(require, exports, module){
	
	var JPE = require("JPE/JPE");
	var Engine = require("JPE/Engine");
	var VectorForce = require("JPE/VectorForce");
	var EaselRenderer = require("JPE/EaselRenderer");
	var Group = require("JPE/Group");
	var RectangleParticle = require("JPE/RectangleParticle");

	var Robot = require("./Robot");

	module.exports = {
	
		robot: null,
		halfStageWidth: 325,

		init: function(){
			var canvas = document.getElementById("myCanvas");
			var stage = this.stage = new Stage(canvas);

			Engine.init(1/4);
				
			// set up the default diplay container
			Engine.renderer = new EaselRenderer(stage);
			
			Engine.addForce(new VectorForce(true, 0, 4));
			Engine.damping = .99;
			Engine.constraintCollisionCycles = 10;
			
			var robot = this.robot = new Robot(1250, 260, 1.6, 0.02);
			
			var terrainA = new Group();
			var terrainB = new Group(true);
			var terrainC = new Group();
			
			var floor = new RectangleParticle(600,390,1700,100,0,true,1,0,1);
			floor.setStyle(0,0,0,0x999999);
			terrainA.addParticle(floor);
			
			
			// pyramid of boxes
			var box0 = new RectangleParticle(600,337,600,7,0,true,10,0,1);
			box0.setStyle(1,0x999999,1,0x336699);
			terrainA.addParticle(box0);
			
			var box1 = new RectangleParticle(600,330,500,7,0,true,10,0,1);
			box1.setStyle(1,0x999999,1,0x336699);
			terrainA.addParticle(box1);
			
			var box2 = new RectangleParticle(600,323,400,7,0,true,10,0,1);
			box2.setStyle(1,0x999999,1,0x336699);
			terrainA.addParticle(box2);
			
			var box3 = new RectangleParticle(600,316,300,7,0,true,10,0,1);
			box3.setStyle(1,0x999999,1,0x336699);
			terrainA.addParticle(box3);
			
			var box4 = new RectangleParticle(600,309,200,7,0,true,10,0,1);
			box4.setStyle(1,0x999999,1,0x336699);
			terrainA.addParticle(box4);
				
			var box5 = new RectangleParticle(600,302,100,7,0,true,10,0,1);
			box5.setStyle(1,0x999999,1,0x336699);
			terrainA.addParticle(box5);
			
			
			// left side floor
			var floor2 = new RectangleParticle(-100,390,1100,100,0.3,true,1,0,1);
			floor2.setStyle(0,0,0,0x999999);
			terrainB.addParticle(floor2);
			
			var floor3 = new RectangleParticle(-959,232,700,100,0,true,1,0,1);
			floor3.setStyle(0,0,0,0x999999);
			terrainB.addParticle(floor3);
			
			var box6 = new RectangleParticle(-990,12,50,25,0);
			box6.setStyle(1,0x999999,1,0x336699);
			terrainB.addParticle(box6);
			
			var floor5 = new RectangleParticle(-1284,170,50,100,0,true);
			floor5.setStyle(0,0,0,0x999999);
			terrainB.addParticle(floor5);
			
			
			// right side floor
			var floor6 = new RectangleParticle(1430,320,50,60,0,true);
			floor6.setStyle(0,0,0,0x999999);
			terrainC.addParticle(floor6);
			
			
			Engine.addGroup(robot);
			Engine.addGroup(terrainA);
			Engine.addGroup(terrainB);
			Engine.addGroup(terrainC);
			
			robot.addCollidable(terrainA);
			robot.addCollidable(terrainB);
			robot.addCollidable(terrainC);
			
			robot.togglePower();
			
			//loop
			var owner = this;
			setInterval(function(){
				owner.run();
			}, 10);

      key('p', function(){
          robot.togglePower();
      });
      key('r', function(){
          robot.toggleDirection();
      });
      key('h', function(){
          robot.toggleLegs();
      });

		},
		
		run: function(s){
			var robot = this.robot;
			Engine.step();
			robot.run();
			Engine.paint();
			this.stage.update();
			Engine.renderer.stage.x = -robot.getPx() + this.halfStageWidth;

		}
	}
})
