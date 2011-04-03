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
			this._extents = [width/2, height/2];
			this._axes = [new JPE.Vector(0,0), new JPE.Vector(0,0)];
			
			
			this.setRadian(rotation);
			JPE.RectangleParticle.superclass.prototype.constructor.call(this, x, y, fixed, mass, elasticity, friction);
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
			
		paint: function () {
			var sprite = this.getSprite(),
				x = this.curr.x,
				y = this.curr.y,
				w = this.getExtents()[0] * 2,
				h = this.getExtents()[1] * 2,
				r = this.getAngle();
			
			sprite.rotation = r;
			sprite.x = x ;
			sprite.y = y;
		},
		
		
		drawShape: function(){
			var g = this.shape.graphics,
				w = this.getExtents()[0] * 2,
				h = this.getExtents()[1] * 2;
			this.shape.x = - w/2;
			this.shape.y =  - h/2;
			g.clear();
			if(this.lineThickness){
				g.setStrokeStyle(this.lineThickness)
				g.beginStroke(Graphics.getRGB(this.lineColor, this.lineAlpha));
			}
			g.beginFill(Graphics.getRGB(this.fillColor, this.fillAlpha));
			g.drawRect(0, 0, w, h);
			g.endFill();
			
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