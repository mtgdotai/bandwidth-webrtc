"use strict";
var BWPhone = require("./BWPhone");
global.Promise = require("native-promise-only");
//console.log("PROMISE:",Promise);

function BWClient() {}

BWClient.prototype.createPhone = function (config) {
	return new BWPhone(config);
};
BWClient.prototype.getMicrophones = function () {
	return new Promise(function (resolve,reject) {
		console.log("INSIDE PROMISE");
		var getUserMedia = global.navigator.getUserMedia ||
			global.navigator.webkitGetUserMedia || global.navigator.mozGetUserMedia;

		getUserMedia({
			audio : true,
			video : false
		},function () {
			console.log("GOT USER MEDIA");
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