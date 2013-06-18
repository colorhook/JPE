define("JPE/Group", function(require, exports, module) {

    var AbstractCollection = require("JPE/AbstractCollection");
    var JPE = require("JPE/JPE");
    /**
     * @param collideInternal {Boolean} Determines if the members 
     * if this Group are checked for collision with one another.
     */
    var Group = function(collideInternal) {
        AbstractCollection.prototype.constructor.call(this);
        this.composites = [];
        this.collisionList = [];
        this.collideInternal = collideInternal;
    };

    JPE.extend(Group, AbstractCollection, {

        initSelf: function() {
            AbstractCollection.prototype.initSelf.apply(this, arguments);
            for (var i = 0, l = this.composites.length; i < l; i++) {
                this.composites[i].initSelf();
            }
        },
        /**
         * Adds a Composite to the Group
         * @param c {Composite} The Composite to be added.
         */
        addComposite: function(c) {
            this.composites.push(c);
            c.isParented = true;
            if (this.isParented) {
                c.initSelf();
            }
        },
        /**
         * Remove a Composite from the Group
         * @param c {Composite} The Composite to be removed.
         */
        removeComposite: function(c) {
            var cpos = JPE.Array.indexOf(this.composites, c);
            if (cpos === -1) {
                return;
            }
            this.composites.splice(cpos, 1);
            c.isParented = false;
            c.cleanup();
        },
        /**
         * Paints all members of this group. This method is called
         * automatically by JPE.
         */
        paint: function() {
            AbstractCollection.prototype.paint.apply(this, arguments);
            var cs = this.composites,
                i = 0,
                c,
                len = this.composites.length;
            for (; i < len; i++) {
                c = cs[i];
                c.paint();
            }
        },
        /**
         * Adds a Group instance to be checked for collision against
         * this one.
         * @param g {Group}
         */
        addCollidable: function(g) {
            this.collisionList.push(g);
        },
        /**
         * Removes a Group from the collidable list of this Group.
         * @param g {Group}
         */
        removeCollidable: function(g) {
            var pos = JPE.Array.indexOf(this.collisionList, g);
            if (pos == -1) {
                return;
            }
            this.collisionList.splice(pos, 1);
        },
        /**
         * Adds an array of AbstractCollection instances to be
         * checked for collision against this one.
         * @param list {Array}
         */
        addCollidableList: function(list) {
            var i = 0,
                l = list.length,
                cl = this.collisionList;
            for (; i < l; i++) {
                cl.push(list[i]);
            }
        },

        /**
         * Return an array of every particle, constraint, and 
         * composite added to the Group.
         */
        getAll: function() {
            return this.particles.concat(this.constraints).concat(this.composites);
        },
        /**
         * Calls the <code>cleanup()</code> methid if every member if 
         * this Group.
         * The cleanup() method is called automatically when a Group is 
         * removed form the JPE.
         */
        cleanup: function() {
            AbstractCollection.prototype.cleanup.apply(this, arguments);
            var cs = this.composites,
                cl = cs.length,
                i = 0;
            for (; i < cl; i++) {
                cs[i].cleanup();
            }
        },
        integrate: function(dt2) {
            AbstractCollection.prototype.integrate.apply(this, arguments);
            var cs = this.composites,
                cl = cs.length,
                i = 0;
            for (; i < cl; i++) {
                cs[i].integrate(dt2);
            }

        },
        satisfyConstraints: function() {
            AbstractCollection.prototype.satisfyConstraints.apply(this, null);
            var cs = this.composites,
                cl = cs.length,
                i = 0;
            for (; i < cl; i++) {
                cs[i].satisfyConstraints();
            }
        },
        checkCollisions: function() {
            if (this.collideInternal) {
                this.checkCollisionGroupInternal();
            }

            var cl = this.collisionList,
                cllen = cl.length,
                i = 0;

            for (; i < cllen; i++) {
                this.checkCollisionVsGroup(cl[i]);
            }
        },
        checkCollisionGroupInternal: function() {
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
        },
        /**
         * @param g {Group}
         */
        checkCollisionVsGroup: function(g) {
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
    });

    module.exports = Group;
});