"use strict";
var EventEmitter = require("events").EventEmitter;
var Joi = require("joi");
var _ = require("lodash");
var globalConfig = require("./configFile.js");

function BWCall(data) {
	var self = this;
	var callOptions = {
		media        : {
			constraints : {
				audio : true,
				video : false
			}
		},
		extraHeaders : []
	};
	if (data.callsignToken){
		callOptions.extraHeaders.push("X-Callsign-Token: " + data.callsignToken);
	}
	var remoteAudioElement = new global.Audio();
	var ringingAudio =  new global.Audio(globalConfig.ringAudio);
	data.info.status = "connecting";
	data.info.microphoneMuted = false;

	var dtmfSenders = [];

	if (data.info.direction === "out"){
		//do not invite until next tick, to allow event listeners to attach
		setTimeout(function () {
			data.session = data.userAgent.invite(data.info.remoteUri, callOptions);
			data.session.on("connecting",function () {
				playRinging();
			});
			data.session.on("accepted",onAccepted);
			data.session.on("rejected",onCallEnded);
			data.session.on("bye",onCallEnded);
			data.session.on("cancel",onCallEnded);
			self.emit("connecting");
		},0);
	}
	else {
		data.session.on("cancel",onCallEnded);
	}
	this.setMicrophoneId = function (id) {
		if (data.info.status !== "connecting"){
			throw new Error("must set microphone before the call connects");
		}
		callOptions.media.constraints.audio = {
			optional :[
				{
					sourceId : id
				}
			]
		};
	};
	this.setRemoteAudioElement = function (element) {
		remoteAudioElement = element;
		if (remoteAudioElement && data.session){
			var remoteStream = data.session.getRemoteStreams()[ 0 ];
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
		data.session.on("accepted",onAccepted);
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
		data.info.microphoneMuted = true;
		if (data.session){
			data.session.mute();
		}
	};
	this.unmute = function () {
		data.info.microphoneMuted = false;
		if (data.session){
			data.session.unmute();
		}
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

		_.forEach(dtmfSenders, function (dtmfSender) {
			dtmfSender.insertDTMF(tone);
		});
	};
	function configureDTMF () {
		var peerConnection = data.session.mediaHandler.peerConnection;
		var localStreams = data.session.mediaHandler.getLocalStreams();
		dtmfSenders = _.map(localStreams, function (stream) {
			var track = stream.getAudioTracks()[ 0 ];
			return peerConnection.createDTMFSender(track);
		});
	}

	function onCallEnded () {
		data.info.status = "ended";
		stopRinging();
		self.emit("ended");
	}
	function playRinging () {
		ringingAudio.currentTime = 0;
		ringingAudio.addEventListener("ended",ringingEndedHandler);
		ringingAudio.play();
	}
	function stopRinging () {
		ringingAudio.removeEventListener("ended",ringingEndedHandler);
		ringingAudio.pause();
	}
	function ringingEndedHandler () {
		ringingAudio.currentTime = 0;
		ringingAudio.play();
	}

	function onAccepted () {
		stopRinging();
		if (data.info.microphoneMuted){
			self.mute();
		}
		self.setRemoteAudioElement(remoteAudioElement);
		configureDTMF();
		data.info.status = "connected";
		self.emit("connected");
	}
}
BWCall.prototype = Object.create(EventEmitter.prototype);
module.exports = BWCall;
