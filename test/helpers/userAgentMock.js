"use strict";
var EventEmitter = require("events").EventEmitter;
function UserAgentMock(){
	var self = this;
	this.remoteStream = {};
	this.session = new EventEmitter();
	this.session.getRemoteStreams = function () {
		return [ self.remoteStream ];
	};
}
UserAgentMock.prototype.invite = function () {
	var self = this;
	setTimeout(function () {
		self.session.emit("accepted");
	},0);
	return this.session;
};
module.exports = UserAgentMock;