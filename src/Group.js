import AbstractCollection from './AbstractCollection'

export default class Group extends AbstractCollection{

    constructor(collideInternal) {
        super()
        this.composites = [];
        this.collisionList = [];
        this.collideInternal = collideInternal;
    }
    initSelf() {
        super.initSelf()
        for (let i = 0, l = this.composites.length; i < l; i++) {
            this.composites[i].initSelf();
        }
    }

    addComposite(c) {
        this.composites.push(c);
        c.isParented = true;
        if (this.isParented) {
            c.initSelf();
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
        var cs = this.composites,
            i = 0,
            c,
            len = this.composites.length;
        for (; i < len; i++) {
            c = cs[i];
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
        var i = 0,
            l = list.length,
            cl = this.collisionList;
        for (; i < l; i++) {
            cl.push(list[i]);
        }
    }

    getAll() {
        return this.particles.concat(this.constraints).concat(this.composites);
    }

    cleanup() {
        super.cleanup()
        var cs = this.composites,
            cl = cs.length,
            i = 0;
        for (; i < cl; i++) {
            cs[i].cleanup();
        }
    }
    integrate(dt2) {
        super.integrate(dt2)
        var cs = this.composites,
            cl = cs.length,
            i = 0;
        for (; i < cl; i++) {
            cs[i].integrate(dt2);
        }

    }
    satisfyConstraints() {
        super.satisfyConstraints()
        var cs = this.composites,
            cl = cs.length,
            i = 0;
        for (; i < cl; i++) {
            cs[i].satisfyConstraints();
        }
    }
    checkCollisions() {
        if (this.collideInternal) {
            this.checkCollisionGroupInternal();
        }

        var cl = this.collisionList,
            cllen = cl.length,
            i = 0;

        for (; i < cllen; i++) {
            this.checkCollisionVsGroup(cl[i]);
        }
    }
    checkCollisionGroupInternal() {
        this.checkInternalCollisions();

        var cs = this.composites,
            c,
            c2,
            clen = cs.length,
            i = 0,
            j;

        for (; i < clen; i++) {
            c = cs[i];
            c.checkCollisionsVsCollection(this);

            for (j = i + 1; j < clen; j++) {
                c2 = cs[j];
                c.checkCollisionsVsCollection(c2);
            }
        }
    }

    checkCollisionVsGroup(g) {
        this.checkCollisionsVsCollection(g);

        var cs = this.composites,
            c,
            gc,
            clen = cs.length,
            gclen = g.composites.length,
            i = 0,
            j;

        for (; i < clen; i++) {
            c = cs[i];
            c.checkCollisionsVsCollection(g);
            for (j = 0; j < gclen; j++) {
                gc = g.composites[j];
                c.checkCollisionsVsCollection(gc);
            }
        }

        for (j = 0; j < gclen; j++) {
            gc = g.composites[j];
            this.checkCollisionsVsCollection(gc);
        }
    }
}