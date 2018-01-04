import {
	Composite,
	CircleParticle,
	SpringConstraint,
} from '../../src/'

export default class Body extends Composite {
	
		constructor(left, right, height, lineWeight, lineColor, lineAlpha){
			super()
			

			var cpx = (right.px + left.py) / 2;
			var cpy = right.py; 
			
			
			var rgt = this.rgt = new CircleParticle(right.px, right.py, 1);
			rgt.setStyle(3, lineColor, 1, lineColor, 1);		

			var lft = this.lft = new CircleParticle(left.px, left.py, 1);		
			lft.setStyle(3, lineColor, 1, lineColor, 1);
			
			var ctr = this.ctr = new CircleParticle(cpx, cpy, 1);	
			ctr.visible = false;

			var top = this.top = new CircleParticle(cpx, cpy - height / 2, 1);
			top.visible = false;	

			var bot = this.bot =new CircleParticle(cpx, cpy + height / 2, 1);	
			bot.visible = false;			
		
		
		
			// outer constraints
			var tr = new SpringConstraint(top,rgt,1);
			tr.visible = false;
			var rb = new SpringConstraint(rgt,bot,1);
			rb.visible = false;
			var bl = new SpringConstraint(bot,lft,1);			
			bl.visible = false;
			var lt = new SpringConstraint(lft,top,1);
			lt.visible = false;
			
			// inner constrainst
			var ct = new SpringConstraint(top, this.getCenter(),1);
			ct.visible = false;
			var cr = new SpringConstraint(rgt, this.getCenter(),1);
			cr.setLine(lineWeight, lineColor, lineAlpha);
			var cb = new SpringConstraint(bot, this.getCenter(),1);
			cb.visible = false;
			var cl = new SpringConstraint(lft,this.getCenter(),1);
			cl.setLine(lineWeight, lineColor, lineAlpha);
			
			ctr.collidable = false
			top.collidable = false
			rgt.collidable = false
			bot.collidable = false
			lft.collidable = false
			
			this.addParticle(ctr);
			this.addParticle(top);
			this.addParticle(rgt);
			this.addParticle(bot);
			this.addParticle(lft);
			
			this.addConstraint(tr);
			this.addConstraint(rb);
			this.addConstraint(bl);
			this.addConstraint(lt);
			
			this.addConstraint(ct);
			this.addConstraint(cr);
			this.addConstraint(cb);
			this.addConstraint(cl);


			this.left = lft;
			this.center = ctr;
			this.right = rgt;
	
		}
		getCenter() {
			return this.ctr
		}
}