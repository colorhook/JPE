/*!
 * @revision:
 */
/*
 * @author: <a href="zhengxie.lj@taobao.com">zhengxie</a>
 * @version:1-0-0
 */
YUI.add('jpe-interval', function(Y) {
	
	var Interval = function(min, max){
		
			this.min = min;
			this.max = max;
	}

	Y.Interval = Interval;

}, '1.0.0' ,{requires:[]});
