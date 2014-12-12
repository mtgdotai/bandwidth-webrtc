"use strict";
var BWCall = require("../../lib/BWCall");
var expect = require("chai").expect;
var sinon = require("sinon");
var UserAgentMock = require("../helpers/userAgentMock");
global.URL = require("../helpers/URLMock");

describe("BWCall", function () {
	var bwCall;
	var audioElement;
	var userAgentMock;
	var beforeConnectedInfo = null;
	var afterConnectedInfo = null;
	var callEndedInfo = null;
	var invalidDtmfFunc;
	var dtmfAfterEndedFunc;
	var nullDtmfFunc;

	before(function (done) {
		userAgentMock = new UserAgentMock();
		sinon.spy(userAgentMock,"invite");
		sinon.spy(userAgentMock.session,"dtmf");
		sinon.spy(userAgentMock.session,"bye");
		audioElement = {
			play : sinon.spy(),
			src  : false
		};
		bwCall = new BWCall(userAgentMock,{
			direction : "out",
			status    : "connecting",
			localUri  : "localUri",
			remoteUri : "remoteUri"
		});
		beforeConnectedInfo = bwCall.getInfo();
		bwCall.setRemoteAudioElement(audioElement);

		bwCall.on("connected",function () {
			afterConnectedInfo = bwCall.getInfo();
			bwCall.sendDtmf("1");
			bwCall.hangup();
			invalidDtmfFunc = function () {
				bwCall.sendDtmf("123");
			};
		});
		bwCall.on("ended",function () {
			callEndedInfo = bwCall.getInfo();
			dtmfAfterEndedFunc = function () {
				bwCall.sendDtmf("1");
			};
			nullDtmfFunc = function () {
				bwCall.sendDtmf(null);
			};
			done();
		});
	});
	describe("constructor()",function () {
		it("calls userAgent.invite(uri, callOptions)",function () {
			expect(userAgentMock.invite.calledOnce).to.equal(true);
		});
	});
	describe(".setRemoteAudioElement()", function () {
		it("sets the correct audio src",function () {
			expect(audioElement.src).to.equal(userAgentMock.remoteStream);
		});
		it("plays audio",function () {
			expect(audioElement.play.calledOnce).to.equal(true);
		});
	});
	describe(".getInfo().status", function () {
		it("is 'connecting' before call is connected",function () {
			expect(beforeConnectedInfo.status).to.equal("connecting");
		});
		it("is 'connected' after call is connected",function () {
			expect(afterConnectedInfo.status).to.equal("connected");
		});
	});
	describe(".dtmf()",function () {
		it("should call dtmf() on the session",function () {
			expect(userAgentMock.session.dtmf.calledOnce).to.equal(true);
		});
		it("should throw error if tone length != 1",function () {
			expect(invalidDtmfFunc).to.throw(Error);
		});
		it("should throw error if call status is not 'connected'",function () {
			expect(dtmfAfterEndedFunc).to.throw(Error,"can only send DTMF when in 'connected' status");
		});
		it("should throw error if tone is not a string",function () {
			expect(nullDtmfFunc).to.throw(Error);
		});
	});
	describe(".hangup()",function () {
		it("should call bye() on the session",function () {
			expect(userAgentMock.session.bye.calledOnce).to.equal(true);
		});
		it("should set the status to 'ended'",function () {
			expect(callEndedInfo.status).to.equal("ended");
		});
		it("should throw exception if called when not connected",function () {
			expect(bwCall.hangup).to.throw(Error);
		});
	});
});