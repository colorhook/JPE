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
