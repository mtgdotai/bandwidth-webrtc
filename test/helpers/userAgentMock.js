"use strict";
var EventEmitter = require("events").EventEmitter;
function UserAgentMock(){
	var self = this;

	this.remoteStream = {};
	this.session = new EventEmitter();
	this.session.getRemoteStreams = function () {
		return [ self.remoteStream ];
	};

	this.invite = function () {
		setTimeout(function () {
			self.session.emit("accepted");
		},0);
		return self.session;
	};
}

module.exports = UserAgentMock;