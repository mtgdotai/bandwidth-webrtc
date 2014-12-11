"use strict";

function BWCall(userAgent,callInfo) {
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
		if(callInfo.status !== "idle"){
			throw new Error("can only dial when in 'idle' status");
		}
		callInfo.status = "connecting";
		session = userAgent.invite(uri, callOptions);
		session.on("accepted",function () {
			self.setRemoteAudioElement(remoteAudioElement);
			callInfo.status
		});
	};

	this.getInfo = function () {
		return JSON.parse(JSON.stringify(callInfo));
	}

}
module.exports = BWCall;