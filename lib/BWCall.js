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
	var ringingAudio =  new global.Audio("https://d23gfec6haquvp.cloudfront.net/media/ring.ogg");
	data.info.status = "connecting";
	data.info.microphoneMuted = false;

	var dtmfSenders = [];

	if (data.info.direction === "out"){
		//do not invite until next tick, to allow event listeners to attach
		setTimeout(function () {
			data.session = data.userAgent.invite(data.info.remoteUri, callOptions);
			data.session.on("accepted",onAccepted);
			data.session.on("rejected",onCallEnded);
			data.session.on("bye",onCallEnded);
			data.session.on("cancel",onCallEnded);
			data.session.on("progress",function () {
				playRinging();
			});
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
		var duration = 150;
		dtmfSenders = _.map(localStreams, function (stream) {
			var track = stream.getAudioTracks()[ 0 ];
			var sender = peerConnection.createDTMFSender(track, duration);
			sender.ontonechange = function (tone) {
				if (tone && tone.tone) {
					var dtmfFrequencies = {
						1   : { low  : 697, high : 1209 },
						2   : { low  : 697, high : 1336 },
						3   : { low  : 697, high : 1447 },
						A   : { low  : 697, high : 1633 },
						4   : { low  : 770, high : 1209 },
						5   : { low  : 770, high : 1336 },
						6   : { low  : 770, high : 1447 },
						B   : { low  : 770, high : 1633 },
						7   : { low  : 852, high : 1209 },
						8   : { low  : 852, high : 1336 },
						9   : { low  : 852, high : 1447 },
						C   : { low  : 852, high : 1633 },
						"*" : { low  : 941, high : 1209 },
						0   : { low  : 941, high : 1336 },
						"#" : { low  : 941, high : 1447 },
						D   : { low  : 941, high : 1633 }
					};

					var frequencies = dtmfFrequencies[tone.tone];

					var lowOscillator = global.BWClient.audioCtx.createOscillator();
					var highOscillator = global.BWClient.audioCtx.createOscillator();

					var gainNode = global.BWClient.audioCtx.createGain();

					lowOscillator.connect(gainNode);
					highOscillator.connect(gainNode);
					gainNode.connect(global.BWClient.audioCtx.destination);

					lowOscillator.type = "sine";
					lowOscillator.frequency.value = frequencies.low;

					highOscillator.type = "sine";
					highOscillator.frequency.value = frequencies.high;

					lowOscillator.start();
					highOscillator.start();

					setTimeout(function () {
						lowOscillator.stop();
						highOscillator.stop();
					}, duration);
				}
			};

			return sender;
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
