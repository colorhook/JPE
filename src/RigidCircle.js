define(function(require, exports, module){
	
	var JPE = require("./JPE");
	var RigidItem = require("./RigidItem");


	var RigidCircle =  function (x, y, radius, isFixed, mass, elasticity, elasticity, friction, radian, angularVelocity) {
		if(mass == undefined || mass == -1){
			mass=Math.PI*radius*radius;
		}
		this._radius = radius;
		RigidItem.prototype.constructor.call(this, x, y, radius,
			isFixed, mass,mass*radius*radius/2,elasticity,friction,radian,angularVelocity);
	};

	JPE.extend(RigidCircle, RigidItem, {
		

		getRadius: function(){
			return this._radius;
		},
		getVertices: function(axis){
			var vertices = [];
			for(var i=0; i<axis.length; i++){
				vertices.push(axis[i].mult(this._radius).plusEquals(this.samp));
			}
			return vertices;
		},
		getProjection: function(axis) {
			var c = this.samp.dot(axis);
			this.interval.min = c - this._radius;
			this.interval.max = c + this._radius;
			
			return this.interval;
		},
		getIntervalX: function(){
			this.interval.min = this.samp.x - this._radius;
			this.interval.max = this.samp.x + this._radius;
			return this.interval;
		},
		getIntervalY: function(){
			this.interval.min = this.samp.y - this._radius;
			this.interval.max = this.samp.y + this._radius;
			return this.interval;
		}
	});

	module.exports = RigidCircle;

});