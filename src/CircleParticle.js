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
			JPE.CircleParticle.superclass.prototype.constructor.call(this, x, y, fixed, mass, elasticity, friction);
			this._radius = radius;
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
		 * Sets up the visual representation of this RectangleParticle. This method is called 
		 * automatically when an instance of this RectangleParticle's parent Group is added to 
		 * the APEngine, when  this RectangleParticle's Composite is added to a Group, or the 
		 * RectangleParticle is added to a Composite or Group.
		 */				
		initSelf: function () {
			this.cleanup();
			this.paint();
		},
		
		/**
		 * The default painting method for this particle. This method is called automatically
		 * by the <code>APEngine.paint()</code> method. If you want to define your own custom painting
		 * method, then create a subclass of this class and override <code>paint()</code>.
		 */	
		paint: function () {
			var sprite = this.getSprite();

			sprite.setX(this.curr.x);
			sprite.setY(this.curr.y);

			sprite.lineStyle(this.lineThickness, this.lineColor, this.lineAlpha);
			sprite.beginFill(this.fillColor, this.fillAlpha);
			sprite.drawCircle(0, 0, this.getRadius());
			sprite.endFill();
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