/**
 * Copyright (c) 2013 http://colorhook.com
 * @author: <a href="colorhook@gmail.com">colorhook</a>
 */
define("CarDemo", function(require, exports, module){
  
  var JPE = require("JPE/JPE");
  var Vector = require("JPE/Vector");
  var VectorForce = require("JPE/VectorForce");
  var Engine = require("JPE/Engine");
  var EaselRenderer = require("JPE/EaselRenderer");
  var CircleParticle = require("JPE/CircleParticle");
  var WheelParticle = require("JPE/WheelParticle");
  var SpringConstraint = require("JPE/SpringConstraint");

  var Surfaces = require("./Surfaces");
  var Bridge = require("./Bridge");
  var Capsule = require("./Capsule");
  var Rotator = require("./Rotator");
  var SwingDoor = require("./SwingDoor");
  var Car = require("./Car");

  module.exports = {
	
  	car: null,
  	rotator: null,
    
    /**
    * @method init
    * 初始化程序, 建立canvas, 初始化engine
    */
  	init: function(){
  		var canvas = document.getElementById("myCanvas");
  		var stage = this.stage = new Stage(canvas);

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
  		rotator = new Rotator(colB, colE);
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

  		this.car = car;
  		this.rotator = rotator;
  		
  		
  		//循环
  		var owner = this;
  		setInterval(function(){
  			owner.run();
  		}, 10);
        
        //事件绑定
        this.addEvent(document, 'keydown', function(event) { 
            owner.keyDownHandler(event);
        }); 
        this.addEvent(document, 'keyup', function(event){
            owner.keyUpHandler(event);
        });
  	},
  	
   /**
    * @method run
    * step by step运行程序
    */
  	run: function(s){
  		Engine.step();
  		Engine.paint();
  		this.stage.update();
  		this.rotator.rotateByRadian(.02);
  	},
    
    /**
     * @method addEvent
     * 跨浏览器的事件绑定
     */
    addEvent: function addEvent(object, event, method) {
      if (object.addEventListener)
        object.addEventListener(event, method, false);
      else if(object.attachEvent)
        object.attachEvent('on'+event, function(){ method(window.event) });
    },
    /**
     * @method keyDownHandler
     * 键盘按键按下的事件处理函数
     */
  	keyDownHandler: function(keyEvt) {
  		var keySpeed = 0.2;
  		if (keyEvt.keyCode == 65) {
  			this.car.setSpeed(-keySpeed);
  		} else if (keyEvt.keyCode == 68) {
  			this.car.setSpeed(keySpeed);
  		}
  	},
    /**
     * @method keyUpHandler
     * 键盘按键弹起的事件处理函数
     */
  	keyUpHandler: function(keyEvt) {
  		this.car.setSpeed(0);
  	}
  }
  
});