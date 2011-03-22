/*
 * @author: <a href="colorhook@gmail.com">colorhook</a>
 * @version:1.0.0
 */
JPE.mix(JPE, {
	rootNode: (function(){
		  var scripts = document.getElementsByTagName("script"),
				  src,
				  m,
				  rePkg = new RegExp('JPE\.js', 'i');
				  
			 for(var i = 0; i < scripts.length; i++){
					src = scripts[i].getAttribute("src");
					
					if(!src){ continue; }
					m = src.match(rePkg);
					if(m){
						return {
							node: scripts[i],
							root: src.substring(0, (m.index==0 ? 0 : m.index-1))
						};
					}
			 }
			 return {}
	})(),
	_loadedClassMap:{},
	_callbackList:[],
	_loadingCount:0,
	_loadScript: function(url){
		var m = this._loadedClassMap,
			 self = this,
			 element;

		if(m[url]){
			return;
		}
		
		m[url] = true;
		this._loadingCount++;

		element = document.createElement('script');
		element.src = url;
		element.charset = "utf-8";
		document.getElementsByTagName("head")[0].appendChild(element);
		element.onload = function(){
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
	_loadWaiter:null,
	_loadClass: function(name){
		var url = this.rootNode.root,
			 lw = this._loadWaiter;
		if(url == ''){
			url = name.replace(/\./g, '/') + '.js';
		}else{
			name = name.replace(/^JPE\./,'');
			url += "/" + name.replace(/\./g, '/') + '.js';
		}
		this._loadScript(url);
	},
	loaderInfoQueue: ["Engine", "Sprite", "Vector", "CanvasRenderer", "Interval", "Collision", "MathUtil", "AbstractItem",
		"CollisionResolver", "CollisionDetector", "AbstractCollection", "AbstractParticle", "Group", "Composite", 
		"CircleParticle", "RectangleParticle", "RimParticle", "WheelParticle","AbstractConstraint", "SpringConstraint", "SpringConstraintParticle"],
	require: function(name){
		name = name.replace(/^JPE\./,'');
		var loaderInfo, i = this.loaderInfoQueue.indexOf(name);
		if(name == "*"){
			loaderInfo = this.loaderInfoQueue;
		}else if(i >= 0){
			loaderInfo = this.loaderInfoQueue.slice(0, (i+1));
		}else{
			loaderInfo = [name];
		}
		for(i = 0, l = loaderInfo.length; i < l; i++){
			this._loadClass(loaderInfo[i]);
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