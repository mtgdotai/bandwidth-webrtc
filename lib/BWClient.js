"use strict";
var BWPhone = require("./BWPhone");
var _ = require("lodash");
global.Promise = require("native-promise-only");
var globalConfig = require("./configFile.js");

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
	this.requestNotificationPermission();
}
BWClient.prototype.requestNotificationPermission = function () {
	//ask for notification permission immediately, so it can be used when needed
	if (global.Notification){
		global.Notification.requestPermission();
	}
};

BWClient.prototype.getUserMedia = function () {
	global.navigator.getUserMedia = global.navigator.getUserMedia ||
		global.navigator.webkitGetUserMedia || global.navigator.mozGetUserMedia;
	return new Promise(function (resolve, reject) {
		global.navigator.getUserMedia({
			audio : true,
			video : false
		},resolve, reject);
	});
};

BWClient.prototype.getMicrophones = function () {
	if (!global.MediaStreamTrack.getSources) {
		return Promise.resolve([ {
			id   : null,
			name : "Default"
		} ]);
	}
	return this.getUserMedia()
	.then(function () {
		return new Promise(function (resolve) {
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
		});
	});
};

BWClient.prototype.config = {
	incomingRingUrl : globalConfig.incomingCallAudio
};

global.BWClient = new BWClient();
