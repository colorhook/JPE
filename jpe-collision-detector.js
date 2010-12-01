YUI.add("jpe-collision-detector", function(Y){

	var CollisionResolver = Y.CollisionResolver,
		RectangleParticle = Y.RectangleParticle,
		CircleParticle = Y.CircleParticle,
		Vector = Y.Verctor,
		POSITIVE_INFINITY = Number.INFINITY;

 	var CollisionDetector = {

		/**
		 * Tests the collision between two objects. If there is a collision
		 * it is passsed off to the CollisionResolver class.
		 * @param objA {AbstractParticle}
		 * @param objB {AbstractParticle}
		 */
		test: function(objA, objB){
			if(objA.fixed && objB.fixed) return;

			if(objA.multisample == 0 && objB.multisample == 0){
				this.normVsNorm(objA, objB);
			}else if(objA.multisample > 0 && objB.multisample ==0 ){
				this.sampVsNorm(objA, objB);
			}else if(objB.multisample > 0 && objA.mulitsample ==0){
				this.sampVsNorm)objB, objA);
			}else if(objA.multisample == objB.mulitsmaple){
				this.sampVsSamp(objA, objB);
			}else{
				this.normVsNorm(objA, objB);
			}
		},
		/**
		 * default test for two non-multisampled particles
		 */
		normVsNorm: function(objA, objB){
			objA.samp.copy(objA.curr);
			objB.samp.copy(objB.curr);
			this.testTypes(objA, objB);
		},

		/**
		 * Tests two particles where one is multisampled and the
		 * other is not. Let objectA be the mulitsampled particle.
		 */
		sampVsNorm: function(objA, objB){
			var s = 1 / (objA.multiSample + 1),
				t = s,
				i,
				objAsamples = objA.multisample;

			objB.samp.copy(objB.curr);

			for(i = 0; i <= objAsamples; i++){
				objA.samp.setTo(objA.prev.x + t * (objA.curr.x - objA.prev.x),
						objA.prev.y + t * (objA.curr.y - objA.prev.y));
				if(this.testTypes(objA, objB)) return;
				t += s;
			}
		
		},
		/**
		 * Tests two particles where both are of equal multisample rate
		 */
		sampVsSample: function(objA, objB){
			var s = 1 / (objA.multiSample + 1),
				t = s,
				i,
				objAsamples = objA.multisample;

			objB.samp.copy(objB.curr);

			for(i = 0; i <= objAsamples; i++){
				objA.samp.setTo(objA.prev.x + t * (objA.curr.x - objA.prev.x),
						objA.prev.y + t * (objA.curr.y - objA.prev.y));
				objB.samp.setTo(objB.prev.x + t * (objB.curr.x - objB.prev.x),
						objB.prev.y + t * (objA.curr.y - objB.prev.y));
				if(this.testTypes(objA, objB)) return;
				t += s;
			}
		},
		testTypes: function(objA, objB){
			var	cA = objA.constructor,
				cB = objB.constructor;

			if(cA == RectangleParticle && cB == RectangleParticle){
				return this.testOBBvsOBB(objA, objB);
			}else if(cA == CircleParticle && cB == CircleParticle){
				return this.testCirclevsCircle(objA, objB);
			}else if(cA == RectangleParticle && cB == CircleParticle){
				return this.testOBBvsCircle(objA, objB);
			}else if(cA == CircleParticle && cB == RectangleParticle){
				return this.testOBBvsCircle(objB, objA);
			}

			return false;
		},
		/**
		 * Tests the collision between two RectangleParticles (aka OBBs).
		 * If there is a collision it determines its axis and depth, and
		 * then passes it off to the CollisionResolver for handling.
		 *
		 * @param ra {RectangleParticle}
		 * @param rb {RectangleParticle}
		 */
		testOBBvsOBB: function(ra, rb){
			var collisionNormal,
				collisionDepth = POSITIVE_INFINITY;

			for(var i = 0; i < 2; i++){
				var axisA = ra.axes[i],
					depthA = this.testIntervals(ra.getProjection(axisA),
							rb.getProjection(axisA);
				if(depthA == 0) return false;

				var axisB = rb.axes[i],
					depthB = this.testIntervals(ra.getProjection(axisB),
							rb.getProjection(axisB);
				if(depthB == 0) return false;

				var absA = Math.abs(depthA),
					absB = Math.abs(depthB);

				if(absA < Math.abs(collisionDepth) || absB < Math.abs(collisionDepth)){
					var altb = absA < absB;
					collisionNormal = altb ? axisA : axisB;
			    	collisionDepth = altb ? depthA : depthB;
					
				}

				CollisionResolver.resolveParticleParticle(ra, rb, collisionNormal, collisionDepth);
				return true;
				
			}
		},
		/**
		 * Tests the collision between a RectangleParticle (aka an OBB) and a
		 * CircleParticle. If thereis a collision it determines its axis and 
		 * depth, and then passws it off to the CollisionResolver.
		 * @param ra {RectangleParticle}
		 * @param ca {CircleParticle}
		 */
		testOBBvsCircle: function(ra, ca){
			var collisionNormal,
				collisionDepth = POSITIVE_INFINITY,
				depths = new Array(2),
				i = 0,
				boxAxis,
				depth,
				r;

			for(; i < 2; i++){
				boxAxis = ra.axes[i];
				depth = this.testIntervals(ra.getProgection(boxAxis),
							ca.getProjection(boxAxis));
				if(depth == 0)  return false;

				if(Math.abs(depth) < Math.abs(collisionDepth)){
					collisionNormal = boxAxis;
					collisionDepth = depth;
				}
				depths[i] = depth;
			}

			r = ca.radius;

			if(Math.abs(depths[0]) < r && Math.abs(depths[1]) < r){
				var vertex = this.closestVertexOnOBB(ca.samp, ra);
				collisionNormal = vertext.minus(ca.samp);
				var mag = collisionNormal.magnitude();
				collisionDepth = r - mag;
				if(collisionDepth > 0){
					collisionNormal.divEquals(mag);
				}else{
					return false;
				}
			}
			CollisionResolver.resolveParticleParticle(ra, ca, collisionNormal, collisionDepth);
			return true;
		},
		/**
		 * Tests the colision between two CircleParticles.
		 * If there is a collision it determines its axis and depth, 
		 * and then passes it off to the CollisionResolver for handing.
		 */
		testCirclevsCircle:function(ca, cb){
			var depthX = this.testIntervals(ca.getIntervalX(), cb.getIntervalX());
			if(depthX == 0) return false;

			var depthY = this.testIntervals(ca.getIntervalY(), cb.getIntervalY());
			if(depthY == 0) return false;

			var collisionNormal = ca.samp.minus(cb.samp),
				mag = collisionNormal.magnitude(),
				collisionDepth = ca.radius + cb.radius - mag;

			if(collisionDepth > 0){
				collisionNormal.divEquals(mag);
				CollisionResolver.resolveParticle(ca, cb, collisionNormal, collisionDepth);
				return true;
			}
			return false;
		},
		/**
		 * Return 0 if the intervals do not overlap.
		 * Return smallest depth if they do.
		 * @param intervalA {Interval}
		 * @param intervalB {Interval}
		 */
		testIntervals:function(intervalA, intervalB){
			if(intervalA.max < intervalB.min) return 0;
			if(intervalB.max < intervalA.min) return 0;

			var lenA = intervalB.max - intervalA.min,
				lenB = intervalB.min - intervalA.max;

			return (Math.abs(lenA) < Math.abs(lenB)) ? lenA : lenB;
		},
		/**
		 * Returns the location of the closest vertex on r to point p
		 * @param p {Vector}
		 * @param r {RectangleParticle}
		 */
		closestVertexOnOBB: function(p, r){
			var d = p.minus(r.samp),
				q = new Vector(r.samp.x, r.samp.y),
				i = 0;
			for(;  i< 2; i++){
				dist = d.dot(r.axes[i]);
				if(dist >= 0){
					dist = r.extents[i];
				}else if(dist < 0){
					dist = -r.extents[i];
				}
				q.plusEquals(r.axes[i].mult(dist));
			}
			return q;
		}

	}

	Y.ColisionDetector = CollisionDetector;

}, '1.0.0', {requires:['jpe-collision-resolver', 'jpe-rectangle-particle', 'jpe-circle-particle','jpe-interval', 'jpe-vector']});
