"use strict";

var expect = require("chai").expect;
var sinon = require("sinon");
var SIP = require("sip.js");
var BWPhone = require("../../lib/BWPhone");
var UserAgentMock = require("../helpers/userAgentMock");
var GetUserMediaMock = require("../helpers/getUserMediaMock");
var AudioContextMock = require("../helpers/AudioContextMock");
var getUserMediaMock = new GetUserMediaMock();
var MediaStreamTrackMock = require("../helpers/mediaStreamTrackMock");

global.navigator = {
	getUserMedia : getUserMediaMock.getUserMedia
};
global.MediaStreamTrack = new MediaStreamTrackMock();
global.AudioContext = AudioContextMock;

describe("BWClient", function () {
	before(function () {
		global.addEventListener = sinon.stub();
		sinon.stub(SIP,"UA",function (config) {
			return new UserAgentMock(config);
		});

		require("../../lib/BWClient");
	});
	after(function () {
		SIP.UA.restore();
	});
	it("should declare BWClient as a global",function () {
		expect(global.BWClient).to.not.equal(undefined);
	});
	it("should add a beforeunload handler", function () {
		expect(global.addEventListener.calledOnce, "handler not added").to.be.true;
		expect(global.addEventListener.calledWith("beforeunload", sinon.match.func));
	});
	describe("handling window unload", function () {
		var onBeforeUnload;
		before(function () {
			onBeforeUnload = global.addEventListener.firstCall.args[1];
		});
		after(function () {
			SIP.UA.reset();
		});

		describe("for one phone", function () {
			var phone;
			var unregister;
			before(function () {
				phone = global.BWClient.createPhone({
					username : "nathan",
					domain   : "domain.com",
					password : "taco123"
				});

				unregister = sinon.spy(phone, "unregister");
				onBeforeUnload();
			});
			after(function () {
				SIP.UA.reset();
				unregister.restore();
			});
			it("should unregister the phone",function () {
				expect(unregister.calledOnce, "phone1 not unregistered").to.be.true;
			});
		});

		describe("for multiple phones", function () {
			var phone1;
			var unregister1;
			var phone2;
			var unregister2;
			before(function () {
				phone1 = global.BWClient.createPhone({
					username : "nathan",
					domain   : "domain.com",
					password : "taco123"
				});
				phone2 = global.BWClient.createPhone({
					username : "test",
					domain   : "test.com",
					password : "test"
				});

				unregister1 = sinon.spy(phone1, "unregister");
				unregister2 = sinon.spy(phone2, "unregister");
				onBeforeUnload();
			});
			after(function () {
				SIP.UA.reset();
				unregister1.restore();
				unregister2.restore();
			});
			it("should unregister the phone",function () {
				expect(unregister1.calledOnce, "phone1 not unregistered").to.be.true;
				expect(unregister2.calledOnce, "phone2 not unregistered").to.be.true;
			});
		});
	});
	describe(".createPhone()",function () {
		var validConfig;
		var phone;
		before(function () {
			validConfig = {
				username : "nathan",
				domain   : "domain.com",
				password : "taco123"
			};
			phone = global.BWClient.createPhone(validConfig);
		});
		after(function () {
			SIP.UA.reset();
		});
		it("should return a BWPhone",function () {
			expect(phone).is.an.instanceOf(BWPhone);
		});
	});
	describe(".getMicrophones()",function () {
		var output;
		before(function (done) {
			global.BWClient.getMicrophones()
			.then(function (mics) {
				output = mics;
				done();
			})
			.catch(function (err) {
				throw err;
			});
			getUserMediaMock.accept();
		});
		it("output should contain 1 microphone",function () {
			expect(output.length).to.equal(1);
		});
	});
	describe("webkitGetUserMedia",function () {
		before(function (done) {
			global.navigator.getUserMedia = null;
			global.navigator.mozGetUserMedia = null;
			global.navigator.webkitGetUserMedia = sinon.spy(getUserMediaMock.getUserMedia);
			global.BWClient.getMicrophones()
			.then(function () {
				done();
			})
			.catch(function () {
				done();
			});
			getUserMediaMock.accept();
		});
		it("should use webkitGetUserMedia",function () {
			expect(global.navigator.webkitGetUserMedia.calledOnce).to.equal(true);
		});
	});
	describe("mozGetUserMedia",function () {
		before(function (done) {
			global.navigator.getUserMedia = null;
			global.navigator.webkitGetUserMedia = null;
			global.navigator.mozGetUserMedia = sinon.spy(getUserMediaMock.getUserMedia);
			global.BWClient.getMicrophones()
			.then(function () {
				done();
			})
			.catch(function () {
				done();
			});
			getUserMediaMock.accept();
		});
		it("should use mozGetUserMedia",function () {
			expect(global.navigator.mozGetUserMedia.calledOnce).to.equal(true);
		});
	});
});