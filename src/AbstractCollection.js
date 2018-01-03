import CollisionDetector from './CollisionDetector';

export default class AbstractCollection {
    constructor() {
        this.isParented = false;
        this.container = null;
        this.particles = [];
        this.constraints = [];
    }
    initSelf() {
        const ps = this.particles
        const cs = this.constraints
        const pl = ps.length
        const cl = cs.length
        let i;

        for (i = 0; i < pl; i++) {
            ps[i].initSelf();
        }
        for (i = 0; i < cl; i++) {
            cs[i].initSelf();
        }
    }
    addParticle(p) {
        this.particles.push(p);
        if (this.isParented) {
            p.initSelf();
        }
    }
    removeParticle(p) {
        const ppos = this.particles.indexOf(p)
        if (ppos == -1) {
            return;
        }
        this.particles.splice(ppos, 1);
        p.cleanup();
    }
    addConstraint(c) {
        this.constraints.push(c);
        c.isParented = true;
        if (this.isParented) {
            c.initSelf();
        }
    }
    
    removeConstraint(c) {
        const cpos = this.constraints.indexOf(c)
        if (cpos === -1) {
            return;
        }
        this.constraints.splice(cpos, 1);
        c.cleanup();
    }
    paint() {
        const ps = this.particles
        const cs = this.constraints
        const pl = ps.length
        const cl = cs.length
        let p
        let c
        let i

        for (i = 0; i < pl; i++) {
            p = ps[i];
            if ((!p.getFixed()) || p.getAlwaysRepaint()) {
                p.paint();
            }
        }
        for (i = 0; i < cl; i++) {
            c = cs[i];
            if ((!c.getFixed()) || c.getAlwaysRepaint()) {
                c.paint();
            }
        }
    }
    cleanup() {
        const ps = this.particles
        const cs = this.constraints
        const pl = ps.length
        const cl = cs.length
        let i

        for (i = 0; i < pl; i++) {
            ps[i].cleanup();
        }
        for (i = 0; i < cl; i++) {
            cs[i].cleanup();
        }
    }
    integrate(dt2) {
        const ps = this.particles
        const pl = ps.length
        for (let i = 0; i < pl; i++) {
            ps[i].update(dt2);
        }
    }
    satisfyConstraints() {
        const cs = this.constraints
        const cl = cs.length
        for (let i = 0; i < cl; i++) {
            cs[i].resolve();
        }
    }
    getAll() {
        return this.particles.concat(this.constraints);
    }
    checkInternalCollisions() {
        var ps = this.particles,
            cs = this.constraints,
            pl = ps.length,
            cl = cs.length,
            p,
            p2,
            c,
            i,
            j,
            k;

        for (i = 0; i < pl; i++) {

            p = ps[i];
            if (!p.getCollidable()) continue;

            for (j = i + 1; j < pl; j++) {
                p2 = ps[j];
                if (p2.getCollidable()) {
                    CollisionDetector.test(p, p2);
                }
            }

            for (k = 0; k < cl; k++) {
                c = cs[k];
                if (c.getCollidable() && !c.isConnectedTo(p)) {
                    c.scp.updatePosition();
                    CollisionDetector.test(p, c.scp);
                }
            }
        }
    }
    checkCollisionsVsCollection(ac) {
        var ps = this.particles,
            acps = ac.particles,
            accs = ac.constraints,
            pl = ps.length,
            acpl = acps.length,
            accl = accs.length,
            p,
            p2,
            c,
            i,
            j,
            k;

        for (i = 0; i < pl; i++) {
            p = ps[i];
            if (!p.getCollidable()) continue;

            for (j = 0; j < acpl; j++) {
                p2 = acps[j];
                if (p2.getCollidable()) {
                    CollisionDetector.test(p, p2);
                }
            }

            for (k = 0; k < accl; k++) {
                c = accs[k];
                if (c.getCollidable() && !c.isConnectedTo(p)) {
                    c.scp.updatePosition();
                    CollisionDetector.test(p, c.scp);

                }
            }
        }

        // constraints start
        var _constraints = this.constraints,
            clen = _constraints.length,
            n,
            cga;

        for (j = 0; j < clen; j++) {
            cga = _constraints[j];
            if (!cga.getCollidable()) continue;

            for (n = 0; n < acpl; n++) {
                p = acps[n];
                if (p.getCollidable() && !cga.isConnectedTo(p)) {
                    cga.scp.updatePosition();
                    CollisionDetector.test(p, cga.scp);
                }
            }
        }
        // constraints end
    }
}
