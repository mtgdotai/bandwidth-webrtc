"use strict";
require("../../lib/BWClient");
var expect = require("chai").expect;
var sinon = require("sinon");
var SIP = require("sip.js");
var BWPhone = require("../../lib/BWPhone");
var UserAgentMock = require("../helpers/userAgentMock");
var GetUserMediaMock = require("../helpers/getUserMediaMock");
var getUserMediaMock = new GetUserMediaMock();
var MediaStreamTrackMock = require("../helpers/MediaStreamTrackMock");

global.navigator = {
	getUserMedia : getUserMediaMock.getUserMedia
};
global.MediaStreamTrack = new MediaStreamTrackMock();

describe("BWClient", function () {
	it("should declare BWClient as a global",function () {
		expect(global.BWClient).to.not.equal(undefined);
	});
	describe(".createPhone()",function () {
		var validConfig;
		var phone;
		before(function () {
			sinon.stub(SIP,"UA",function (config) {
				return new UserAgentMock(config);
			});
			validConfig = {
				username : "nathan",
				domain   : "domain.com",
				password : "taco123"
			};
			phone = global.BWClient.createPhone(validConfig);
		});
		after(function () {
			SIP.UA.restore();
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