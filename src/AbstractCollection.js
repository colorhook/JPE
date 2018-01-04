import CollisionDetector from './CollisionDetector';

export default class AbstractCollection {
    constructor() {
        this.isParented = false;
        this.container = null;
        this.particles = [];
        this.constraints = [];
    }
    init() {
        const ps = this.particles
        const cs = this.constraints
        const pl = ps.length
        const cl = cs.length
        let i;

        for (i = 0; i < pl; i++) {
            ps[i].init();
        }
        for (i = 0; i < cl; i++) {
            cs[i].init();
        }
    }
    addParticle(p) {
        this.particles.push(p);
        if (this.isParented) {
            p.init();
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

        for (let i = 0; i < pl; i++) {
            const p = ps[i];
            if (!p.fixed || p.alwaysRepaint) {
                p.paint();
            }
        }
        for (let i = 0; i < cl; i++) {
            const c = cs[i];
            if (!c.fixed || c.alwaysRepaint) {
                c.paint();
            }
        }
    }
    cleanup() {
        const ps = this.particles
        const cs = this.constraints
        const pl = ps.length
        const cl = cs.length

        for (let i = 0; i < pl; i++) {
            ps[i].cleanup();
        }
        for (let i = 0; i < cl; i++) {
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
        for (let i = 0; i < this.constraints.length; i++) {
            this.constraints[i].resolve();
        }
    }
    getAll() {
        return this.particles.concat(this.constraints);
    }
    checkInternalCollisions() {
        const ps = this.particles
        const cs = this.constraints
        const pl = ps.length
        const cl = cs.length

        for (let i = 0; i < pl; i++) {

            let p = ps[i];
            if (!p || p.collidable) continue;

            for (let j = i + 1; j < pl; j++) {
                const p2 = ps[j];
                if (p2 && p2.collidable) {
                    CollisionDetector.test(p, p2);
                }
            }

            for (let k = 0; k < cl; k++) {
                const c = cs[k];
                if (c && c.collidable && !c.isConnectedTo(p)) {
                    c.scp.updatePosition();
                    CollisionDetector.test(p, c.scp);
                }
            }
        }
    }
    checkCollisionsVsCollection(ac) {
        const ps = this.particles
        const acps = ac.particles
        const accs = ac.constraints
        const pl = ps.length
        const acpl = acps.length
        const accl = accs.length

        for (let i = 0; i < pl; i++) {
            const p = ps[i];
            if (!p || !p.collidable) continue;

            for (let j = 0; j < acpl; j++) {
                const p2 = acps[j];
                if (p2 && p2.collidable) {
                    CollisionDetector.test(p, p2);
                }
            }

            for (let k = 0; k < accl; k++) {
                const c = accs[k];
                if (c.collidable && !c.isConnectedTo(p)) {
                    c.scp.updatePosition();
                    CollisionDetector.test(p, c.scp);
                }
            }
        }

        // constraints start
        for (let j = 0; j < this.constraints.length; j++) {
            const cga = this.constraints[j];
            if (!cga || !cga.collidable) continue;

            for (let n = 0; n < acpl; n++) {
                const p = acps[n];
                if (p != null && p.collidable && !cga.isConnectedTo(p)) {
                    cga.scp.updatePosition();
                    CollisionDetector.test(p, cga.scp);
                }
            }
        }
        // constraints end
    }
}
