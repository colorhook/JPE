/*
 * @author: <a href="colorhook@gmail.com">colorhook</a>
 * @version:1.0.0
 */
;(function(host){

	var core = {
			VERSION: '1.0.0'
	},
	kernelName = "JPE",
	_guid = 0,
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
			//implements in JPELoader
			require: function(){
				return this;
			},
			//implements in JPELoader
			addOnLoad: function(func){
				func();
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
			declare: function(className, prop, requires){
				var self = this;
					
				if(this.isFunction(prop)){
					var p = prop();
					if(!self.isUndefined(p)){
						self.declare(className, p);
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
					newclass = {};
				}
				delete prop.constructor;
				
				if(!superclass){
					this.mix(newclass.prototype, prop);
				}else{
					
					newclass = this.extend(newclass, superclass, prop);
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

	host[kernelName] = core;
	
})(window);