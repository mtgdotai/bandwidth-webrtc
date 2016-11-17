"use strict";
var BWPhone = require("../../lib/BWPhone");
var BWCall = require("../../lib/BWCall");
var expect = require("chai").expect;
var sinon = require("sinon");
var SIP = require("sip.js");
var UserAgentMock = require("../helpers/userAgentMock");
var _ = require("lodash");
global.Notification = require("../helpers/Notification");
global.Audio = require("../helpers/AudioMock");

describe("BWPhone", function () {
	var validConfig;
	var userAgentMock = null;
	before(function () {
		validConfig = {
			domain   : "domain.com",
			username : "nathan",
			logLevel : "error",
			extraHeaders: [
				"X-User-Auth: test-token"
			]
		};
		sinon.stub(SIP,"UA",function (config) {
			userAgentMock = new UserAgentMock(config);
			return userAgentMock;
		});
	});
	after(function () {
		SIP.UA.restore();
	});
	describe("constructor(validConfig)",function () {
		var bwPhone;
		before(function () {
			bwPhone = new BWPhone(validConfig);
		});
		it("getTraceSip() should return false",function () {
			expect(bwPhone.getTraceSip()).to.equal(false);
		});
	});
	describe("constructor(undefined)",function () {
		var func;
		before(function () {
			func = function () {
				return new BWPhone(undefined);
			};
		});
		it("throws an error",function () {
			expect(func).to.throw(Error);
		});
	});
	describe("constructor(config with missing username)",function () {
		var func;
		var config;
		before(function () {
			config = _.cloneDeep(validConfig);
			delete config.username;
			func = function () {
				return new BWPhone(config);
			};
		});
		it("throws an error",function () {
			expect(func).to.throw(Error,"username is required");
		});
	});
	describe("constructor(config with missing domain)",function () {
		var func;
		var config;
		before(function () {
			config = _.cloneDeep(validConfig);
			delete config.domain;
			func = function () {
				return new BWPhone(config);
			};
		});
		it("throws an error",function () {
			expect(func).to.throw(Error,"domain is required");
		});
	});
	describe(".on(incomingCall) (denied Notification permission)",function () {
		var bwCall;
		before(function (done) {
			var bwPhone = new BWPhone(validConfig);
			global.Notification.permission = "denied";
			bwPhone.on("incomingCall", function (call) {
				bwCall = call;
				done();
			});
			userAgentMock.emit("invite",userAgentMock.session);
		});
		it("emits 'incomingCall' with a bwCall object",function () {
			expect(bwCall).is.an.instanceOf(BWCall);
		});
	});
	describe(".on(incomingCall) (allowed Notification permission)",function () {
		var bwCall;
		var clock;
		var notification;
		before(function (done) {
			clock = sinon.useFakeTimers();
			global.Notification.permission = "granted";
			global.focus = function () {};
			var bwPhone = new BWPhone(validConfig);
			bwPhone.on("notification", function (notif) {
				notification = notif;
				notification.onclick();
			});
			bwPhone.on("incomingCall", function (call) {
				bwCall = call;
				clock.tick(60 * 1000);
				done();
			});
			userAgentMock.emit("invite",userAgentMock.session);
		});
		after(function () {
			clock.restore();
		});
		it("emits 'incomingCall' with a bwCall object",function () {
			expect(bwCall).is.an.instanceOf(BWCall);
		});
	});
	describe(".register() without callsign token",function () {
		var bwPhone;
		before(function (done) {
			bwPhone = new BWPhone(validConfig);
			sinon.spy(userAgentMock,"register");
			bwPhone.on("registrationSuccess", done);
			bwPhone.register();
		});
		it("should register",function () {
			expect(userAgentMock.register.calledOnce).to.equal(true);
		});
		after(function () {
			userAgentMock.register.restore();
		});
	});
	describe(".register() with callsign token",function () {
		var bwPhone;
		before(function (done) {
			var config = _.cloneDeep(validConfig);
			config.authToken = "callsignToken0123456789asdf";
			bwPhone = new BWPhone(config);
			sinon.spy(userAgentMock,"register");
			bwPhone.register();
			setTimeout(done, 100);
		});
		it("should register",function () {
			expect(userAgentMock.register.calledOnce).to.equal(true);
			expect(userAgentMock.register.getCall(0).args[ 0 ].extraHeaders)
				.include("X-Callsign-Token: callsignToken0123456789asdf");
		});
		after(function () {
			userAgentMock.register.restore();
		});
	});
	describe(".register() emits registrationFailed after failure",function () {
		var bwPhone;
		before(function (done) {
			bwPhone = new BWPhone(validConfig);
			sinon.spy(userAgentMock,"register");
			userAgentMock.mockRegisterFail(1);
			bwPhone.on("registrationFailed", function () {
				done();
			});
			bwPhone.register();
		});
		it("should register",function () {
			expect(userAgentMock.register.calledOnce).to.equal(true);
		});
		after(function () {
			userAgentMock.register.restore();
		});
	});
	describe(".stopIncomingCallRing()", function () {
		var bwPhone;
		before(function (done) {
			bwPhone = new BWPhone(validConfig);
			sinon.spy(global.Audio.getMockElement(),"pause");
			bwPhone.on("incomingCall", function (call) {
				call.reject();
				done();
			});
			userAgentMock.emit("invite",userAgentMock.session);
		});
		it("should unregister",function () {
			expect(global.Audio.getMockElement().pause.calledOnce).to.be.true;
		});
		after(function () {
			global.Audio.getMockElement().pause.restore();
		});
	});
	describe(".unregister()",function () {
		var bwPhone;
		before(function () {
			bwPhone = new BWPhone(validConfig);
			sinon.spy(userAgentMock,"unregister");
			bwPhone.unregister();
		});
		it("should unregister",function () {
			expect(userAgentMock.unregister.calledOnce).to.equal(true);
		});
	});
	describe(".getTraceSip(true)",function () {
		var bwPhone;
		before(function () {
			var config = _.cloneDeep(validConfig);
			config.logLevel = "debug";
			bwPhone = new BWPhone(config);
		});
		it("getTraceSip() should return true",function () {
			expect(bwPhone.getTraceSip()).to.equal(true);
		});
	});

	function testLogLevel(level,shouldThrow){

		describe ("setLogLevel(" + level + ")",function () {
			var functionToTest;
			var phone;
			before(function () {
				phone = new BWPhone(validConfig);
				if (shouldThrow){
					functionToTest = function () {
						phone.setLogLevel(level);
					};
				}
				else {
					phone.setLogLevel(level);
				}
			});
			if (shouldThrow){
				it ("should throw an error",function () {
					expect(functionToTest).to.throw(Error);
				});
			}
			else {
				it ("should set the correct log level",function () {
					expect(phone.getLogLevel()).to.equal(level);
				});
			}
		});

	}
	testLogLevel("debug",false);
	testLogLevel("log",false);
	testLogLevel("warn",false);
	testLogLevel("error",false);
	testLogLevel("",true);
	testLogLevel(null,true);
	testLogLevel("asdfasdf",true);

	//Tests that the given uri calls remoteUri, and sets remoteId correctly
	function testCall(uri,remoteUri,remoteId){
		describe(".call(\"" + uri + "\")",function () {
			var userAgentMock;
			var call;

			before(function () {
				userAgentMock = new UserAgentMock();
				var phone = new BWPhone(validConfig);
				call = phone.call(uri);
			});
			it("should set correct remoteUri",function () {
				expect(call.getInfo().remoteUri).to.equal(remoteUri);
			});
			it("should set localUri",function () {
				expect(call.getInfo().localUri).to.equal("sip:nathan@domain.com");
			});
			it("should set direction = 'out'",function () {
				expect(call.getInfo().direction).to.equal("out");
			});
			it("should return a BWCall",function () {
				expect(call).is.an.instanceOf(BWCall);
			});
			if (remoteId){
				it("should set remoteId correctly",function () {
					expect(call.getInfo().remoteId).to.equal(remoteId);
				});
			}
		});
	}
	testCall("+12223334444", "sip:+12223334444@domain.com");
	testCall("+1 222 333 4444", "sip:+12223334444@domain.com");
	testCall("+1 (222) 333-4444", "sip:+12223334444@domain.com");
	testCall("+1(222)-333-4444", "sip:+12223334444@domain.com");
	testCall("(222)-333-4444", "sip:+12223334444@domain.com");
	testCall("2223334444", "sip:+12223334444@domain.com");
	testCall("+12223334444", "sip:+12223334444@domain.com");
	testCall("sip:a@b.c", "sip:a@b.c");
	testCall("sip:test@domain.com","sip:test@domain.com","test");
	testCall("test","sip:test@domain.com","test");

});