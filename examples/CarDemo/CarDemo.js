JPE.declare("CarDemo", {
	
	car: null,
	rotator: null,

	constructor: function(){
		var canvas = document.getElementById("myCanvas");
		var stage = this.stage = new Stage(canvas);

		var Vector = JPE.Vector,
			Engine = JPE.Engine,
			EaselRenderer = JPE.EaselRenderer,
			CircleParticle = JPE.CircleParticle,
			WheelParticle = JPE.WheelParticle,
			WheelParticle = JPE.WheelParticle,
			SpringConstraint = JPE.SpringConstraint;
		
		var colA = 0x334433;
		var colB = 0x3366aa;
		var colC = 0xaabbbb;
		var colD = 0x6699aa;
		var colE = 0x778877;

		var Surfaces = JPE.Surfaces,
			Bridge = JPE.Bridge,
			Capsule = JPE.Capsule,
			Rotator = JPE.Rotator,
			SwingDoor = JPE.SwingDoor,
			Car = JPE.Car;


		Engine.init(1/4);
			
		// set up the default diplay container
		Engine.renderer = new EaselRenderer(stage);
		
		// gravity -- particles of varying masses are affected the same
		Engine.addMasslessForce(new Vector(0, 3));
		
		// groups - all these classes extend group
		var surfaces = new Surfaces(colA, colB, colC, colD, colE);
		Engine.addGroup(surfaces);
		
		var bridge = new Bridge(colB, colC, colD);
		Engine.addGroup(bridge);
		
		var capsule = new Capsule(colC);
		Engine.addGroup(capsule);
		
		rotator = new Rotator(colB, colE);
		Engine.addGroup(rotator);

		var swingDoor = new SwingDoor(colC);
		Engine.addGroup(swingDoor);
		
		var car = new Car(colC, colE);
		Engine.addGroup(car);
		// determine what collides with what.
		car.addCollidableList([surfaces, bridge, rotator, swingDoor, capsule]);
		capsule.addCollidableList([surfaces, bridge, rotator, swingDoor]);

		this.car = car;
		this.rotator = rotator;
		
		
		//loop
		var owner = this;
		setInterval(function(){
			owner.run();
		}, 10);

		YUI().use('node-base', function(Y){
			Y.one(Y.config.doc).on('keydown', function(e){
				owner.keyDownHandler(e);
			});
			Y.one(Y.config.doc).on('keyup', function(e){
				owner.keyUpHandler(e);
			});
		});
	},
	
	run: function(s){
		JPE.Engine.step();
		JPE.Engine.paint();
		this.stage.update();
		this.rotator.rotateByRadian(.02);
	},

	keyDownHandler: function(keyEvt) {
		var keySpeed = 0.2;

		if (keyEvt.keyCode == 65) {
			this.car.setSpeed(-keySpeed);
		} else if (keyEvt.keyCode == 68) {
			this.car.setSpeed(keySpeed);
		}
	},
		
	keyUpHandler: function(keyEvt) {
		this.car.setSpeed(0);
	}
});