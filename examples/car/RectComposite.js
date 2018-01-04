import {
    Composite,
    CircleParticle,
    RectangleParticle,
    SpringConstraint,
} from '../../src/'

export default class RectComposite extends Composite {
    constructor(ctr, colA, colB) {
        super()
        // just hard coding here for the purposes of the demo, you should pass
        // everything in the constructor to do it right.
        var rw = 75;
        var rh = 18;
        var rad = 4;
        
        // going clockwise from left top..
        var cpA = new CircleParticle(ctr.x-rw/2, ctr.y-rh/2, rad, true);
        var cpB = new CircleParticle(ctr.x+rw/2, ctr.y-rh/2, rad, true);
        var cpC = new CircleParticle(ctr.x+rw/2, ctr.y+rh/2, rad, true);
        var cpD = new CircleParticle(ctr.x-rw/2, ctr.y+rh/2, rad, true);
        
        cpA.setStyle(0,0,0,colA);
        cpB.setStyle(0,0,0,colA);
        cpC.setStyle(0,0,0,colA);
        cpD.setStyle(0,0,0,colA);
        
        // by default all fixed particles are not repainted. this is for efficiency,
        // since it would be a waste to repaint a non moving particle. in this case
        // we are going to be rotating a group of fixed particles, so we'll turn on 
        // always repaint for each one.
        cpA.alwaysRepaint = true;
        cpB.alwaysRepaint = true;
        cpC.alwaysRepaint = true;
        cpD.alwaysRepaint = true;
        
        var sprA = new SpringConstraint(cpA,cpB,0.5,true,rad * 2);
        var sprB = new SpringConstraint(cpB,cpC,0.5,true,rad * 2);
        var sprC = new SpringConstraint(cpC,cpD,0.5,true,rad * 2);
        var sprD = new SpringConstraint(cpD,cpA,0.5,true,rad * 2);
        sprA.debug = true;
        sprA.setStyle(0,0,0,colA);
        sprB.setStyle(0,0,0,colA);
        sprC.setStyle(0,0,0,colA);
        sprD.setStyle(0,0,0,colA);
        
        // by default all fixed SpringConstraints are not repainted as well. A
        // SpringConstraint will be fixed if both its attached Particles are
        // fixed.
        sprA.alwaysRepaint = true;
        sprB.alwaysRepaint = true;
        sprC.alwaysRepaint = true;
        sprD.alwaysRepaint = true;	
        
        this.addParticle(cpA);
        this.addParticle(cpB);
        this.addParticle(cpC);
        this.addParticle(cpD);
        
        this.addConstraint(sprA);
        this.addConstraint(sprB);
        this.addConstraint(sprC);
        this.addConstraint(sprD);
        this.cpA = cpA;
        this.cpC = cpC;
    }

    getPa() {
        return this.cpA;
    }
    getPc() {
        return this.cpC;
    }
}