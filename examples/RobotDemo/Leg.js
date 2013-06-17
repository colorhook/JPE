define("Leg", function(require, exports, module){

	var JPE = require("JPE/JPE");
	var Engine = require("JPE/Engine");
	var Composite = require("JPE/Composite");
	var CircleParticle = require("JPE/CircleParticle");
	var WheelParticle = require("JPE/WheelParticle");
	var SpringConstraint = require("JPE/SpringConstraint");

	var Leg = function (px, py, orientation, scale, lineWeight, lineColor, lineAlpha, fillColor, fillAlpha) {
		
		Composite.prototype.constructor.apply(this);

		this.lineColor = lineColor;
		this.lineAlpha = lineAlpha;
		this.lineWeight = lineWeight;
		
		this.fillColor = fillColor;
		this.fillAlpha = fillAlpha;

		
		// top triangle -- pa is the attach point to the body
		var os = orientation * scale;

		var pa = this.pa = new CircleParticle(px + 31 * os, py - 8 * scale, 1);
		var pb = this.pb = new CircleParticle(px + 25 * os, py - 37 * scale, 1);
		var pc = this.pc = new CircleParticle(px + 60 * os, py - 15 * scale, 1);
		
		// bottom triangle particles -- pf is the foot
		var pd = this.pd = new CircleParticle(px + 72 * os, py + 12 * scale,  1);
		var pe = this.pe = new CircleParticle(px + 43 * os, py + 19 * scale,  1);
		var pf = this.pf = new CircleParticle(px + 54 * os, py + 61 * scale,  2);
		
		// strut attach point particle
		var ph = this.ph = new CircleParticle(px, py, 3);
		
		// top triangle constraints
		var cAB = new SpringConstraint(pa,pb,1);
		var cBC = new SpringConstraint(pb,pc,1);
		var cCA = new SpringConstraint(pc,pa,1);
		
		// middle leg constraints
		var cCD = new SpringConstraint(pc,pd,1);
		var cAE = new SpringConstraint(pa,pe,1);
		
		// bottom leg constraints
		var cDE = new SpringConstraint(pd,pe,1);
		var cDF = new SpringConstraint(pd,pf,1);
		var cEF = new SpringConstraint(pe,pf,1);
		
		// cam constraints
		var cBH = new SpringConstraint(pb,ph,1);
		var cEH = new SpringConstraint(pe,ph,1);
		
		this.addParticle(pa);
		this.addParticle(pb);
		this.addParticle(pc);
		this.addParticle(pd);
		this.addParticle(pe);
		this.addParticle(pf);
		this.addParticle(ph);	
		
		this.addConstraint(cAB);
		this.addConstraint(cBC);
		this.addConstraint(cCA);
		this.addConstraint(cCD);
		this.addConstraint(cAE);
		this.addConstraint(cDE);
		this.addConstraint(cDF);
		this.addConstraint(cEF);
		this.addConstraint(cBH);
		this.addConstraint(cEH);	
		
		// for added efficiency, only test the feet (pf) for collision. these
		// selective tweaks should always be considered for best performance.
		pa.setCollidable(false);
		pb.setCollidable(false);
		pc.setCollidable(false);
		pd.setCollidable(false);
		pe.setCollidable(false);
		ph.setCollidable(false);
		
		this._visible = true;
		
	};


	JPE.extend(Leg, Composite, {
		lineWeight:null,
		lineColor:null,
		lineAlpha:null,
		fillColor:null,
		fillAlpha:null,
		sg:null,
		_visible:null,

		pa:null,
		pb:null,
		pc:null,
		pd:null,
		pe:null,
		pf:null,
		ph:null,

		
		getCam:function() {
			return this.ph;
		},

	    getFix:function(){
			return this.pa;
		},

		initSelf: function(){
			var sprite = new Container(),
				shape = new Shape();
			
			sprite.addChild(shape);
			Engine.renderer.stage.addChild(sprite);
			this.sprite = sprite;
			this.shape = shape;
		},
		paint: function() {
			var shape = this.shape,
				sg = shape.graphics,
				pa = this.pa,
				pb = this.pb,
				pc = this.pc,
				pd = this.pd,
				pe = this.pe,
				pf = this.pf,
				ph = this.ph;

			sg.clear();
			if (! this._visible) return;
		

			if(this.lineWeight){
				sg.setStrokeStyle(this.lineWeight)
				sg.beginStroke(Graphics.getRGB(this.lineColor, this.lineAlpha));
			}
			sg.beginFill(Graphics.getRGB(this.fillColor, this.fillAlpha));
			
			sg.moveTo(pa.getPx(), pa.getPy());
			sg.lineTo(pb.getPx(), pb.getPy());
			sg.lineTo(pc.getPx(), pc.getPy());
			sg.lineTo(pa.getPx(), pa.getPy());
			
			sg.moveTo(pd.getPx(), pd.getPy());
			sg.lineTo(pe.getPx(), pe.getPy());
			sg.lineTo(pf.getPx(), pf.getPy());
			sg.lineTo(pd.getPx(), pd.getPy());
			sg.endFill();
			
			// triangle to triangle
			sg.moveTo(pa.getPx(), pa.getPy());
			sg.lineTo(pe.getPx(), pe.getPy());
			sg.moveTo(pc.getPx(), pc.getPy());
			sg.lineTo(pd.getPx(), pd.getPy());
			
			// leg motor attachments
			sg.moveTo(pb.getPx(), pb.getPy());
			sg.lineTo(ph.getPx(), ph.getPy());
			sg.moveTo(pe.getPx(), pe.getPy());
			sg.lineTo(ph.getPx(), ph.getPy());
			
			sg.drawCircle(pf.getPx(), pf.getPy(), pf.getRadius());
		},
		
		
		setVisible: function(b) {
			this._visible = b;
		}

	});


	module.exports = Leg;
});
