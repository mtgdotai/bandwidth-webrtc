"use strict";
var URL = global.URL || require("../test/helpers/URLMock");

function BWCall(userAgent) {
	var self = this;
	var callOptions = {
		media : {
			constraints : {
				audio : true,
				video : false
			}
		}
	};
	var remoteAudioElement = null;
	var session = null;

	this.setRemoteAudioElement = function (element) {
		remoteAudioElement = element;
		if (remoteAudioElement && session){
			var remoteStream = session.getRemoteStreams()[0];
			remoteAudioElement.src = URL.createObjectURL(remoteStream);
			remoteAudioElement.play();
		}
	};

	this.dial = function (uri) {
		session = userAgent.invite(uri, callOptions);
		session.on("accepted",function () {
			self.setRemoteAudioElement(remoteAudioElement);
		});
	};

}
module.exports = BWCall;