define("JPE/MathUtil", function(require, exports, module) {

    exports.ONE_EIGHTY_OVER_PI = 180 / Math.PI;
    exports.PI_OVER_ONE_EIGHTY = Math.PI / 180;

    exports.clamp = function(n, min, max) {
        if (n < min) return min;
        if (n > max) return max;
        return n;
    };
    exports.sign = function(val) {
        if (val < 0) return -1
        return 1;
    };

});