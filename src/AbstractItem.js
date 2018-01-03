import Signal from './Signal'
import Engine from './Engine'

export default class AbstractItem  {
    constructor() {
        this._visible = true;
        this._alwaysRepaint = true;
        this.lineTickness = 0;
        this.lineColor = 0x000000;
        this.lineAlpha = 1;
        this.fillColor = 0x333333;
        this.fillAlpha = 1;
        this.solid = true;
        this._pool = {};
        this.beforeRenderSignal = new Signal();
        this.afterRenderSignal = new Signal();
    }
    get(name) {
        return this._pool[name];
    }
    set(name, value) {
        this._pool[name] = value;
    }
    initSelf() {
        var initSelfFunction = this.initSelfFunction || this.constructor.initSelfFunction;
        if (JPE.isFunction(initSelfFunction)) {
            initSelfFunction(this);
        } else {
            Engine.renderer.initSelf(this);
        }
        this.paint();
    }
    cleanup() {
        var cleanupFunction = this.cleanupFunction || this.constructor.cleanupFunction;
        if (JPE.isFunction(cleanupFunction)) {
            cleanupFunction(this);
        } else {
            Engine.renderer.cleanup(this);
        }
    }
    paint() {
        this.render();
    }
    render() {
        this.beforeRenderSignal.dispatch(this);
        var renderFunction = this.renderFunction || this.constructor.renderFunction;
        if (JPE.isFunction(renderFunction)) {
            renderFunction(this);
        } else {
            Engine.renderer.render(this);
        }
        this.afterRenderSignal.dispatch(this);
    }
    getVisible() {
        return this._visible;
    }
    setVisible(value) {
        if (value == this._visible) {
            return;
        }
        this._visible = value;
        Engine.renderer.setVisible(this);
    }
    getAlwaysRepaint() {
        return this._alwaysRepaint;
    }
    setAlwaysRepaint(value) {
        this._alwaysRepaint = value
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