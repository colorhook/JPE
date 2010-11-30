/*!
 * @revision:
 */
/*
 * @author: <a href="zhengxie.lj@taobao.com">zhengxie</a>
 * @version:1-0-0
 */
YUI.add('jpe-spring-constraint-particle', function(Y) {
	
	var Vector = Y.Vector,
		 SpringConstraint = Y.SpringConstraint,
		 RectangleParticle = Y.RectangleParticle,

		/**
		 * @param p1 The first particle this constraint is connected to.
		 * @param p2 The second particle this constraint is connected to.
		 * @param stiffness The strength of the spring. Valid values are between 0 and 1. Lower values
		 * result in softer springs. Higher values result in stiffer, stronger springs.
		 * @param collidable Determines if the constraint will be checked for collision
		 * @param rectHeight If the constraint is collidable, the height of the collidable area
		 * can be set in pixels. The height is perpendicular to the two attached particles.
		 * @param rectScale If the constraint is collidable, the scale of the collidable area
		 * can be set in value from 0 to 1. The scale is percentage of the distance between 
		 * the the two attached particles.
		 * @param scaleToLength If the constraint is collidable and this value is true, the 
		 * collidable area will scale based on changes in the distance of the two particles. 
		 */
		SpringConstraintParticle = function(p1, p2, p, rectHeight, rectScale, scaleToLength) {
			
			SpringConstraintParticle.superclass.constructor.apply(this, 0,0,0,0,0,false);
			
			this.p1 = p1;
			this.p2 = p2;
			
			lambda = new Vector(0,0);
			avgVelocity = new Vector(0,0);
			
			parent = p;
			this.rectScale = rectScale;
			this.rectHeight = rectHeight;
			this.scaleToLength = scaleToLength;
			
			fixedEndLimit = 0;
			rca = new Vector();
			rcb = new Vector();
		};

	Y.extend(SpringConstraintParticle, RectangleParticle, {
		
		
		internal function set rectScale(s:Number):void {
			_rectScale = s;
		}
		
		
		/**
		 * @private
		 */		
		internal function get rectScale():Number {
			return _rectScale;
		}
		
		
		internal function set rectHeight(r:Number):void {
			_rectHeight = r;
		}
		
		
		/**
		 * @private
		 */	
		internal function get rectHeight():Number {
			return _rectHeight;
		}

		
		/**
		 * For cases when the SpringConstraint is both collidable and only one of the
		 * two end particles are fixed, this value will dispose of collisions near the
		 * fixed particle, to correct for situations where the collision could never be
		 * resolved.
		 */	
		internal function set fixedEndLimit(f:Number):void {
			_fixedEndLimit = f;
		}
		
		
		/**
		 * @private
		 */	
		internal function get fixedEndLimit():Number {
			return _fixedEndLimit;
		}
	
	
		/**
		 * returns the average mass of the two connected particles
		 */
		public override function get mass():Number {
			return (p1.mass + p2.mass) / 2; 
		}
		
		
		/**
		 * returns the average elasticity of the two connected particles
		 */
		public override function get elasticity():Number {
			return (p1.elasticity + p2.elasticity) / 2; 
		}
		
		
		/**
		 * returns the average friction of the two connected particles
		 */
		public override function get friction():Number {
			return (p1.friction + p2.friction) / 2; 
		}
		
		
		/**
		 * returns the average velocity of the two connected particles
		 */
		public override function get velocity():Vector {
			var p1v:Vector =  p1.velocity;
			var p2v:Vector =  p2.velocity;
			
			avgVelocity.setTo(((p1v.x + p2v.x) / 2), ((p1v.y + p2v.y) / 2));
			return avgVelocity;
		}	
		
		
		public override function init():void {
			if (displayObject != null) {
				initDisplay();
			} else {
				var inner:Sprite = new Sprite();
				parent.sprite.addChild(inner);
				inner.name = "inner";
							
				var w:Number = parent.currLength * rectScale;
				var h:Number = rectHeight;
				
				inner.graphics.clear();
				inner.graphics.lineStyle(parent.lineThickness, parent.lineColor, parent.lineAlpha);
				inner.graphics.beginFill(parent.fillColor, parent.fillAlpha);
				inner.graphics.drawRect(-w/2, -h/2, w, h);
				inner.graphics.endFill();
			}
			paint();
		}

		
		public override function paint():void {
			
			var c:Vector = parent.center;
			var s:Sprite = parent.sprite;
			
			if (scaleToLength) {
				s.getChildByName("inner").width = parent.currLength * rectScale;
			} else if (displayObject != null) {
				s.getChildByName("inner").width = parent.restLength * rectScale;
			}
			s.x = c.x; 
			s.y = c.y;
			s.rotation = parent.angle;
		}
		
		
		/**
		 * @private
		 */
		internal override function initDisplay():void {
			displayObject.x = displayObjectOffset.x;
			displayObject.y = displayObjectOffset.y;
			displayObject.rotation = displayObjectRotation;
			
			var inner:Sprite = new Sprite();
			inner.name = "inner";
			
			inner.addChild(displayObject);
			parent.sprite.addChild(inner);
		}	
		
				
	   /**
		 * @private
		 * returns the average inverse mass.
		 */		
		internal override function get invMass():Number {
			if (p1.fixed && p2.fixed) return 0;
			return 1 / ((p1.mass + p2.mass) / 2);  
		}
		
		
		/**
		 * called only on collision
		 */
		internal function updatePosition():void {
			var c:Vector = parent.center;
			curr.setTo(c.x, c.y);
			
			width = (scaleToLength) ? parent.currLength * rectScale : parent.restLength * rectScale;
			height = rectHeight;
			radian = parent.radian;
		}
		
			
		internal override function resolveCollision(
				mtd:Vector, vel:Vector, n:Vector, d:Number, o:int, p:AbstractParticle):void {
				
			var t:Number = getContactPointParam(p);
			var c1:Number = (1 - t);
			var c2:Number = t;
			
			// if one is fixed then move the other particle the entire way out of collision.
			// also, dispose of collisions at the sides of the scp. The higher the fixedEndLimit
			// value, the more of the scp not be effected by collision. 
			if (p1.fixed) {
				if (c2 <= fixedEndLimit) return;
				lambda.setTo(mtd.x / c2, mtd.y / c2);
				p2.curr.plusEquals(lambda);
				p2.velocity = vel;

			} else if (p2.fixed) {
				if (c1 <= fixedEndLimit) return;
				lambda.setTo(mtd.x / c1, mtd.y / c1);
				p1.curr.plusEquals(lambda);
				p1.velocity = vel;		

			// else both non fixed - move proportionally out of collision
			} else { 
				var denom:Number = (c1 * c1 + c2 * c2);
				if (denom == 0) return;
				lambda.setTo(mtd.x / denom, mtd.y / denom);
			
				p1.curr.plusEquals(lambda.mult(c1));
				p2.curr.plusEquals(lambda.mult(c2));
			
				// if collision is in the middle of SCP set the velocity of both end particles
				if (t == 0.5) {
					p1.velocity = vel;
					p2.velocity = vel;
				
				// otherwise change the velocity of the particle closest to contact
				} else {
					var corrParticle:AbstractParticle = (t < 0.5) ? p1 : p2;
					corrParticle.velocity = vel;
				}
			}
		}
		
		
		/**
		 * given point c, returns a parameterized location on this SCP. Note
		 * this is just treating the SCP as if it were a line segment (ab).
		 */
		private function closestParamPoint(c:Vector):Number {
			var ab:Vector = p2.curr.minus(p1.curr);
			var t:Number = (ab.dot(c.minus(p1.curr))) / (ab.dot(ab));
			return MathUtil.clamp(t, 0, 1);
		}
	
	
		/**
		 * returns a contact location on this SCP expressed as a parametric value in [0,1]
		 */
		private function getContactPointParam(p:AbstractParticle):Number {
			
			var t:Number;
			
			if (p is CircleParticle)  {
				t = closestParamPoint(p.curr);
			} else if (p is RectangleParticle) {
					
				// go through the sides of the colliding rectangle as line segments
				var shortestIndex:Number;
				var paramList:Array = new Array(4);
				var shortestDistance:Number = Number.POSITIVE_INFINITY;
				
				for (var i:int = 0; i < 4; i++) {
					setCorners(p as RectangleParticle, i);
					
					// check for closest points on SCP to side of rectangle
					var d:Number = closestPtSegmentSegment();
					if (d < shortestDistance) {
						shortestDistance = d;
						shortestIndex = i;
						paramList[i] = s;
					}
				}
				t = paramList[shortestIndex];
			}
			return t;
		}
		
		
		/**
		 * 
		 */
		private function setCorners(r:RectangleParticle, i:int):void {
		
			var rx:Number = r.curr.x;
			var ry:Number = r.curr.y;
			
			var axes:Array = r.axes;
			var extents:Array = r.extents;
			
			var ae0_x:Number = axes[0].x * extents[0];
			var ae0_y:Number = axes[0].y * extents[0];
			var ae1_x:Number = axes[1].x * extents[1];
			var ae1_y:Number = axes[1].y * extents[1];
			
			var emx:Number = ae0_x - ae1_x;
			var emy:Number = ae0_y - ae1_y;
			var epx:Number = ae0_x + ae1_x;
			var epy:Number = ae0_y + ae1_y;
			
			
			if (i == 0) {
				// 0 and 1
				rca.x = rx - epx;
				rca.y = ry - epy;
				rcb.x = rx + emx;
				rcb.y = ry + emy;
			
			} else if (i == 1) {
				// 1 and 2
				rca.x = rx + emx;
				rca.y = ry + emy;
				rcb.x = rx + epx;
				rcb.y = ry + epy;
				
			} else if (i == 2) {
				// 2 and 3
				rca.x = rx + epx;
				rca.y = ry + epy;
				rcb.x = rx - emx;
				rcb.y = ry - emy;
				
			} else if (i == 3) {
				// 3 and 0
				rca.x = rx - emx;
				rca.y = ry - emy;
				rcb.x = rx - epx;
				rcb.y = ry - epy;
			}
		}
		
		
		/**
		 * pp1-pq1 will be the SCP line segment on which we need parameterized s. 
		 */
		closestPtSegmentSegment: function () {
			
			var pp1 = this.p1.curr,
				 pq1 = this.p2.curr,
				 pp2 = this.rca,
				 pq2 = this.rcb,
			
				 d1 = pq1.minus(pp1),
				 d2 = pq2.minus(pp2),
				 r = pp1.minus(pp2),
		
				 t,
				 a = d1.dot(d1),
				 e = d2.dot(d2),
				 f = d2.dot(r),
			
				 c = d1.dot(r),
				 b = d1.dot(d2),
				 denom = a * e - b * b;
			
			if (denom != 0.0) {
				s = MathUtil.clamp((b * f - c * e) / denom, 0, 1);
			} else {
				s = 0.5 // give the midpoint for parallel lines
			}
			t = (b * s + f) / e;
			 
			if (t < 0) {
				t = 0;
			 	s = MathUtil.clamp(-c / a, 0, 1);
			} else if (t > 0) {
			 	t = 1;
			 	s = MathUtil.clamp((b - c) / a, 0, 1);
			}
			 
			var c1:Vector = pp1.plus(d1.mult(s));
			var c2:Vector = pp2.plus(d2.mult(t));
			var c1mc2:Vector = c1.minus(c2);
			return c1mc2.dot(c1mc2);
		}
	});

	Y.SpringConstaintParticle = SpringConstaintParticle;

}, '1.0.0' ,{requires:['jpe-abstract-constraint', 'jpe-spring-constraint-particle', 'jpe-math-util', 'jpe-verctor']});
