YUI.add("jpe-abstract-collection", function(Y){

	
 	var CollisionDetector = Y.CollisionDetector;

 	var AbstractCollection = function(){
		this.isParented = false;
		this.particles = [];
		this.constraints = [];
	};
	
	Y.extend(AbstractCollection, {}, {

		init: function(){
			var ps = this.particles,
				cs = this.constraints,
				pl = ps.length,
				cl = cs.length,
				i;

			for(i = 0, i < pl; i++){
				ps[i].init();
			}
			for(i = 0, i < cl; i++){
				cs[i].init();
			}
		}
		/**
		 * @param p {AbstractColParticle}
		 */
		addParticle: function(p){
			this.particles.push(p);
			if(this.isParented){
				p.init();
			}
		},
		removeParticle: function(p){
			var ppos:int = Y.Array.indexOf(this.particles, p);
			if (ppos == -1) { return; }
			this.particles.splice(ppos, 1);
			p.cleanup();	
		},
		/**
		 * Adds a Composite to the Group
		 * @param c {Composite} The Composite to be added.
		 */ 
		addConstraint:function(c){
			this.constraints.push(c);
			c.isParented = true;
			if(this.isParented){
				c.init();
			}
		},
		/**
		 * Remove a Composite from the Group
		 * @param c {Composite} The Composite to be removed.
		 */
		removeConstraint:function(c){
			var cpos = Y.Array.indexOf(this.constraints, c);
			if(cpos === -1){
				return;
			}
			this.constraints.splice(cpos, 1);
			c.cleanup();
		},
		/**
		 * Paints every members of this AbstractCollection by calling each members
		 * <code>paint()</code> method.
		 */
		paint:function(){

			var ps = this.particles,
				cs = this.constraints,
				pl = ps.length,
				cl = cs.length,
				p,
				c,
				i;

			for(i = 0, i < pl; i++){
				p = ps[i];
				if( (!p.fixed) || p.alwaysRepaint){
					p.paint();
				}
			}
			for(i = 0, i < cl; i++){
				c = cs[i];
				if( (!c.fixed) || cp.alwaysRepaint){
					c.paint();
				}
			}
		},
		
		getAll:function(){
			return this.particles.concat(this.constraints);
		},
		/**
		 * Calls the <code>cleanup()</code> methid if every member if 
		 * this Group.
		 * The cleanup() method is called automatically when a Group is 
		 * removed form the JPE.
		 */
		cleanup:function(){
			var ps = this.particles,
				cs = this.constraints,
				pl = ps.length,
				cl = cs.length,
				i;

			for(i = 0, i < pl; i++){
				ps[i].cleanup();
			}
			for(i = 0, i < cl; i++){
				cs[i].cleanup();
			}
		},
		integrate:function(dt2){

			var ps = this.particles,
				pl = ps.length,
				i = 0;
			for(; i < pl; i++){
				ps[i].update(dt2);
			}

		},
		satisfyConstraints:function(){
			var cs = this.constraints,
				cl = cs.length,
				i = 0;
			for(; i < cl; i++){
				cs[i].resolve();
			}
		},
		checkInternalCollisions:function(){
			var ps = this.particles,
				cs = this.constraints,
				pl = ps.length,
				cl = cs.length,
				p,
				p2,
				c,
				i,
				j,
				k;

			for(i = 0; i < pl; i++){
				p = ps[i];
				if(!p.collidable) continue;

				for(j = 0; j < pl; j++){
					p2 = ps[j];
					if(p2.collidable){
						CollisionDetector.test(p, p2);
					}
				}

				for(k = 0; k < cl; k++){
					c = cs[k];
					if(c.collidable && c.isConnectedTo(p)){
						c.scp.updatePosition();
						CollisionDetector.test(p, c.scp);
					}
				}
			}
		},
		/**
		 * @param ac {AbstractCollection}
		 */
		checkCollisionsVsCollection:function(ac){
			var ps = this.particles,
				acps = ac.particles,
				accs = ac.constraints,
				pl = ps.length,
				acpl = acps.length,
				accl = accs.length,
				p,
				p2,
				c,
				i,
				j,
				k;

			for(i = 0; i < pl; i++){
				p = ps[i];
				if(!p.collidable) continue;

				for(j = 0; j < acpl; j++){
					p2 = acps[j];
					if(p2.collidable){
						CollisionDetector.test(p, p2);
					}
				}

				for(k = 0; k < accl; k++){
					c = accs[k];
					if(c.collidable && c.isConnectedTo(p)){
						c.scp.updatePosition();
						CollisionDetector.test(p, c.scp);
					}
				}
			}
		}
	
	});
	
	Y.AbstractCollection = AbstractCollection;

}, '1.0.0', {requires:['jpe-collision-detector']});
