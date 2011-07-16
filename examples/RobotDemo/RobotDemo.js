JPE.declare("RobotDemo", {
	
	robot: null,
	halfStageWidth: 325,

	constructor: function(){
		var canvas = document.getElementById("myCanvas");
		var stage = this.stage = new Stage(canvas);

		var Vector = JPE.Vector,
			Engine = JPE.Engine,
			RectangleParticle = JPE.RectangleParticle,
			Group = JPE.Group;

		var Robot = JPE.Robot;


		Engine.init(1/4);
			
		// set up the default diplay container
		Engine.container = stage;
		
		Engine.addMasslessForce(new Vector(0,4));
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

		YUI().use('node-base', function(Y){
			Y.one(Y.config.doc).on('keydown', function(e){
				owner.keyDownHandler(e);
			});
		});
	},
	
	run: function(s){
		var robot = this.robot;
		JPE.Engine.step();
		robot.run();
		JPE.Engine.paint();
		this.stage.update();
		JPE.Engine.container.x = -robot.getPx() + this.halfStageWidth;

	},


	keyDownHandler: function(evt) {
		var robot = this.robot;

		switch (evt.keyCode) {
			case 80: // p
				robot.togglePower();
				break;
			case 82: // r
				robot.toggleDirection();
				break;
			case 72: // h
				robot.toggleLegs();
				break;
			default:
				break;
		}
	}
});