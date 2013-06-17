define("Body", function(require, exports, module){

	var JPE = require("JPE/JPE");
	var Composite = require("JPE/Composite");
	var CircleParticle = require("JPE/CircleParticle");
	var SpringConstraint = require("JPE/SpringConstraint");

	var Body = function (left, right, height, lineWeight, lineColor, lineAlpha){

		Composite.prototype.constructor.apply(this);
			

		var cpx = (right.getPx() + left.getPx()) / 2;
		var cpy = right.getPy(); 
		
		
		var rgt = this.rgt = new CircleParticle(right.getPx(), right.getPy(), 1);
		rgt.setStyle(3, lineColor, 1, lineColor, 1);		

		var lft = this.lft = new CircleParticle(left.getPx(), left.getPy(), 1);		
		lft.setStyle(3, lineColor, 1, lineColor, 1);
		
		var ctr = this.ctr = new CircleParticle(cpx, cpy, 1);	
		ctr.setVisible(false);

		var top = this.top = new CircleParticle(cpx, cpy - height / 2, 1);
		top.setVisible(false);	

		var bot = this.bot =new CircleParticle(cpx, cpy + height / 2, 1);	
		bot.setVisible(false);			
		
		
		
		// outer constraints
		var tr = new SpringConstraint(top,rgt,1);
		tr.setVisible(false);
		var rb = new SpringConstraint(rgt,bot,1);
		rb.setVisible(false);
		var bl = new SpringConstraint(bot,lft,1);			
		bl.setVisible(false);
		var lt = new SpringConstraint(lft,top,1);
		lt.setVisible(false);
		
		// inner constrainst
		var ct = new SpringConstraint(top, this.getCenter(),1);
		ct.setVisible(false);
		var cr = new SpringConstraint(rgt, this.getCenter(),1);
		cr.setLine(lineWeight, lineColor, lineAlpha);
		var cb = new SpringConstraint(bot, this.getCenter(),1);
		cb.setVisible(false);
		var cl = new SpringConstraint(lft,this.getCenter(),1);
		cl.setLine(lineWeight, lineColor, lineAlpha);
		
		ctr.setCollidable(false)
		top.setCollidable(false)
		rgt.setCollidable(false)
		bot.setCollidable(false)
		lft.setCollidable(false)
		
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
	
	};


	JPE.extend(Body, Composite, {

		getCenter: function(){
			return this.ctr;
		}

	});

	module.exports = Body;

});