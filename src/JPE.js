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
			
			if(m[url]){
				return;
			}
			options = options || {};
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
	
})(window);