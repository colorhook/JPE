JPE.declare('RectangleParticle',  {

		superclass: JPE.AbstractParticle,

		/**
		 * @param x The initial x position.
		 * @param y The initial y position.
		 * @param width The width of this particle.
		 * @param height The height of this particle.
		 * @param rotation The rotation of this particle in radians.
		 * @param fixed Determines if the particle is fixed or not. Fixed particles
		 * are not affected by forces or collisions and are good to use as surfaces.
		 * Non-fixed particles move freely in response to collision and forces.
		 * @param mass The mass of the particle
		 * @param elasticity The elasticity of the particle. Higher values mean more elasticity.
		 * @param friction The surface friction of the particle. 
		 * <p>
		 * Note that RectangleParticles can be fixed but still have their rotation property 
		 * changed.
		 * </p>
		 */
		constructor: function(x, y, width, height, rotation, fixed, mass, elasticity, friction) {
			rotation = rotation || 0;
			mass = mass || 1;
			elasticity = elasticity || 0.3;
			friction = friction || 0;
			JPE.RectangleParticle.superclass.prototype.constructor.call(this, x, y, fixed, mass, elasticity, friction);
			this._extents = [width/2, height/2];
			this._axes = [new JPE.Vector(0,0), new JPE.Vector(0,0)];
			this.setRadian(rotation);
		},
	
		getRadian: function () {
			return this._radian;
		},
		
		
		/**
		 * @private
		 */		
		setRadian: function (t) {
			this._radian = t;
			this.setAxes(t);
		},
			
		
		/**
		 * The rotation of the RectangleParticle in degrees. 
		 */
		getAngle: function () {
			return this.getRadian() * JPE.MathUtil.ONE_EIGHTY_OVER_PI;
		},


		/**
		 * @private
		 */		
		setAngle: function (a) {
			this.setRadian (a * JPE.MathUtil.PI_OVER_ONE_EIGHTY);
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
			

			var w = this.getExtents()[0] * 2,
				  h = this.getExtents()[1] * 2,
				  sprite = this.getSprite();

				//sprite.setRotation(this.getAngle());
				//sprite.lineStyle(this.lineThickness, this.lineColor, this.lineAlpha);
				//sprite.beginFill(this.fillColor, this.fillAlpha);
				JPE.Sprite.drawRect(sprite, -w/2, -h/2, w, h);

		},
		
		
		setWidth: function (w) {
			this._extents[0] = w/2;
		},

		
		getWidth: function () {
			return this._extents[0] * 2;
		},


		setHeight: function (h) {
			this._extents[1] = h / 2;
		},


		getHeight: function () {
			return this._extents[1] * 2;
		},

		/**
		 * @private
		 */	
		getExtents: function () {
			return this._extents;
		},
		
		
		/**
		 * @private
		 */	
		getProjection: function (axis) {
			var axes = this.getAxes(),
				 extents = this.getExtents(),
			     radius = extents[0] * Math.abs(axis.dot(axes[0])) + extents[1] * Math.abs(axis.dot(axes[1]));
			
			var c = this.samp.dot(axis);
			this.interval.min = c - radius;
			this.interval.max = c + radius;
			return this.interval;
		},

		/**
		 * @private
		 */	
		getAxes: function () {
			return this._axes;
		},
		/**
		 * 
		 */					
		setAxes: function(t) {
			var s = Math.sin(t),
				 c = Math.cos(t),
				 axes = this.getAxes();
			
			axes[0].x = c;
			axes[0].y = s;
			axes[1].x = -s;
			axes[1].y = c;
		}

});