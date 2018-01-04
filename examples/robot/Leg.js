import {
	Engine,
	Composite,
	CircleParticle,
	WheelParticle,
	SpringConstraint,
} from '../../src/'

const Graphics = createjs.Graphics

export default class Leg extends Composite {

	constructor (px, py, orientation, scale, lineWeight, lineColor, lineAlpha, fillColor, fillAlpha) {
		super()

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
		pa.collidable = false;
		pb.collidable = false;
		pc.collidable = false;
		pd.collidable = false;
		pe.collidable = false;
		ph.collidable = false;
		
		this._visible = true;
		
	}
	getCam() {
		return this.ph;
	}

	getFix(){
		return this.pa;
	}

	init(){
		var sprite = new createjs.Container(),
			shape = new createjs.Shape();
		
		sprite.addChild(shape);
		Engine.renderer.stage.addChild(sprite);
		this.sprite = sprite;
		this.shape = shape;
	}
	paint() {
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
		
		sg.moveTo(pa.px, pa.py);
		sg.lineTo(pb.px, pb.py);
		sg.lineTo(pc.px, pc.py);
		sg.lineTo(pa.px, pa.py);
		
		sg.moveTo(pd.px, pd.py);
		sg.lineTo(pe.px, pe.py);
		sg.lineTo(pf.px, pf.py);
		sg.lineTo(pd.px, pd.py);
		sg.endFill();
		
		// triangle to triangle
		sg.moveTo(pa.px, pa.py);
		sg.lineTo(pe.px, pe.py);
		sg.moveTo(pc.px, pc.py);
		sg.lineTo(pd.px, pd.py);
		
		// leg motor attachments
		sg.moveTo(pb.px, pb.py);
		sg.lineTo(ph.px, ph.py);
		sg.moveTo(pe.px, pe.py);
		sg.lineTo(ph.px, ph.py);
		
		sg.drawCircle(pf.px, pf.py, pf.radius);
	}
	
	setVisible(b) {
		this._visible = b;
	}
}