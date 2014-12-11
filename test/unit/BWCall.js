"use strict";
var BWCall = require("../../lib/BWCall");
var expect = require("chai").expect;
var sinon = require("sinon");
var UserAgentMock = require("../helpers/userAgentMock");
global.URL = require("../helpers/URLMock");

describe("BWCall", function () {
	describe(".dial()",function () {
		describe("remoteAudioElement set",function () {
			var bwCall;
			var audioElement;
			var userAgentMock;
			var beforeDialInfo;
			var connectingStatus;
			var connectedStatus;
			before(function (done) {
				userAgentMock = new UserAgentMock();
				sinon.spy(userAgentMock,"invite");
				audioElement = {
					play : sinon.spy(),
					src  : false
				};
				bwCall = new BWCall(userAgentMock,{
					direction : "out",
					status    : "idle"
				});
				beforeDialInfo = bwCall.getInfo();
				bwCall.setRemoteAudioElement(audioElement);
				bwCall.dial();
				connectingStatus = bwCall.getInfo().status;

				//give it a few ms for events to fire
				setTimeout(function () {
					connectedStatus = bwCall.getInfo().status;
					done();
				},500);
			});
			it("sets the correct audio src",function () {
				expect(audioElement.src).to.equal(userAgentMock.remoteStream);
			});
			it("calls userAgent.invite(uri, callOptions)",function () {
				expect(userAgentMock.invite.calledOnce).to.equal(true);
			});
			it("plays audio",function () {
				expect(audioElement.play.calledOnce).to.equal(true);
			});
			it("info has a status of 'idle' before .dial()",function () {
				expect(beforeDialInfo.status).to.equal("idle");
			});
			it("info has a direction of 'out' before .dial()",function () {
				expect(beforeDialInfo.direction).to.equal("out");
			});
			it("info has a status of 'connecting' after .dial()",function () {
				expect(connectingStatus).to.equal("connecting");
			});
			it("info has a status of 'connected' after the call connects",function () {
				expect(connectedStatus).to.equal("connected");
			});
		});
		describe("remoteAudioElement undefined",function () {
			var bwCall;
			var audioElement;
			var userAgentMock;
			var playAudioStub = sinon.stub();
			before(function (done) {
				userAgentMock = new UserAgentMock();
				audioElement = {
					play : playAudioStub,
					src  : false
				};
				bwCall = new BWCall(userAgentMock,{
					direction : "out",
					status    : "idle"
				});
				bwCall.dial();

				//give it a few ms for events to fire
				setTimeout(done,500);
			});
			it("sets the correct audio src",function () {
				expect(audioElement.src).to.equal(false);
			});
			it("does not play audio",function () {
				expect(playAudioStub.called).to.equal(false);
			});
		});
		describe("status is not 'idle'",function () {
			var bwCall;
			before(function () {
				var userAgentMock = new UserAgentMock();
				bwCall = new BWCall(userAgentMock,{
					direction : "out",
					status    : "ended"
				});
			});
			it("should throw an exception",function () {
				expect(bwCall.dial).to.throw(Error);
			});
		});
	});
});