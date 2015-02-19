"use strict";
var BWCall = require("../../lib/BWCall");
var expect = require("chai").expect;
var sinon = require("sinon");
var UserAgentMock = require("../helpers/userAgentMock");
global.URL = require("../helpers/URLMock");
global.Audio = require("../helpers/AudioMock");

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
		sinon.spy(userAgentMock.dtmfSender,"insertDTMF");
		sinon.spy(userAgentMock.session,"bye");
		sinon.spy(userAgentMock.session,"mute");
		sinon.spy(userAgentMock.session,"unmute");
		sinon.spy(global.Audio.getMockElement(),"play");
		sinon.spy(global.Audio.getMockElement(),"pause");
		audioElement = {
			play : sinon.spy(),
			src  : false
		};

		bwCall = new BWCall(
		{
			info      : {
				direction : "out",
				localUri  : "localUri",
				localId   : "localId",
				remoteUri : "remoteUri",
				remoteId  : "remoteId"
			},
			userAgent : userAgentMock
		});
		beforeConnectedInfo = bwCall.getInfo();
		bwCall.setRemoteAudioElement(audioElement);

		bwCall.on("connected",function () {
			afterConnectedInfo = bwCall.getInfo();
			bwCall.sendDtmf("1");
			bwCall.mute();
			bwCall.unmute();
			bwCall.hangup();
			invalidDtmfFunc = function () {
				bwCall.sendDtmf("123");
			};
		});
		bwCall.on("ended",function () {
			bwCall.getInfo().status = "invalid status";
			callEndedInfo = bwCall.getInfo();

			dtmfAfterEndedFunc = function () {
				bwCall.sendDtmf("1");
			};
			nullDtmfFunc = function () {
				bwCall.sendDtmf(null);
			};
			done();
		});
		bwCall.on("connecting",function () {
			userAgentMock.session.emit("progress");
			setTimeout(function () {//allow time for mock ringing to loop (loops every 10 ms)
				userAgentMock.mockReceiveAccept();
			},500);
		});
	});
	describe("constructor()",function () {
		it("calls userAgent.invite(uri, callOptions)",function () {
			expect(userAgentMock.invite.calledOnce).to.equal(true);
		});
	});
	describe("outbound call ringing",function () {
		it("starts",function () {
			expect(global.Audio.getMockElement().play.called).to.equal(true);
		});
		it("stops",function () {
			expect(global.Audio.getMockElement().pause.called).to.equal(true);
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
			expect(userAgentMock.dtmfSender.insertDTMF.called).to.equal(true);
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
	describe(".mute()",function () {
		it ("calls session.mute()",function () {
			expect(userAgentMock.session.mute.calledOnce).to.equal(true);
		});
	});
	describe(".unmute()",function () {
		it ("calls session.unmute()",function () {
			expect(userAgentMock.session.unmute.calledOnce).to.equal(true);
		});
	});
	describe(".accept() (valid)",function () {
		var bwCall;
		var session;
		before(function (done) {
			session = new UserAgentMock().session;
			sinon.spy(session,"accept");
			bwCall = new BWCall({
				info    : {
					direction : "in",
					localUri  : "localUri",
					localId   : "localId",
					remoteUri : "remoteUri",
					remoteId  : "remoteId"
				},
				session : session
			});
			bwCall.accept();
			bwCall.on("ended",done);
			session.emit("bye");//receive hangup from remote-end
		});
		it("should accept the call",function () {
			expect(session.accept.calledOnce).to.equal(true);
		});
	});
	describe(".accept() (invalid)",function () {
		var bwCall;
		before(function () {
			var session = new UserAgentMock().session;
			sinon.spy(session,"accept");
			bwCall = new BWCall({
				info      :{
					direction : "out",
					localUri  : "localUri",
					localId   : "localId",
					remoteUri : "remoteUri",
					remoteId  : "remoteId"
				},
				userAgent : new UserAgentMock()
			});
		});
		it("should throw an exception",function () {
			expect(bwCall.accept).to.throw(Error);
		});
	});
	describe(".reject() (valid)",function () {
		var bwCall;
		var session;
		before(function () {
			session = new UserAgentMock().session;
			sinon.spy(session,"reject");
			bwCall = new BWCall({
				info    :{
					direction : "in",
					localUri  : "localUri",
					localId   : "localId",
					remoteUri : "remoteUri",
					remoteId  : "remoteId"
				},
				session : session
			});
			bwCall.reject();
		});
		it("should reject the call",function () {
			expect(session.reject.calledOnce).to.equal(true);
		});
	});
	describe(".reject() (invalid)",function () {
		var bwCall;
		before(function () {
			var session = new UserAgentMock().session;
			sinon.spy(session,"reject");
			bwCall = new BWCall({
				info      :{
					direction : "out",
					localUri  : "localUri",
					localId   : "localId",
					remoteUri : "remoteUri",
					remoteId  : "remoteId"
				},
				userAgent : new UserAgentMock()
			});
		});
		it("should throw an exception",function () {
			expect(bwCall.reject).to.throw(Error);
		});
	});
	describe("outgoing call is rejected",function () {
		var bwCall;
		before(function (done) {
			var userAgent = new UserAgentMock();
			bwCall = new BWCall({
				info      :{
					direction : "out",
					localUri  : "localUri",
					localId   : "localId",
					remoteUri : "remoteUri",
					remoteId  : "remoteId"
				},
				userAgent : userAgent
			});
			bwCall.on("ended",done);
			bwCall.on("connecting",function () {
				userAgent.session.emit("rejected");//simulate remote-end rejecting incoming call
			});
		});
		it("call should end",function () {
			expect(bwCall.getInfo().status).to.equal("ended");
		});
	});
	describe ("outgoing call is ended before remote-end accepts",function () {
		var userAgentMock;
		var bwCall;
		before(function (done) {
			userAgentMock = new UserAgentMock();
			sinon.spy(userAgentMock.session,"cancel");

			bwCall = new BWCall({
				info      : {
					direction : "out",
					localUri  : "localUri",
					localId   : "localId",
					remoteUri : "remoteUri",
					remoteId  : "remoteId"
				},
				userAgent : userAgentMock
			});
			bwCall.on("connecting",function () {
				bwCall.hangup();
			});
			bwCall.on("ended",done);
		});
		it ("should use session.cancel instead of session.bye",function () {
			expect(userAgentMock.session.cancel.calledOnce).to.equal(true);
		});
	});
	describe ("incoming call hangs up before accept/reject",function () {
		var userAgentMock;
		var bwCall;
		before(function (done) {
			userAgentMock = new UserAgentMock();
			sinon.spy(userAgentMock.session,"cancel");

			bwCall = new BWCall({
				info      : {
					direction : "in",
					localUri  : "localUri",
					localId   : "localId",
					remoteUri : "remoteUri",
					remoteId  : "remoteId"
				},
				userAgent : userAgentMock,
				session   : userAgentMock.session
			});
			bwCall.on("ended",done);
			userAgentMock.session.emit("cancel");//remote hangup
		});
		it ("call should end",function () {
			expect(bwCall.getInfo().status).to.equal("ended");
		});
	});
	describe (".mute() before call connects",function () {
		var userAgentMock;
		var bwCall;
		before(function (done) {
			userAgentMock = new UserAgentMock();
			sinon.spy(userAgentMock.session,"mute");
			sinon.spy(userAgentMock.session,"unmute");
			bwCall = new BWCall({
				info      : {
					direction : "out",
					localUri  : "localUri",
					localId   : "localId",
					remoteUri : "remoteUri",
					remoteId  : "remoteId"
				},
				userAgent : userAgentMock
			});
			bwCall.unmute();
			bwCall.mute();
			bwCall.on("connecting",userAgentMock.mockReceiveAccept);
			bwCall.on("connected",done);
		});
		it ("session.mute should be called when call is connected",function () {
			expect(userAgentMock.session.mute.calledOnce).to.equal(true);
		});
		it ("session.unmute should have NOT been called",function () {
			expect(userAgentMock.session.unmute.calledOnce).to.equal(false);
		});
	});
	describe (".setMicrophoneId()",function () {
		var userAgentMock;
		var bwCall;
		before(function (done) {
			userAgentMock = new UserAgentMock();
			sinon.spy(userAgentMock,"invite");
			bwCall = new BWCall({
				info      : {
					direction : "out",
					localUri  : "localUri",
					localId   : "localId",
					remoteUri : "remoteUri",
					remoteId  : "remoteId"
				},
				userAgent : userAgentMock
			});
			bwCall.setMicrophoneId(42);
			bwCall.on("connecting",done);
		});
		it ("should set correct media constraints",function () {
			expect(userAgentMock.invite.getCall(0).args[ 1 ].media.constraints
				.audio.optional[ 0 ].sourceId).to.equal(42);
		});
	});
	describe (".setMicrophoneId() after call connects",function () {
		var userAgentMock;
		var bwCall;
		before(function (done) {
			userAgentMock = new UserAgentMock();
			sinon.spy(userAgentMock,"invite");
			bwCall = new BWCall({
				info      : {
					direction : "out",
					localUri  : "localUri",
					localId   : "localId",
					remoteUri : "remoteUri",
					remoteId  : "remoteId"
				},
				userAgent : userAgentMock
			});
			bwCall.on("connecting",userAgentMock.mockReceiveAccept);
			bwCall.on("connected",done);
		});
		it ("should throw an error",function () {
			expect(bwCall.setMicrophoneId,42).to.throw(Error);
		});
	});

});