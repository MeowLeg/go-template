$(function() {
	_genCallAjax("http://10.10.1.237:10000/tmpl")({
		"cmd": "test"
	}, function(d) {
		_tell(d);
	});
});
