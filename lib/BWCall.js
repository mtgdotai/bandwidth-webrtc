"use strict";
var EventEmitter = require("events").EventEmitter;
var Joi = require("joi");

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
		if (callInfo.status !== "idle"){
			throw new Error("can only dial when in 'idle' status");
		}
		callInfo.status = "connecting";
		self.emit("connecting");
		session = userAgent.invite(uri, callOptions);
		session.on("accepted",function () {
			self.setRemoteAudioElement(remoteAudioElement);
			callInfo.status = "connected";
			self.emit("connected");
		});
	};

	this.getInfo = function () {
		return JSON.parse(JSON.stringify(callInfo));
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