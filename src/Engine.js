class Engine{
    constructor() {
        this.forces = null
        this.masslessForce = null
        this.groups = null
        this.numGroups = 0
        timeStep = 0
        renderer = null
        damping = 1
        constraintCycles = 0
        constraintCollisionCycles = 1
    }
    init(dt) {
        if (isNaN(dt)) {
            dt = 0.25;
        }
        this.timeStep = dt * dt;
        this.groups = [];
        this.forces = [];
    }
    addForce(v) {
        this.forces.push(v);
    }
    removeForce(v) {
        const index = this.forces.indexOf(v)
        if (index != -1) {
            this.forces.splice(index, 1)
        }
    }
    removeAllForce() {
        this.forces = [];
    }
    addGroup(g) {
        this.groups.push(g);
        g.isParented = true;
        this.numGroups++;
        g.initSelf();
    }
    removeGroup(g) {
        var gpos = this.groups.indexOf(g);
        if (gpos == -1) {
            return;
        }
        this.groups.splice(gpos, 1);
        g.isParented = false;
        this.numGroups--;
        g.cleanup();
    }
    step() {
        this.integrate();
        for (var j = 0; j < this.constraintCycles; j++) {
            this.satisfyConstraints();
        }
        for (var i = 0; i < this.constraintCollisionCycles; i++) {
            this.satisfyConstraints();
            this.checkCollisions();
        }
    }
    paint() {
        for (var j = 0; j < this.numGroups; j++) {
            var g = this.groups[j];
            g.paint();
        }
    }
    integrate() {
        for (var j = 0; j < this.numGroups; j++) {
            var g = this.groups[j];
            g.integrate(this.timeStep);
        }
    }
    satisfyConstraints() {
        for (var j = 0; j < this.numGroups; j++) {
            var g = this.groups[j];
            g.satisfyConstraints();
        }
    }
    checkCollisions() {
        for (var j = 0; j < this.numGroups; j++) {
            var g = this.groups[j];
            g.checkCollisions();
        }
    }
}

module.exports = new Engine()