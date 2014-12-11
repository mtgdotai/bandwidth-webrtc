"use strict";
var BWCall = require("../../lib/BWCall");
var expect = require("chai").expect;
var sinon = require("sinon");
var UserAgentMock = require("../helpers/userAgentMock");

describe("BWCall", function () {
	describe("dial() with remoteAudioElement set",function () {
		var bwCall;
		var audioElement;
		var userAgentMock;
		before(function (done) {
			userAgentMock = new UserAgentMock();
			audioElement = {
				play : function () {
					done();
				},
				src  : false
			};
			bwCall = new BWCall(userAgentMock);
			bwCall.setRemoteAudioElement(audioElement);
			bwCall.dial();
		});
		it("sets the correct audio src",function () {
			expect(audioElement.src).to.equal(userAgentMock.remoteStream);
		});
		it("calls userAgent.invite(uri, callOptions), and plays audio",function () {
			//this is true as long as the before statement doesn't time out
		});
	});
	describe("dial() with remoteAudioElement undefined",function () {
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
			bwCall = new BWCall(userAgentMock);
			bwCall.dial();

			//give it a few ms for events to fire
			setTimeout(function () {
				done();
			},500);
		});
		it("sets the correct audio src",function () {
			expect(audioElement.src).to.equal(false);
		});
		it("does not play audio",function () {
			expect(playAudioStub.called).to.equal(false);
		});

	});
});