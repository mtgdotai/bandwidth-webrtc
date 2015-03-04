"use strict";
var EventEmitter = require("events").EventEmitter;
function UserAgentMock(){
	var self = this;

	self.remoteStream = {};
	self.localStream = {};
	self.audioTrack = {};
	self.dtmfSender = {};
	self.dtmfSender.insertDTMF = function () {

	};
	this.localStream.getAudioTracks = function () {
		return [ self.audioTrack ];
	};

	this.log = {
		level : 1
	};
	this.session = new EventEmitter();

	this.session.getRemoteStreams = function () {
		return [ self.remoteStream ];
	};

	this.session.bye = function () {
		self.session.emit("bye");
	};
	this.session.cancel = function () {
		self.session.emit("cancel");
	};
	this.session.accept = function () {
		self.session.emit("accepted");
	};
	this.session.reject = function () {};
	this.session.dtmf = function (tone) {
		self.session.emit("dtmf",tone);
	};
	this.session.mute = function () {};
	this.session.unmute = function () {};
	this.session.request = {
		headers : {
			From : [ {
				parsed : {
					uri : "remoteUriFromUserAgentMockSession"
				}
			} ]
		}
	};

	this.session.mediaHandler = {};
	this.session.mediaHandler.peerConnection = {};
	this.session.mediaHandler.peerConnection.createDTMFSender = function () {
		return self.dtmfSender;
	};

	this.session.mediaHandler.getLocalStreams = function () {
		return [ self.localStream ];
	};

	this.register = function () {};
	this.unregister = function () {};

	this.invite = function () {
		setTimeout(function () {
			self.session.emit("connecting");
		});
		return self.session;
	};
	this.mockReceiveAccept = function () {
		self.session.emit("accepted");
	};
}
UserAgentMock.prototype = Object.create(EventEmitter.prototype);
module.exports = UserAgentMock;