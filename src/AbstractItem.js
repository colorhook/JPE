JPE.declare('AbstractItem', {

	constructor: function(){
		this._visible = true;
		this._alwaysRepaint = true;
		this.lineTickness = 0;
		this.lineColor = '#000';
		this.lineAlpha = 1;
		this.fillColor = '#000';
		this.fillAlpha = 1;
	},

	initSelf: function(){
	},
	
	paint: function(){
	},
	
	cleanup: function(){
	},

	/**
	 * visible setter & getter
	 */
	getVisible: function(){
		return this._visible;
	},
	setVisible: function(value){
		this._visible = value;
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
		lineColor = lineColor || '#000';
		lineAlpha = lineAlpha || 1;
		fillColor = fillColor || '#000';
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
	},
	
	getSprite: function(){
		if(this._sprite != null) return this._sprite;
		this._sprite = JPE.Sprite.create();
		JPE.Sprite.stage.addChild(this._sprite);
		return this._sprite;
	}

});

