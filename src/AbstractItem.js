JPE.declare('AbstractItem', {

	constructor: function(){
		this._visible = true;
		this._alwaysRepaint = true;
		this.lineTickness = 0;
		this.lineColor = 0x000000;
		this.lineAlpha = 1;
		this.fillColor = 0x333333;
		this.fillAlpha = 1;
	},

	initSelf: function(){
		JPE.Engine.container.addChild(this.getSprite());
	},
	
	paint: function(){
		
	},
	
	cleanup: function(){
		JPE.Engine.container.removeChild(this.getSprite());
	},

	/**
	 * visible setter & getter
	 */
	getVisible: function(){
		return this._visible;
	},
	setVisible: function(value){
		this._visible = value;
		this.getSprite().visible = value;
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
		this.drawShape();
	},	
	/**
	 * Sets the style of the line for this Item. 
	 */ 
	setLine: function(thickness, color, alpha) {
		this.lineThickness = thickness;
		this.lineColor = color;
		this.lineAlpha = alpha;
		this.drawShape();
	},
		
	/**
	 * Sets the style of the fill for this Item. 
	 */ 
	setFill: function(color, alpha) {
		this.fillColor = color;
		this.fillAlpha = alpha;
		this.drawShape();
	},
	createShape: function(){
		if(this.shape != null){
			this.getSprite().removeChild(this.shape);
		}
		this.shape = new Shape();
		this.drawShape();
		this.getSprite().addChild(this.shape);
	},
	drawShape: function(){
	},
	/**
	 * dependence on the Easel.js library.
	 */
	getSprite: function(){
		if(this._sprite == null){
			this._sprite = new Container();
		}
		return this._sprite;
	},

});

