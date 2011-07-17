JPE.declare('CircleParticle',  {
		

		superclass: JPE.AbstractParticle,

		/**
		 * @param x The initial x position of this particle.
		 * @param y The initial y position of this particle.
		 * @param radius The radius of this particle.
		 * @param fixed Determines if the particle is fixed or not. Fixed particles
		 * are not affected by forces or collisions and are good to use as surfaces.
		 * Non-fixed particles move freely in response to collision and forces.
		 * @param mass The mass of the particle.
		 * @param elasticity The elasticity of the particle. Higher values mean more elasticity or 'bounciness'.
		 * @param friction The surface friction of the particle.
		 */
		constructor: function(x, y, radius, fixed, mass, elasticity, friction) {
			mass = mass || 1;
			elasticity = elasticity || 0.3;
			friction = friction || 0;
			this._radius = radius;
			JPE.CircleParticle.superclass.prototype.constructor.call(this, x, y, fixed, mass, elasticity, friction);
		},
		
		getRadius: function () {
			return this._radius;
		},
		
		/**
		 * @private
		 */		
		setRadius: function (t) {
			this._radius = t;
		},
		
		/**
		 * @private
		 */	
		getProjection: function (axis) {
			
			var c = this.samp.dot(axis);
			
			this.interval.min = c - this._radius;
			this.interval.max = c + this._radius;
			return this.interval;
		},
		/**
		 * @private
		 */
		getIntervalX: function () {
			this.interval.min = this.curr.x - this._radius;
			this.interval.max = this.curr.x + this._radius;
			return this.interval;
		},

		getIntervalY: function () {
			this.interval.min = this.curr.y - this._radius;
			this.interval.max = this.curr.y + this._radius;
			return this.interval;
		}

});