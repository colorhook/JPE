define("JPE/Engine", function(require, exports, module) {

    module.exports = {
        forces: null,
        masslessForce: null,
        groups: null,
        numGroups: 0,
        timeStep: 0,
        renderer: null,
        damping: 1,
        constraintCycles: 0,
        constraintCollisionCycles: 1,

        init: function(dt) {
            if (isNaN(dt)) {
                dt = 0.25;
            }
            this.timeStep = dt * dt;
            this.groups = [];
            this.forces = [];
        },
        addForce: function(v) {
            this.forces.push(v);
        },
        removeForce: function(v) {
            JPE.Array.remove(this.forces, v);
        },
        removeAllForce: function() {
            this.forces = [];
        },
        addGroup: function(g) {
            this.groups.push(g);
            g.isParented = true;
            this.numGroups++;
            g.initSelf();
        },
        removeGroup: function(g) {
            var gpos = JPE.Array.indexOf(this.groups, g);
            if (gpos == -1) {
                return;
            }
            this.groups.splice(gpos, 1);
            g.isParented = false;
            this.numGroups--;
            g.cleanup();
        },
        step: function() {
            this.integrate();
            for (var j = 0; j < this.constraintCycles; j++) {
                this.satisfyConstraints();
            }
            for (var i = 0; i < this.constraintCollisionCycles; i++) {
                this.satisfyConstraints();
                this.checkCollisions();
            }
        },
        paint: function() {
            for (var j = 0; j < this.numGroups; j++) {
                var g = this.groups[j];
                g.paint();
            }
        },
        integrate: function() {
            for (var j = 0; j < this.numGroups; j++) {
                var g = this.groups[j];
                g.integrate(this.timeStep);
            }
        },
        satisfyConstraints: function() {
            for (var j = 0; j < this.numGroups; j++) {
                var g = this.groups[j];
                g.satisfyConstraints();
            }
        },
        checkCollisions: function() {
            for (var j = 0; j < this.numGroups; j++) {
                var g = this.groups[j];
                g.checkCollisions();
            }
        }
    }
});