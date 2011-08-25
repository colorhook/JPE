/*!
 * Copyright (c) 2011 http://colorhook.com
 * @author: <a href="colorhook@gmail.com">colorhook</a>
 * @version: 1.0.1
 * @license: Released under the MIT License.
 *
 * Transplant from Flash AS3 APE Engine
 * http://www.cove.org/ape/
 * Copyright (c) 2006, 2007 Alec Cove
 * Released under the MIT License.
 */
/**
 * @preserve Copyright (c) 2011 http://colorhook.com
 * @author: <a href="colorhook@gmail.com">colorhook</a>
 * @version: 1.0.1
 * @license: Released under the MIT License.
 *
 * Transplant from Flash AS3 APE Engine
 * http://www.cove.org/ape/
 * Copyright (c) 2006, 2007 Alec Cove
 * Released under the MIT Licenses.
 */

;(function(host){

	var core = {
			VERSION: '1.0.1'
	},
	kernelName = "JPE",
	_guid = 0,
	_forceEnum = [
		'hasOwnProperty',
		'isPrototypeOf',
		'propertyIsEnumerable',
		'toString',
		'toLocaleString',
		'valueOf'
	],
	_hasEnumBug = !{valueOf: 0}.propertyIsEnumerable('valueOf'),
	TO_STRING = Object.prototype.toString,
	mix = function(r, s, ov, wl, mode, merge) {
		if (!s||!r) {
			return r;
		}

		if (mode) {
			switch (mode) {
				case 1: 
					return mix(r.prototype, s.prototype, ov, wl, 0);
				case 2: 
					mix(r.prototype, s.prototype, ov, wl, 0);
					break; 
				case 3: 
					return mix(r, s.prototype, ov, wl, 0);
				case 4: 
					return mix(r.prototype, s, ov, wl, 0);
				default:  
			}
		}

		if (!s || !r) return r;
		if (ov === undefined) ov = true;
		var i, p, l;

		if (wl && (l = wl.length)) {
			for (i = 0; i < l; i++) {
				p = wl[i];
				if (p in s) {
					if (ov || !(p in r)) {
						r[p] = s[p];
					}
				}
			}
		} else {
			for (p in s) {
				if (ov || !(p in r)) {
					r[p] = s[p];
				}
			}
		}
		if(_hasEnumBug){
			mix(to, from, ov, _forceEnum, mode, merge);
		}
		return r;
	};
	
	mix(core, {
			mix: mix,
			guid: function(pre) {
				var id = (_guid++) + "";
				return pre ? pre + id : id;
			},

			isUndefined: function(o) {
				return o === undefined;
			},

			isBoolean: function(o) {
				return TO_STRING.call(o) === '[object Boolean]';
			},

			isString: function(o) {
				return TO_STRING.call(o) === '[object String]';
			},

			isNumber: function(o) {
				return TO_STRING.call(o) === '[object Number]' && isFinite(o);
			},

			isFunction: function(o) {
				return TO_STRING.call(o) === '[object Function]';
			},

			isArray: function(o) {
				return TO_STRING.call(o) === '[object Array]';
			},
			'Array': {
				indexOf: function(arr, item){
					if(arr.indexOf){
						return arr.indexOf(item);
					}
					for(var i = 0, l = arr.length; i < l; i++){
						if(arr[i] === item){
							return i;
						}
					}
					return -1;
				},
				each: function(arr, callback){
					for(var i = 0, l = arr.length; i < l; i++){
						callback(arr[i], i, arr);
					}
				},
				remove: function(arr, item){
					var index = this.indexOf(arr, item);
					if(index != -1){
						return arr.splice(index, 1);
					}
				}
			},
			merge: function() {
				var a = arguments, o = {}, i, l = a.length;
				for (i=0; i<l; i=i+1) {
					mix(o, a[i], true);
				}
				return o;
			},
			namespace: function(name){
				var a=arguments, o=null, i, j, d, l;
				for (i=0; i<a.length; i=i+1) {
					d = ("" + a[i]).split(".");
					o = this;
					l = d.length;
					for (j=(d[0] == kernelName) ? 1 : 0; j < l; j = j+1) {
						o[d[j]] = o[d[j]] || {} ;
						o = o[d[j]];
					}
				}
				return o;
			},
			extend: function(r, s, px, sx) {
				if (!s||!r) {
					return r;
				}
				var OP = Object.prototype,
					O = function (o) {
						function F() {
						}

						F.prototype = o;
						return new F();
					},
					sp = s.prototype,
					rp = O(sp);


				r.prototype=rp;
				rp.constructor=r;
				r.superclass=sp;
				
				if (s != Object && sp.constructor == OP.constructor) {
					sp.constructor=s;
				}

				if (px) {
					mix(rp, px, true);
				}

				if (sx) {
					mix(r, sx, true);
				}
				r.superclass = s;
				return r;
			},
			declare: function(className, prop, statics){
				var self = this;
					
				if(this.isFunction(prop)){
					var p = prop();
					if(!self.isUndefined(p)){
						self.declare(className, p, statics);
					}else{
						mix(this.namespace(className), statics);
					}
					return;
				};
			
				prop = prop || {};
				var superclass = prop.superclass,
					 newclass,
					 d, l, i, o;

				if(prop.hasOwnProperty("constructor") && this.isFunction(prop.constructor)){
					newclass = prop.constructor;
				}else if(!superclass){
					newclass = function(){}
				}else{
					newclass = function(){
						superclass.prototype.constructor.apply(this, arguments);
					};
				}
				delete prop.constructor;
				
				if(!superclass){
					this.mix(newclass.prototype, prop);
					this.mix(newclass, statics);
				}else{
					newclass = this.extend(newclass, superclass, prop, statics);
				}
				
				d = ("" + className).split(".");
				i = (d[0]==kernelName) ? 1 : 0;
				l = d.length;
				o = this;
				for(; i < l; i++){
					if(i == l-1){
						o[d[i]] = newclass;
					}else{
						o[d[i]] = o[d[i]] || {} ;
					}
					o = o[d[i]];
				}
				return o;
			}
	});
	
	//lazy load scripts
	mix(core, {
		_loadedClassMap:{},
		_callbackList:[],
		_loadingCount:0,
		_loadScript: function(url, options){
			var m = this._loadedClassMap,
				 self = this,
				 element;

			options = options || {};
			url = options.path ? options.path + url : url;
			if(m[url]){
				return;
			}
			m[url] = true;
			this._loadingCount++;

			element = document.createElement('script');
			element.src = url;
			element.charset = options.charset || "utf-8";
			document.getElementsByTagName("head")[0].appendChild(element);
			element.onload = element.onerror = function(){
				element.onload = element.onerror = null;
				self._onScriptLoaded();
			}
		},
		_onScriptLoaded: function(){
			var count = --this._loadingCount,
				 cl = this._callbackList,
				 cb;

			if(count > 0){
				return;
			}else{
				while(cb = cl.shift()){
					cb();
				}
			}
		},
		_loadClass: function(name, options){
			options = options || {};
			if(!options.ignoreExtType && !/\.js$/.test(name)){
				name = name+".js";
			}
			this._loadScript(name, options);
		},
		require: function(name, options){
			var loaderInfo;
			if(this.isArray(name)){
				loaderInfo = name;
			}else{
				loaderInfo = [name]
			}
			for(i = 0, l = loaderInfo.length; i < l; i++){
				this._loadClass(loaderInfo[i], options);
			}
			return this;
		},
		addOnLoad: function(callback){
			if(this._loadingCount == 0){
				callback();
			}else{
				this._callbackList.push(callback);
			}
		}
	});

	host[kernelName] = core;
	
})(window);JPE.declare('Signal', {

	__bindings: null,
	__bindingsOnce:null,

	constructor: function(){
		this.__bindings = [];
		this.__bindingsOnce = [];
	},
	
	add: function(listener){
		return this.registerListener(listener);
	},
	addOnce: function(listener){
		return this.registerListener(listener, true);
	},
	remove: function(listener){
		var index = this.find(listener),
			oIndex = this.find(listener, this.__bindingsOnce);
		if(index >= 0){
			this.__bindings.splice(index, 1);
		}
		if(oIndex >= 0){
			this.__bindingsOnce.splice(oIndex, 1);
		}
	},
	removeAll: function(){
		this.__bindings.length = 0;
		this.__bindingsOnce.length = 0;
	},
	dispatch: function(){
		var args = Array.prototype.slice.call(arguments),
			list =  this.__bindings,
			copyList = list.concat(),
			listener;

		args.unshift(this);
		for(var i = 0, l = copyList.length; i < l; i++){
			listener = copyList[i];
			listener.apply(null, args);
			if(this.find(listener, this.__bindingsOnce) != -1){
				this.remove(listener);
			}
		}
	},
	getNumListeners: function(){
		return this.__bindings.length;
	},
	registerListener: function(listener, once){
		var index = this.find(listener);
		if(index == -1 || !once){
			this.__bindings.push(listener);
			if(once){
				this.__bindingsOnce.push(listener);
			}
		}
		
	},
	find: function(listener, arr){
		arr = arr || this.__bindings;
		if(arr.indexOf){
			return arr.indexOf(listener);
		}
		for(var i = 0, l = arr.length; i < l; i++){
			if(arr[i] === listener){
				return i;
			}
		}
		return -1;
	}
});JPE.Engine = {

		force:null,
		masslessForce:null,
		groups:null,
		numGroups:0,
		timeStep:0,
		renderer:null,
		damping:1,
		constraintCycles:0,
		constraintCollisionCycles:1,

		init: function(dt){
			if(isNaN(dt)){
				dt = 0.25;
			}
			this.timeStep = dt * dt;
			this.groups = [];
			this.force = new JPE.Vector(0, 0);
			this.masslessForce = new JPE.Vector(0, 0);
		},
		addForce:function(v){
			this.force.plusEquals(v);
		},
		addMasslessForce:function(v){
			this.masslessForce.plusEquals(v);
		},
		addGroup:function(g){
			this.groups.push(g);
			g.isParented = true;
			this.numGroups++;
			g.initSelf();
		},
		removeGroup:function(g) {
			var gpos = JPE.Array.indexOf(this.groups, g);
			if (gpos == -1) {
				return;
			}
			this.groups.splice(gpos, 1);
			g.isParented = false;
			this.numGroups--;
			g.cleanup();
		},
		step:function(){
			this.integrate();
			for(var j = 0; j < this.constraintCycles; j++){
				this.satisfyConstraints();
			}
			for(var i = 0; i < this.constraintCollisionCycles; i++){
				this.satisfyConstraints();
				this.checkCollisions();
			}
		},
		paint:function(){
			for(var j = 0; j< this.numGroups; j++){
				var g = this.groups[j];
				g.paint();
			}
		},
		integrate:function(){
			for(var j = 0; j< this.numGroups; j++){
				var g = this.groups[j];
				g.integrate(this.timeStep);
			}
		},
		satisfyConstraints:function(){
			for(var j = 0; j< this.numGroups; j++){
				var g = this.groups[j];
				g.satisfyConstraints();
			}
		},
		checkCollisions:function(){
			for(var j = 0; j< this.numGroups; j++){
				var g = this.groups[j];
				g.checkCollisions();
			}
		}
};(function(){
	var Vector =  function(px, py){
		this.x = px || 0;
		this.y = py || 0;
	};
	JPE.mix(Vector.prototype, {
			
		setTo:function(px, py){
			this.x = px || 0;
			this.y = py || 0;
		},
		copy:function(v){
			this.x = v.x;
			this.y = v.y;
		},
		dot:function(v){
			return this.x * v.x + this.y * v.y;
		},
		cross:function(v){
			return this.x * v.y + this.y * v.x;
		},
		plus:function(v){
			return new Vector(this.x + v.x, this.y + v.y);
		},
		plusEquals:function(v){
			this.x += v.x;
			this.y += v.y;
			return this;
		},
		minus: function(v){
			return new Vector(this.x - v.x, this.y - v.y);
		},
		minusEquals: function(v){
			this.x -= v.x;
			this.y -= v.y;
			return this;
		},
		mult: function(s){
			return new Vector(this.x * s, this.y * s);
		},
		multEquals:function(s){
			this.x *= s;
			this.y *= s;
			return this;
		},
		times:function(v){
			return new Vector(this.x * v.x, this.y*v.y);
		},
		divEquals:function(s){
			if(s == 0){
				s = 0.0001;
			}
			this.x /= s;
			this.y /= s;
			return this;
		},
		magnitude:function(){
			return Math.sqrt(this.x * this.x + this.y * this.y);
		},
		distance:function(v){
			var delta = this.minus(v);
			return delta.magnitude();
		},
		normalize: function(){
			var m = this.magnitude();
			if(m == 0){
				m = 0.0001;
			}
			return this.mult(1/m);
		},
		toString:function(){
			return (this.x + " : " + this.y);
		}
	});

	JPE.Vector = Vector;
})();JPE.declare('Interval', {
	constructor: function(min, max){
		this.min = min;
		this.max = max;
	}
});
JPE.declare('Collision', {
	
	constructor: function(vn, vt){
		this.vn = vn;
		this.vt = vt;
	}

});
JPE.declare('SmashSignal', {
	
	superclass: JPE.Signal

},{
	COLLISION: "collision"
});JPE.MathUtil = {
	
		ONE_EIGHTY_OVER_PI : 180 / Math.PI,
		PI_OVER_ONE_EIGHTY : Math.PI / 180,

		clamp: function(n, min, max) {
			if (n < min) return min;
			if (n > max) return max;
			return n;
		},
		sign: function(val) {
			if (val < 0) return -1
			return 1;
		}
	
};
JPE.declare('AbstractItem', {

	constructor: function(){
		this._visible = true;
		this._alwaysRepaint = true;
		this.lineTickness = 0;
		this.lineColor = 0x000000;
		this.lineAlpha = 1;
		this.fillColor = 0x333333;
		this.fillAlpha = 1;
		this._pool = {};
		this.beforeRenderSignal = new JPE.Signal();
		this.afterRenderSignal = new JPE.Signal();
	},
	get: function(name){
		return this._pool[name];
	},
	set: function(name, value){
		this._pool[name] = value;
	},
	initSelf: function(){
		var initSelfFunction = this.initSelfFunction || this.constructor.initSelfFunction;
		if(JPE.isFunction(initSelfFunction)){
			initSelfFunction(this);
		}else{
			JPE.Engine.renderer.initSelf(this);
		}
		this.paint();
	},
	cleanup: function(){
		var cleanupFunction = this.cleanupFunction || this.constructor.cleanupFunction;
		if(JPE.isFunction(cleanupFunction)){
			cleanupFunction(this);
		}else{
			JPE.Engine.renderer.cleanup(this);
		}
	},
	paint: function(){
		this.render();
	},

	render: function(){
		this.beforeRenderSignal.dispatch(this);
		var renderFunction = this.renderFunction || this.constructor.renderFunction;
		if(JPE.isFunction(renderFunction)){
			renderFunction(this);
		}else{
			JPE.Engine.renderer.render(this);
		}
		this.afterRenderSignal.dispatch(this);
	},
	
	/**
	 * visible setter & getter
	 */
	getVisible: function(){
		return this._visible;
	},
	setVisible: function(value){
		if(value == this._visible){
			return;
		}
		this._visible = value;
		JPE.Engine.renderer.setVisible(this);
	},	
	/**
	 * awaysRepaint setter & getter
	 */
	getAlwaysRepaint: function(){
		return this._alwaysRepaint;
	},
	setAlwaysRepaint: function(value){
		this._alwaysRepaint = value
	},
	setStyle: function(lineThickness, lineColor, lineAlpha, fillColor, fillAlpha) {
		lineThickness = lineThickness || 0;
		lineColor = lineColor || 0x000;
		lineAlpha = lineAlpha || 1;
		fillColor = fillColor || 0x000;
		fillAlpha = fillAlpha || 1;
		this.setLine(lineThickness, lineColor, lineAlpha);		
		this.setFill(fillColor, fillAlpha);
	},
	/**
	 * Sets the style of the line for this Item. 
	 */ 
	setLine: function(thickness, color, alpha) {
		this.lineThickness = thickness;
		this.lineColor = color;
		this.lineAlpha = alpha;
	},
		
	/**
	 * Sets the style of the fill for this Item. 
	 */ 
	setFill: function(color, alpha) {
		this.fillColor = color;
		this.fillAlpha = alpha;
	}

});
JPE.CollisionResolver = {

	resolveParticleParticle: function( pa,  pb, normal,  depth) {

		// a collision has occured. set the current positions to sample locations
		pa.curr.copy(pa.samp);
		pb.curr.copy(pb.samp);
		
		var mtd = normal.mult(depth);           
		var te = pa.getElasticity() + pb.getElasticity();
	
		var sumInvMass = pa.getInvMass() + pb.getInvMass();
		// the total friction in a collision is combined but clamped to [0,1]
		var tf = this.clamp(1 - (pa.getFriction() + pb.getFriction()), 0, 1);

		// get the collision components, vn and vt
		var ca = pa.getComponents(normal);
		var cb = pb.getComponents(normal);

		 // calculate the coefficient of restitution based on the mass, as the normal component
		var vnA = (cb.vn.mult((te + 1) * pa.getInvMass()).plus(
				ca.vn.mult(pb.getInvMass() - te * pa.getInvMass()))).divEquals(sumInvMass);

		var vnB = (ca.vn.mult((te + 1) * pb.getInvMass()).plus(
				cb.vn.mult(pa.getInvMass() - te * pb.getInvMass()))).divEquals(sumInvMass);
		
		// apply friction to the tangental component
		ca.vt.multEquals(tf);
		cb.vt.multEquals(tf);
		
		// scale the mtd by the ratio of the masses. heavier particles move less 
		var mtdA = mtd.mult( pa.getInvMass() / sumInvMass);     
		var mtdB = mtd.mult(-pb.getInvMass() / sumInvMass);
		
		// add the tangental component to the normal component for the new velocity 
		vnA.plusEquals(ca.vt);
		vnB.plusEquals(cb.vt);
		
		
		if (!pa.getFixed()) pa.resolveCollision(mtdA, vnA, normal, depth, -1, pb);
		if (!pb.getFixed()) pb.resolveCollision(mtdB, vnB, normal, depth,  1, pa);
	},

	clamp: function(input, min, max) {
		if (input > max) return max;
		if (input < min) return min;
		return input;
	}
};
JPE.declare("CollisionDetector", function(){

	var POSITIVE_INFINITY = Number.POSITIVE_INFINITY;
	var Vector = JPE.Vector;

	JPE.CollisionDetector = {

			/**
			 * Tests the collision between two objects. If there is a collision
			 * it is passsed off to the CollisionResolver class.
			 * @param objA {AbstractParticle}
			 * @param objB {AbstractParticle}
			 */
			test: function(objA, objB){
				if(objA.getFixed() && objB.getFixed()) return;
				if(objA.getMultisample() == 0 && objB.getMultisample() == 0){
					this.normVsNorm(objA, objB);
				}else if(objA.getMultisample() > 0 && objB.getMultisample() ==0 ){
					this.sampVsNorm(objA, objB);
				}else if(objB.getMultisample() > 0 && objA.getMultisample() ==0){
					this.sampVsNorm(objB, objA);
				}else if(objA.getMultisample() == objB.getMultisample()){
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
			
				var objA