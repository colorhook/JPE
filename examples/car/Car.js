import {
    Group,
    Vector,
    CircleParticle,
    WheelParticle,
    SpringConstraint
} from '../../src/'

export default class Car extends Group {
    constructor(colC, colE) {
        super()
        var wheelParticleA = new WheelParticle(140,10,14,false,2);
		wheelParticleA.setStyle(0, colC, 1, colE);
		this.addParticle(wheelParticleA);
		
		var wheelParticleB = new WheelParticle(200,10,14,false,2);
		wheelParticleB.setStyle(1, colC, 1, colE);
		this.addParticle(wheelParticleB);
		
		var wheelConnector = new SpringConstraint(wheelParticleA, wheelParticleB, 0.5, true, 8);
		wheelConnector.setStyle(1, colC, 1, colE);
		this.addConstraint(wheelConnector);

		this.wheelParticleA = wheelParticleA;
		this.wheelParticleB = wheelParticleB;
    }
    set speed(s) {
        this.wheelParticleA.angularVelocity = s;
        this.wheelParticleB.angularVelocity = s;
    }
}