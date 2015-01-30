"use strict";
var EventEmitter = require("events").EventEmitter;
var Joi = require("joi");
var _ = require("lodash");

function BWCall(data) {
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
	data.info.status = "connecting";

	if (data.info.direction === "out"){
		//do not invite until next tick, to allow event listeners to attach
		setTimeout(function () {
			data.session = data.userAgent.invite(data.info.remoteUri, callOptions);
			data.session.on("accepted",function () {
				self.setRemoteAudioElement(remoteAudioElement);
				data.info.status = "connected";
				self.emit("connected");
			});
			data.session.on("rejected",function () {
				console.log("rejected event received");
				data.info.status = "ended";
				self.emit("ended");
			});
			data.session.on("bye",function () {
				data.info.status = "ended";
				self.emit("ended");
			});
			data.session.on("cancel",function () {
				data.info.status = "ended";
				self.emit("ended");
			});
			self.emit("connecting");
		},0);
	}
	this.setRemoteAudioElement = function (element) {
		remoteAudioElement = element;
		if (remoteAudioElement && data.session){
			var remoteStream = data.session.getRemoteStreams()[0];
			remoteAudioElement.src = global.URL.createObjectURL(remoteStream);
			remoteAudioElement.play();
		}
	};

	this.getInfo = function () {
		return _.cloneDeep(data.info);
	};

	this.hangup = function () {
		if (data.info.status === "connected"){
			data.info.status = "ended";
			data.session.bye();
			data.session = null;
		}
		else if (data.info.status === "connecting"){
			data.info.status = "ended";
			data.session.cancel();
			data.session = null;
		}
		else {
			throw new Error("can only hangup a call in 'connected' or 'connecting' status");
		}
	};

	this.accept = function () {
		if (data.info.direction !== "in" || data.info.status !== "connecting"){
			throw new Error("can only accept incoming calls in 'connecting' status");
		}
		data.session.on("bye",function () {
			data.info.status = "ended";
			self.emit("ended");
		});
		data.session.on("accepted",function () {
			self.setRemoteAudioElement(remoteAudioElement);
			data.info.status = "connected";
			self.emit("connected");
		});
		data.session.accept();
	};
	this.reject = function () {
		if (data.info.direction !== "in" || data.info.status !== "connecting"){
			throw new Error("can only reject incoming calls in 'connecting' status");
		}
		data.session.reject();
		data.info.status = "ended";
		self.emit("ended");
	};
	this.mute = function () {
		if (data.info.status !== "connected"){
			throw new Error("can only mute calls in 'connected' status");
		}
		data.session.mute();
	};
	this.unmute = function () {
		if (data.info.status !== "connected"){
			throw new Error("can only unmute calls in 'connected' status");
		}
		data.session.unmute();
	};
	this.sendDtmf = function (tone) {
		tone = tone || null;
		Joi.validate(tone,Joi.string().min(1).max(1),function (err) {
			if (err){
				throw err;
			}
		});
		if (data.info.status !== "connected"){
			throw new Error("can only send DTMF when in 'connected' status");
		}
		data.session.dtmf(tone);
	};
}
BWCall.prototype = Object.create(EventEmitter.prototype);
module.exports = BWCall;