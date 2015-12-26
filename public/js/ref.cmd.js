/*global window, define, console, $, navigator*/

define(function (require) {
    'use strict';

    var $ = require("jquery"),
        layer = require("layer");

    return {
        "set": function (k, v) {
            window.localStorage.setItem(k, v);
        },

        "get": function (k) {
            return window.localStorage.getItem(k);
        },

        "tell": function (msg) {
            console.log(JSON.stringify(msg));
        },

        "genCallAjax": function (url) {
            return function (data, cb) {
                var index = layer.load();
                $.ajax({
                    type: "GET",
                    async: true,
                    url: url,
                    dataType: "jsonp",
                    jsonp: "callback",
                    data: $.extend(data, {token: 'Jh2044695'}),
                    contentType: "multipart/form-data; charset=UTF-8",
                    success: function (d) {
                        this.tell(d);
                        if (!!cb) {
                            cb(d);
                        }
                        index.close();
                    },
                    error: function () {
                        index.close();
                    }
                });
            };
        },

        "show": function (msg) {
            layer.msg(msg);
        },

        "confirm": function (msg, cb1, cb2) {
            layer.confirm(
                msg,
                ["确定", "取消"],
                cb1,
                cb2
            );
        },

        "getDev": function () {
            var dvc = navigator.userAgent.toLowerCase();
            if (/iphone|ipod|ipad/gi.test(dvc)) {
                return 'iOS';
            }
            if (/android/gi.test(dvc)) {
                return 'Android';
            }
            return 'Unkown device';
        },

        "callApi": function (cmd) {
            var dev = this.getDev();
            if (dev === 'iOS') {
                window.location.hash = '';
                window.location.hash = '#func=' + cmd;
            } else if (dev === 'Android') {
                window.android[cmd]();
            }
        }

    };
});
