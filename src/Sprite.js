JPE.declare("Sprite", {

	constructor: function(renderer){
		this.renderer = renderer;
		this._x = this._y = 0;
		this._children = [];
		this._visible = true;
	},

	addChild: function(child){

			var index = this._children.indexOf(child);
		
			child._parent = this;
			child.renderer = this.renderer;
			if(index != -1){
				return;
			}
			this._children.push(child);
	},
	removeChild: function(child){
		var index = this._children.indexOf(child);
		if(index == -1){
			return;
		}
		this._children.splice(index, 1);
		child._parent = null;
		child.renderer = null;
	},

	setX: function(value){
		this._x = value;
	},
	getX: function(){
		return this._x;
	},
	getGlobalX: function(){
		var px = this._parent ? this._parent.getX() : 0;
		return px + this._x ;
	},
	setY: function(value){
		this._y = value;
	},
	getY: function(){
		return this._y;
	},
	getGlobalY: function(){
		var py = this._parent ? this._parent.getY() : 0;
		return py + this._y;
	},
	setRotation: function(value){
		this._rotation = value;
	},
	getRotation: function(){
		return this._rotation;
	},
	getChildren: function(){
		return this._children;
	},
	//------------draw canvas-------------
	lineStyle: function(lineThickness, lineColor, lineAlpha){
		if(this.renderer){
			this.renderer.lineStyle(lineThickness, lineColor, lineAlpha);
		}
	},
	beginFill: function(fillColor, fillAlpha){
		if(this.renderer){
			this.renderer.beginFill(fillColor, fillAlpha);
		}
	},
	drawRect: function(x, y, width, height){
		if(this.renderer){
			this.renderer.drawRect(x + this.getGlobalX(), y + this.getGlobalY(), width, height);
		}
	},
	drawCircle: function(x, y, radius){
		if(this.renderer){
			this.renderer.drawCircle(x + this.getGlobalX(), y + this.getGlobalY(), radius);
		}
	},
	endFill: function(){
		if(this.renderer){
			this.renderer.endFill();
		}
	}
});
