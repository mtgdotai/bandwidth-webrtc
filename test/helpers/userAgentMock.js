"use strict";
var EventEmitter = require("events").EventEmitter;
function UserAgentMock(){
	var self = this;

	this.remoteStream = {};
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

	this.register = function () {};
	this.unregister = function () {};

	this.invite = function () {
		setTimeout(function () {
			self.session.emit("accepted");
		},1);
		return self.session;
	};
}
UserAgentMock.prototype = Object.create(EventEmitter.prototype);
module.exports = UserAgentMock;