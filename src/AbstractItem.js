define("JPE/AbstractItem", function(require, exports, module) {

    var JPE = require("JPE/JPE");
    var Signal = require("JPE/Signal");
    var Engine = require("JPE/Engine");

    var AbstractItem = function() {
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

    JPE.mix(AbstractItem.prototype, {
        get: function(name) {
            return this._pool[name];
        },
        set: function(name, value) {
            this._pool[name] = value;
        },
        initSelf: function() {
            var initSelfFunction = this.initSelfFunction || this.constructor.initSelfFunction;
            if (JPE.isFunction(initSelfFunction)) {
                initSelfFunction(this);
            } else {
                Engine.renderer.initSelf(this);
            }
            this.paint();
        },
        cleanup: function() {
            var cleanupFunction = this.cleanupFunction || this.constructor.cleanupFunction;
            if (JPE.isFunction(cleanupFunction)) {
                cleanupFunction(this);
            } else {
                Engine.renderer.cleanup(this);
            }
        },
        paint: function() {
            this.render();
        },

        render: function() {
            this.beforeRenderSignal.dispatch(this);
            var renderFunction = this.renderFunction || this.constructor.renderFunction;
            if (JPE.isFunction(renderFunction)) {
                renderFunction(this);
            } else {
                Engine.renderer.render(this);
            }
            this.afterRenderSignal.dispatch(this);
        },

        /**
         * visible setter & getter
         */
        getVisible: function() {
            return this._visible;
        },
        setVisible: function(value) {
            if (value == this._visible) {
                return;
            }
            this._visible = value;
            Engine.renderer.setVisible(this);
        },
        /**
         * awaysRepaint setter & getter
         */
        getAlwaysRepaint: function() {
            return this._alwaysRepaint;
        },
        setAlwaysRepaint: function(value) {
            this._alwaysRepaint = value
        },
        setStyle: function(lineThickness, lineColor, lineAlpha, fillColor, fillAlpha) {
            lineThickness = lineThickness || 0;
            lineColor = lineColor || 0x000;
            lineAlpha = lineAlpha || 1;
            fillColor = fillColor || 0x000;
            fillAlpha = fillAlpha || 1;
            this.setLine(lineThickness, lineColor, lineAlpha);
            this.setFill(fillColor, fillAlpha);
        },
        /**
         * Sets the style of the line for this Item. 
         */
        setLine: function(thickness, color, alpha) {
            this.lineThickness = thickness;
            this.lineColor = color;
            this.lineAlpha = alpha;
        },

        /**
         * Sets the style of the fill for this Item. 
         */
        setFill: function(color, alpha) {
            this.fillColor = color;
            this.fillAlpha = alpha;
        }
    });

    module.exports = AbstractItem;

});