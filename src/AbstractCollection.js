define("JPE/AbstractCollection", function(require, exports, module) {

    var JPE = require("JPE/JPE");
    var CollisionDetector = require("JPE/CollisionDetector");

    var AbstractCollection = function() {
        this.isParented = false;
        this.container = null;
        this.particles = [];
        this.constraints = [];
    };

    JPE.mix(AbstractCollection.prototype, {

        initSelf: function() {
            var ps = this.particles,
                cs = this.constraints,
                pl = ps.length,
                cl = cs.length,
                i;

            for (i = 0; i < pl; i++) {
                ps[i].initSelf();
            }
            for (i = 0; i < cl; i++) {
                cs[i].initSelf();
            }
        },
        /**
         * @param p {AbstractParticle}
         */
        addParticle: function(p) {
            this.particles.push(p);
            if (this.isParented) {
                p.initSelf();
            }
        },
        removeParticle: function(p) {
            var ppos = JPE.Array.indexOf(this.particles, p);
            if (ppos == -1) {
                return;
            }
            this.particles.splice(ppos, 1);
            p.cleanup();
        },
        /**
         * Adds a Composite to the Group
         * @param c {Composite} The Composite to be added.
         */
        addConstraint: function(c) {
            this.constraints.push(c);
            c.isParented = true;
            if (this.isParented) {
                c.initSelf();
            }
        },
        /**
         * Remove a Composite from the Group
         * @param c {Composite} The Composite to be removed.
         */
        removeConstraint: function(c) {
            var cpos = JPE.Array.indexOf(this.constraints, c);
            if (cpos === -1) {
                return;
            }
            this.constraints.splice(cpos, 1);
            c.cleanup();
        },
        /**
         * Paints every members of this AbstractCollection by calling each members
         * <code>paint()</code> method.
         */
        paint: function() {
            var ps = this.particles,
                cs = this.constraints,
                pl = ps.length,
                cl = cs.length,
                p,
                c,
                i;

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
        },

        getAll: function() {
            return this.particles.concat(this.constraints);
        },
        /**
         * Calls the <code>cleanup()</code> methid if every member if 
         * this Group.
         * The cleanup() method is called automatically when a Group is 
         * removed form the JPE.
         */
        cleanup: function() {
            var ps = this.particles,
                cs = this.constraints,
                pl = ps.length,
                cl = cs.length,
                i;

            for (i = 0; i < pl; i++) {
                ps[i].cleanup();
            }
            for (i = 0; i < cl; i++) {
                cs[i].cleanup();
            }
        },
        integrate: function(dt2) {

            var ps = this.particles,
                pl = ps.length,
                i = 0;
            for (; i < pl; i++) {
                ps[i].update(dt2);
            }

        },
        satisfyConstraints: function() {
            var cs = this.constraints,
                cl = cs.length,
                i = 0;
            for (; i < cl; i++) {
                cs[i].resolve();
            }
        },
        checkInternalCollisions: function() {
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
        },
        /**
         * @param ac {AbstractCollection}
         */
        checkCollisionsVsCollection: function(ac) {
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

            //constraints start
            // every constraint in this collection...
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
            //constraints end
        }
    }, true);

    module.exports = AbstractCollection;
});