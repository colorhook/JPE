import Engine from './Engine'

export default class AbstractItem  {
    constructor() {
        this._solid = true;
        this._visible = true;
        this._alwaysRepaint = true;
        this.lineTickness = 0;
        this.lineColor = 0x000000;
        this.lineAlpha = 1;
        this.fillColor = 0x333333;
        this.fillAlpha = 1;
    }
    init() {
        Engine.renderer.init(this);
        this.paint();
    }
    cleanup() {
        Engine.renderer.cleanup(this);
    }
    paint() {
        this.render();
    }
    render() {
        Engine.renderer.render(this);
    }
    get visible() {
        return this._visible;
    }
    set visible(value) {
        if (value == this._visible) {
            return;
        }
        this._visible = value;
        Engine.renderer.setVisible(this);
    }
    get alwaysRepaint() {
        return this._alwaysRepaint;
    }
    set alwaysRepaint(value) {
        this._alwaysRepaint = value
    }
    get solid() {
        return this._solid;
    }
    set solid(value) {
        this._solid = value
    }
    setStyle(lineThickness, lineColor, lineAlpha, fillColor, fillAlpha) {
        lineThickness = lineThickness || 0;
        lineColor = lineColor || 0x000;
        lineAlpha = lineAlpha || 1;
        fillColor = fillColor || 0x000;
        fillAlpha = fillAlpha || 1;
        this.setLine(lineThickness, lineColor, lineAlpha);
        this.setFill(fillColor, fillAlpha);
    }
    setLine(thickness, color, alpha) {
        this.lineThickness = thickness;
        this.lineColor = color;
        this.lineAlpha = alpha;
    }
    setFill(color, alpha) {
        this.fillColor = color;
        this.fillAlpha = alpha;
    }
}