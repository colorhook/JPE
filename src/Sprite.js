;(function(){
	if(!window.Shape || !window.Stage){
		throw new Error("the JPE library need using Easeljs library");
	}

	JPE.Sprite = {

		clear: function(){
			this.stage.clear();
		},
		create: function(){
			return new Shape();
		},
		drawCircle: function(shape, x, y, r){
			x = x || 0;
			y = y || 0;
			r = r || 100;
			var g = shape.graphics;
			g.beginFill(Graphics.getRGB(0x00,0x00,0xFF,0.5));
			g.drawCircle(0,0,100);
		},
		drawRect: function(shape, x, y, w, h){
			x = x || 0;
			y = y || 0;
			w = w || 100;
			h = h || 100;
			var g = shape.graphics;
			g.beginFill(Graphics.getRGB(0x00,0x00,0xFF,0.5));
			g.drawRect(x, y, w, h);
		}
	}
})();