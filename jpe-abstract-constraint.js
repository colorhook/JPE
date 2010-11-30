/*!
 * @revision:
 */
/*
 * @author: <a href="zhengxie.lj@taobao.com">zhengxie</a>
 * @version:1-0-0
 */
YUI.add('jpe-abstract-constraint', function(Y) {
	
	var AbstractConstraint = function(stiffness){
		this.stiffness = stiffness;
		this.setStyle();
	}

	Y.extend(AbstractConstraint, Y.AbstractItem, {
		resolve: function(){
		}
	});

	Y.AbstractConstaint = AbstraintConstraint;

}, '1.0.0' ,{requires:['jpe-abstract-constraint']});
