$(function() {
	var openid = _getPar("openid");
	if (openid == "") return _toast.show("非法的用户！");

	$("#user-img").attr("src", _getPar("headimgurl"));
	var nickname = _getPar("nickname");
	$("#user-name").text(nickname);

	var _callAjax = _genCallAjax("http://develop.zsgd.com:11010/auth");

	_callAjax({
		"cmd": "registerInfo",
		"openid": openid
	}, function(d) {
		if (!d.success) return _toast.show("数据获取失败！");

		// 签章进度
		d.data.registers.forEach(function(weixin) {
			$("#"+weixin).addClass("active");
		});
		$(".bar-fill").attr("data-line", d.data.registers.length).css("width", d.data.registers.length*10+"%");

		// 验证领奖
		if (d.data.registers.length == 10) {
			if (!!d.data.weixinInfo.ifchecked) {
				$("#award-input").attr("placeholder", "已经成功对奖").prop("disabled", true);
				$(".prize").show();
			} else {
				$(".prize").show();
				$("#check-award").click(function() {
					var awardKeys = $("#award-input").val().replace(/\s/g, '');
					if (awardKeys == '' || awardKeys.length < 4) return _toast.show("请输入完整信息");
					_callAjax({
						"cmd": "checkAward",
						"openid": openid,
						"keys": awardKeys
					}, function(d) {
						_toast.show(d.errMsg);
						if (d.success) $("#award-input").val("").attr("placeholder", "已经成功对奖").prop("disabled", true);
					});
				});
			}
		}

		// 注册用户
		if (d.data.weixinInfo.phone != '') {
			$(".layer").hide();
			$("#user-name").text(nickname + " " + d.data.weixinInfo.phone);
		} else {
			$(".bind_btn").click(function() {
				var name = $("#name-input").val().replace(/\s/g, ''),
						phone = $("#phone-input").val().replace(/\s/g, '');
				if (name == '' || phone == '') return _toast.show("请输入完整信息");
				_callAjax({
					"cmd": "registerWeixinInfo",
					"openid": openid,
					"name": name, 
					"phone": phone
				}, function(d) {
					_toast.show(d.errMsg);
					if (d.success) {
						// $(".layer").hide();
						$('.tel_bind').animate({bottom:'-100%'},function(){
							$('.layer').hide();
						})
						$("#user-name").text(nickname + " " + phone);
					}
				});
			});
		}
	});
});
