JPE.MathUtil = {
	
		ONE_EIGHTY_OVER_PI : 180 / Math.PI,
		PI_OVER_ONE_EIGHTY : Math.PI / 180,

		clamp: function(n, min, max) {
			if (n < min) return min;
			if (n > max) return max;
			return n;
		},
		sign: function(val) {
			if (val < 0) return -1
			return 1;
		}
	
};
