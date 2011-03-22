JPE.declare('RimParticle', {
		
		/**
		 * The RimParticle is really just a second component of the wheel model.
		 * The rim particle is simulated in a coordsystem relative to the wheel's 
		 * center, not in worldspace.
		 * 
		 * Origins of this code are from Raigan Burns, Metanet Software
		 */
		constructor:  function (r, mt) {

			this.sp = 0;
			this.av = 0;
			this.wr = r;
			this.maxTorque = mt;
			this.curr = new JPE.Vector(r, 0);
			this.prev = new JPE.Vector(0, 0);	
		},
	

		getSpeed:function () {
			return this.sp;
		},
		
		setSpeed: function (s) {
			this.sp = s;
		},
		
		getAngularVelocity: function () {
			return this.av;
		},
		
		setAngularVelocity: function (s) {
			this.av = s;
		},
		
		/**
		 * Origins of this code are from Raigan Burns, Metanet Software
		 */
		update: function(dt) {
			
			//clamp torques to valid range
			this.sp = Math.max(-this.maxTorque, Math.min(this.maxTorque, this.sp + this.av));
	
			//apply torque
			//this is the tangent vector at the rim particle
			var dx = -this.curr.y;
			var dy =  this.curr.x;
	
			//normalize so we can scale by the rotational speed
			var len = Math.sqrt(dx * dx + dy * dy);
			dx /= len;
			dy /= len;
	
			this.curr.x += this.sp * dx;
			this.curr.y += this.sp * dy;		
	
			var ox = this.prev.x;
			var oy = this.prev.y;
			var px = this.prev.x = this.curr.x;		
			var py = this.prev.y = this.curr.y;		
			
			this.curr.x += JPE.damping * (px - ox);
			this.curr.y += JPE.damping * (py - oy);	
	
			// hold the rim particle in place
			var clen = Math.sqrt(this.curr.x * this.curr.x + this.curr.y * this.curr.y);
			var diff = (clen - this.wr) / clen;
	
			this.curr.x -= this.curr.x * diff;
			this.curr.y -= this.curr.y * diff;
		}

});