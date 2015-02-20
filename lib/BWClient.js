"use strict";
var BWPhone = require("./BWPhone");
var _ = require("lodash");
global.Promise = require("native-promise-only");

function BWClient () {
	var phones = [];

	global.addEventListener("beforeunload", function () {
		_.forEach(phones, function (phone) {
			phone.unregister();
		});
	});

	this.createPhone = function (config) {
		var phone = new BWPhone(config);
		phones.push(phone);
		return phone;
	};
}

BWClient.prototype.getMicrophones = function () {
	return new Promise(function (resolve,reject) {
		global.navigator.getUserMedia = global.navigator.getUserMedia ||
			global.navigator.webkitGetUserMedia || global.navigator.mozGetUserMedia;

		global.navigator.getUserMedia({
			audio : true,
			video : false
		},function () {
			global.MediaStreamTrack.getSources(function (sourceInfos) {
				var output = [];
				for (var i = 0; i < sourceInfos.length; i++) {
					var info = sourceInfos[ i ];
					if (info.kind === "audio"){
						output.push({
							id   : info.id,
							name : info.label
						});
					}
				}
				resolve(output);
			});
		},reject);
	});
};

global.BWClient = new BWClient();
