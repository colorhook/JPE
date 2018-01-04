import {
	Vector,
	VectorForce,
	Engine,
	CircleParticle,
	WheelParticle,
	SpringConstraint,
} from '../../src/'

import EaselRenderer from '../../src/EaselRenderer'

import Surfaces from './Surfaces'
import Bridge from './Bridge'
import Capsule from './Capsule'
import Rotator from './Rotator'
import SwingDoor from './SwingDoor'
import Car from './Car'

var canvas = document.getElementById("myCanvas");
var stage =  new createjs.Stage(canvas);

var colA = 0x334433;
var colB = 0x3366aa;
var colC = 0xaabbbb;
var colD = 0x6699aa;
var colE = 0x778877;

Engine.init(1/4);
	
//渲染引擎
Engine.renderer = new EaselRenderer(stage);

//重力
Engine.addForce(new VectorForce(false, 0, 3));

//场景的地形
var surfaces = new Surfaces(colA, colB, colC, colD, colE);
Engine.addGroup(surfaces);

	//桥状物体
var bridge = new Bridge(colB, colC, colD);
Engine.addGroup(bridge);

	//胶囊状物体
var capsule = new Capsule(colC);
Engine.addGroup(capsule);

	//旋转物体
var rotator = new Rotator(colB, colE);
Engine.addGroup(rotator);
	
	//弹性门
var swingDoor = new SwingDoor(colC);
Engine.addGroup(swingDoor);

	//小车
var car = new Car(colC, colE);
Engine.addGroup(car);

//设置触碰规则
car.addCollidableList([surfaces, bridge, rotator, swingDoor, capsule]);
capsule.addCollidableList([surfaces, bridge, rotator, swingDoor]);


function run(s){
	Engine.step();
	Engine.paint();
	stage.update();
	rotator.rotateByRadian(.02);
}

function addEvent(object, event, method) {
	if (object.addEventListener)
		object.addEventListener(event, method, false);
	else if(object.attachEvent)
		object.attachEvent('on'+event, function(){ method(window.event) });
}

function keyDownHandler(keyEvt) {
	var keySpeed = 0.2;
	if (keyEvt.keyCode == 65) {
		car.speed = -keySpeed;
	} else if (keyEvt.keyCode == 68) {
		car.speed  = keySpeed;
	}
}

function keyUpHandler(keyEvt) {
	car.speed  = 0;
}

//循环
setInterval(function(){
	run();
}, 10);
	
//事件绑定
addEvent(document, 'keydown', function(event) { 
		keyDownHandler(event);
})
addEvent(document, 'keyup', function(event){
		keyUpHandler(event);
});