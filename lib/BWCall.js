"use strict";

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
			remoteAudioElement.src = global.URL.createObjectURL(remoteStream);
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