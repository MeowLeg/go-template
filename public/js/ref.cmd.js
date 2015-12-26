/*global window, define, console, $*/

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

		"loading": function () {
			
		}
	};
});
