JPE.declare('CanvasRenderer', function(){

	return {
	
		constructor:  function(canvas) {
			this.canvas = canvas;
			this.context = canvas.getContext('2d');
		},

		clear: function(){
			this.canvas.width = this.canvas.width;
		},
		lineStyle: function(lineThickness, lineColor, lineAlpha){

			this.context.strokeStyle = lineColor;
			this.context.lineWidth   = lineThickness || 0;
		},
		beginFill: function(fillColor, fillAlpha){
			this.context.fillStyle   = fillColor;
			this.context.beginPath();
		},
		drawRect: function(x, y, width, height){
			this.context.fillRect(x, y, width, height);
		},	
		drawCircle: function(x, y, radius){
			this.context.arc(x, y, radius, 0, Math.PI * 2, true); 
		},
		endFill: function(){
			this.context.fill();
			this.context.stroke();
			this.context.closePath();
		}
	}
});
