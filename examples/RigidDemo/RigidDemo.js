/**
 * Copyright (c) 2012 http://colorhook.com
 * @author: <a href="colorhook@gmail.com">colorhook</a>
 */

/**
 * Provides requestAnimationFrame in a cross browser way.
 * @see https://gist.github.com/838785
 */
if ( !window.requestAnimationFrame ) {
	window.requestAnimationFrame = ( function() {
		return window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		window.oRequestAnimationFrame ||
		window.msRequestAnimationFrame ||
		function(callback,  element ) {
			window.setTimeout( callback, 1000/60);
		};
	} )();
}

define(function(require, exports, module){
    var canvas = document.getElementById("myCanvas");
    var stage = new Stage(canvas);

    var JPE = require("JPE/JPE");
    var Vector = require("JPE/Vector");
    var VectorForce = require("JPE/VectorForce");
    var Engine = require("JPE/Engine");
    var RectangleParticle = require("JPE/RectangleParticle");
    var RigidRectangle = require("JPE/RigidRectangle");
    var RigidCircle = require("JPE/RigidCircle");
    var Group = require("JPE/Group");
    var EaselRenderer = require("JPE/EaselRenderer");
    

    var RigidDemo = JPE.newClass(function(){
        this.init();
    },
    null,
    {
        init: function(){
            Engine.init(1/4);
            Engine.renderer = new EaselRenderer(stage);

            Engine.addForce(new VectorForce(false, 0, 0.5));


            var group = new Group();
            
            var wallRight = new RigidRectangle(800, 240, 100, 480, 0, true);
            var wallLeft = new RigidRectangle(0, 240, 100, 480, 0, true);
            var ground = new RigidRectangle(320, 480, 900, 100, 0, true);
            var surfaces = new Group();
            surfaces.addParticle(wallRight);
            surfaces.addParticle(wallLeft);
            surfaces.addParticle(ground);
            surfaces.addParticle(new RigidRectangle(520, 200, 280, 5, -0.3, true));
            surfaces.addParticle(new RigidRectangle(320, 300, 280, 5, 0.3, true));
            Engine.addGroup(surfaces);
            
            var balls = new Group();
            Engine.addGroup(balls);

            var randomX = 400;
            balls.addParticle(new RigidCircle(randomX, 30, 20));
            balls.addParticle(new RigidCircle(randomX+150, 0, 20));
            balls.addParticle(new RigidCircle(randomX-100, 30, 20));


            balls.addParticle(new RigidRectangle(randomX, 30, 40, 20,0.1,false,-1,0.3,0.2,0));
            balls.addParticle(new RigidRectangle(randomX, 90, 40, 20,0.2,false,-1,0.3,0.2,0));
            balls.addParticle(new RigidRectangle(randomX, 150, 40, 20,0.3,false,-1,0.3,0.2,0));

            balls.addCollidableList([surfaces]);
            balls.collideInternal = true;
            
            key("up", function(){
                if(Math.random()<0.5){
					balls.addParticle(new RigidRectangle(Math.random()*550+100, 20, Math.random()*20+20,Math.random()*20+20,Math.random()*1.6));
				}else{
					balls.addParticle(new RigidCircle(Math.random()*550+100, 20, Math.random()*10+10));
				}
            });

        },
        
        update: function(){
            var self = this;
            requestAnimationFrame(function(){
                Engine.step();
                Engine.paint();
                stage.update();
                self.update();
            });
        }
    });
    
    //entry point
    exports.init = function(){
        var demo = new RigidDemo();
        demo.update();
    }
});











