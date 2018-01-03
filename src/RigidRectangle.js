import Vector from './Vector'
import RigidItem from './RigidItem'

export default class RigidRectangle extends RigidItem {
    constructor(x, y, width, height, radian, isFixed, mass, elasticity, friction, angularVelocity) {
        if(mass == null){
            mass = -1;
        }
        if (mass == -1) {
            mass = width * height;
        }
        radian = radian || 0;
        if (elasticity == null) {
            elasticity = 0.3;
        }
        if (friction == null) {
            friction = 0.2;
        }

        angularVelocity = angularVelocity || 0;

        super(x, y, Math.sqrt(width * width / 4 + height * height / 4),
        isFixed, mass, mass * (width * width + height * height) / 12, elasticity, friction, radian, angularVelocity);

        this._extents = [width / 2, height / 2];
        this._axes = [new Vector(0, 0), new Vector(0, 0)];
        this._normals = [];
        this._marginCenters = [];
        this._vertices = [];
        for (var i = 0; i < 4; i++) {
            this._normals.push(new Vector(0, 0));
            this._marginCenters.push(new Vector(0, 0));
            this._vertices.push(new Vector(0, 0));
        }
    }
    getProjection(axis) {
        var axes = this.getAxes(),
            extents = this.getExtents(),
            radius = extents[0] * Math.abs(axis.dot(axes[0])) +
                extents[1] * Math.abs(axis.dot(axes[1]));

        var c = this.samp.dot(axis);
        this.interval.min = c - radius;
        this.interval.max = c + radius;
        return this.interval;
    }
    captures(vertex) {
        var marginCenters = this.getMarginCenters();
        for (var i = 0; i < marginCenters.length; i++) {
            var x = vertex.minus(marginCenters[i].plus(this.samp)).dot(this.getNormals()[i]);
            if (x > 0.01) {
                return false;
            }
        }
        return true;
    }
    getMarginCenters() {
        return this._marginCenters;
    }
    getNormals() {
        return this._normals;
    }
    getExtents() {
        return this._extents;
    }
    getAxes() {
        return this._axes;
    }
    setAxes(n) {
        var s = Math.sin(n);
        var c = Math.cos(n);
        var axes = this.getAxes();
        var extents = this.getExtents();

        var _normals = this._normals;
        var _marginCenters = this._marginCenters;
        var _vertices = this._vertices;
        axes[0].x = c;
        axes[0].y = s;
        axes[1].x = -s;
        axes[1].y = c;
        //
        _normals[0].copy(axes[0]);
        _normals[1].copy(axes[1]);
        _normals[2] = axes[0].mult(-1);
        _normals[3] = axes[1].mult(-1);

        //.plusEquals(curr)
        _marginCenters[0] = axes[0].mult(extents[0]);
        _marginCenters[1] = axes[1].mult(extents[1]);
        _marginCenters[2] = axes[0].mult(-extents[0]);
        _marginCenters[3] = axes[1].mult(-extents[1]);

        //.minusEquals(curr)
        _vertices[0] = _marginCenters[0].plus(_marginCenters[1]);
        _vertices[1] = _marginCenters[1].plus(_marginCenters[2]);
        _vertices[2] = _marginCenters[2].plus(_marginCenters[3]);
        _vertices[3] = _marginCenters[3].plus(_marginCenters[0]);
    }
    getVertices() {
        var r = [];
        var _vertices = this._vertices;
        for (var i = 0; i < _vertices.length; i++) {
            r.push(_vertices[i].plus(this.samp));
        }
        return r;
    }
}