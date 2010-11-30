/*!
 * @revision:
 */
/*
 * @author: <a href="zhengxie.lj@taobao.com">zhengxie</a>
 * @version:1-0-0
 */
YUI.add('jpe-abstract-item', function(Y) {
	
	var AbstractItem = function(){
		this.visible = true;
		this.alwaysRepaint = false;
		this.lineTickness = 0;
		this.lineColor = 0xFFFFFF;
		this.lineAlpha = 1;
		this.fillColor = 0xFFFFFF;
		this.fillAlpha = 1;
	}

	Y.mix(AbstractItem.prototype , {

		initSelf: function(){

		},
		
		paint: function(){

		},
		
		cleanup: function(){

		},
		setStyle: function(lineThickness, lineColor, lineAlpha,fillColor, fillAlpha) {
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

	Y.AbstractItem = AbstractItem;


}, '1.0.0' ,{requires:['base', 'node']});
