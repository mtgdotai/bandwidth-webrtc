"use strict";
var EventEmitter = require("events").EventEmitter;
var Joi = require("joi");
var _ = require("lodash");

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
	callInfo.status = "connecting";
	var session = null;

	//do not invite until next tick, to allow event listeners to attach
	setTimeout(function () {
		session = userAgent.invite(callInfo.remoteUri, callOptions);
		session.on("accepted",function () {
			self.setRemoteAudioElement(remoteAudioElement);
			callInfo.status = "connected";
			self.emit("connected");
		});
	},0);

	var remoteAudioElement = null;

	this.setRemoteAudioElement = function (element) {
		remoteAudioElement = element;
		if (remoteAudioElement && session){
			var remoteStream = session.getRemoteStreams()[0];
			remoteAudioElement.src = global.URL.createObjectURL(remoteStream);
			remoteAudioElement.play();
		}
	};

	this.getInfo = function () {
		return _.cloneDeep(callInfo);
	};

	this.hangup = function () {
		if (callInfo.status !== "connected"){
			throw new Error("can only hangup a call in 'connected' status");
		}
		callInfo.status = "ended";
		self.emit("ended");
		session.bye();
		session = null;
	};

	this.sendDtmf = function (tone) {
		tone = tone || null;
		Joi.validate(tone,Joi.string().min(1).max(1),function (err) {
			if (err){
				throw err;
			}
		});
		if (callInfo.status !== "connected"){
			throw new Error("can only send DTMF when in 'connected' status");
		}
		session.dtmf(tone);
	};
}
BWCall.prototype = Object.create(EventEmitter.prototype);
module.exports = BWCall;