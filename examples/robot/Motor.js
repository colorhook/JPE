import {
	Engine,
	Composite,
	WheelParticle,
	CircleParticle,
	SpringConstraint
} from '../../src/'

const ONE_THIRD = (Math.PI * 2) / 3;
const Graphics = createjs.Graphics;

export default class Motor extends Composite {
		constructor (attach, radius, color){
			super()
		
			var wheel = this.wheel = new WheelParticle(attach.px, attach.py - .01, radius);
			wheel.setStyle(0,0xFFF00,0, 0xFFF00,0.5);
			wheel.visible = false;
			var axle = new SpringConstraint(wheel, attach);

			var _rimA = this._rimA = new CircleParticle(0,0,20, true);
			var _rimB = this._rimB = new CircleParticle(0,0,2, true);
			var _rimC = this._rimC = new CircleParticle(0,0,2, true);
			
			wheel.collidable = false;
			_rimA.collidable = false;
			_rimB.collidable =false;
			_rimC.collidable = false;
			
			this.addParticle(_rimA);
			this.addParticle(_rimB);
			this.addParticle(_rimC);
			this.addParticle(wheel);
			this.addConstraint(axle);
			
			this.color = color;	
			this.radius = radius;
			
			// run it once to make sure the rim particles are in the right place
			this.run();
		
		}


		setPower (p) {
			this.wheel.speed = p;
		}
	
		getPower () {
			return this.wheel.speed;
		}
		
		getRimA () {
			return this._rimA;
		}
	
	
		getRimB () {
			return this._rimB;
		}
	
	
		getRimC () {
			return this._rimC;
		}

		run(){
			var theta = this.wheel.radian,
				radius = this.radius,
				wheel = this.wheel,
				wx = wheel.px,
				wy = wheel.py,
				_rimA = this._rimA,
				_rimB = this._rimB,
				_rimC = this._rimC;

			_rimA.px = ( -radius * Math.sin(theta) + wx);
			_rimA.py = (  radius * Math.cos(theta) + wy); 
			
			theta += ONE_THIRD;
			_rimB.px = ( -radius * Math.sin(theta) + wx);
			_rimB.py = (  radius * Math.cos(theta) + wy); 	
			
			theta += ONE_THIRD;
			_rimC.px = ( -radius * Math.sin(theta) + wx);
			_rimC.py = ( radius * Math.cos(theta) + wy);
		}

		init (){
			var sprite = new createjs.Container(),
				shape = new createjs.Shape(),
				sg = shape.graphics,
				radius = this.radius,
				color = this.color;
			
			sprite.addChild(shape);
			Engine.renderer.stage.addChild(sprite);
			this.sprite = sprite;
			this.shape = shape;
			
			sg.beginStroke(Graphics.getRGB(0xff000, 1));
			sg.beginFill(Graphics.getRGB(color, 1));
			
			sg.drawCircle(0, 0, 3);
			sg.endFill();
			
			var theta = 0;
			var cx = -radius * Math.sin(theta);
			var cy =  radius * Math.cos(theta);
			
			sg.beginStroke(Graphics.getRGB(0xff000, 1));
			sg.moveTo(0,0);
			sg.lineTo(cx,cy);
			sg.drawCircle(cx, cy, 2);
		
			theta += ONE_THIRD;
			cx = -radius * Math.sin(theta);
			cy =  radius * Math.cos(theta); 
			sg.moveTo(0,0);
			sg.lineTo(cx,cy);
			sg.drawCircle(cx, cy, 2);
			
			theta += ONE_THIRD;
			cx = -radius * Math.sin(theta);
			cy =  radius * Math.cos(theta); 
			sg.moveTo(0,0);
			sg.lineTo(cx,cy);
			sg.drawCircle(cx, cy, 2);	
			sg.endFill();
		}
	
		paint () {
			var sprite = this.sprite,
				wheel = this.wheel;

			sprite.x = wheel.px;
			sprite.y = wheel.py;
			sprite.rotation = wheel.angle;
		}

}