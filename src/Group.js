import AbstractCollection from './AbstractCollection'

export default class Group extends AbstractCollection{

    constructor(collideInternal) {
        super()
        this.composites = [];
        this.collisionList = [];
        this.collideInternal = collideInternal;
    }
    init() {
        super.init()
        for (let i = 0, l = this.composites.length; i < l; i++) {
            this.composites[i].init();
        }
    }
    addComposite(c) {
        this.composites.push(c);
        c.isParented = true;
        if (this.isParented) {
            c.init();
        }
    }
    removeComposite(c) {
        const cpos = this.composites.indexOf(c)
        if (cpos === -1) {
            return;
        }
        this.composites.splice(cpos, 1);
        c.isParented = false;
        c.cleanup();
    }

    paint() {
        super.paint()
        const cs = this.composites
        const len = this.composites.length
        for (let i = 0; i < len; i++) {
            let c = cs[i];
            c.paint();
        }
    }
    addCollidable(g) {
        this.collisionList.push(g);
    }

    removeCollidable(g) {
        const pos = this.collisionList.indexOf(g)
        if (pos == -1) {
            return;
        }
        this.collisionList.splice(pos, 1);
    }

    addCollidableList(list) {
        for (let i = 0; i < list.length; i++) {
            this.collisionList.push(list[i]);
        }
    }

    getAll() {
        return this.particles.concat(this.constraints).concat(this.composites);
    }

    cleanup() {
        super.cleanup()
        const cs = this.composites
        const cl = cs.length
        for (let i = 0; i < cl; i++) {
            cs[i].cleanup();
        }
    }
    integrate(dt2) {
        super.integrate(dt2)
        const cs = this.composites
        const cl = cs.length
        for (let i = 0; i < cl; i++) {
            cs[i].integrate(dt2);
        }
    }
    satisfyConstraints() {
        super.satisfyConstraints()
        const cs = this.composites
        const cl = cs.length
        for (let i = 0; i < cl; i++) {
            cs[i].satisfyConstraints();
        }
    }
    checkCollisions() {
        if (this.collideInternal) {
            this.checkCollisionGroupInternal();
        }

        const cl = this.collisionList
        const cllen = cl.length
        for (let i = 0; i < cllen; i++) {
            this.checkCollisionVsGroup(cl[i]);
        }
    }
    checkCollisionGroupInternal() {
        this.checkInternalCollisions();

        const cs = this.composites
        const clen = cs.length

        for (let i = 0; i < clen; i++) {
            let c = cs[i];
            c.checkCollisionsVsCollection(this);

            for (let j = i + 1; j < clen; j++) {
                let c2 = cs[j];
                c.checkCollisionsVsCollection(c2);
            }
        }
    }

    checkCollisionVsGroup(g) {
        this.checkCollisionsVsCollection(g);

        const cs = this.composites
        const clen = cs.length
        const gclen = g.composites.length

        for (let i = 0; i < clen; i++) {
            let c = cs[i];
            c.checkCollisionsVsCollection(g);
            for (let j = 0; j < gclen; j++) {
                let gc = g.composites[j];
                c.checkCollisionsVsCollection(gc);
            }
        }

        for (let j = 0; j < gclen; j++) {
            let gc = g.composites[j];
            this.checkCollisionsVsCollection(gc);
        }
    }
}