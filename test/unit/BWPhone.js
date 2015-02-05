"use strict";
var BWPhone = require("../../lib/BWPhone");
var BWCall = require("../../lib/BWCall");
var expect = require("chai").expect;
var sinon = require("sinon");
var SIP = require("sip.js");
var UserAgentMock = require("../helpers/userAgentMock");
var _ = require("lodash");

describe("BWPhone", function () {
	var validConfig;
	var userAgentMock = null;
	before(function () {
		validConfig = {
			domain   : "domain.com",
			username : "nathan"
		};
		sinon.stub(SIP,"UA",function (config) {
			userAgentMock = new UserAgentMock(config);
			return userAgentMock;
		});
	});
	after(function () {
		SIP.UA.restore();
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
	describe(".on(incomingCall)",function () {
		var bwCall;
		before(function (done) {
			var bwPhone = new BWPhone(validConfig);
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
	describe(".register()",function () {
		var bwPhone;
		before(function () {
			bwPhone = new BWPhone(validConfig);
			sinon.spy(userAgentMock,"register");
			bwPhone.register();
		});
		it("should register",function () {
			expect(userAgentMock.register.calledOnce).to.equal(true);
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
	// var domain = "rocket-gw.ring.to";
	// var domain = "webrtc.bwincubator.com";
	var domain = "nfuchs.ringto.stage.bwc-clients.com";
	testCall("+12223334444", "sip:+12223334444@" + domain);
	testCall("+1 222 333 4444", "sip:+12223334444@" + domain);
	testCall("+1 (222) 333-4444", "sip:+12223334444@" + domain);
	testCall("+1(222)-333-4444", "sip:+12223334444@" + domain);
	testCall("(222)-333-4444", "sip:+12223334444@" + domain);
	testCall("2223334444", "sip:+12223334444@" + domain);
	testCall("+12223334444", "sip:+12223334444@" + domain);
	testCall("sip:a@b.c", "sip:a@b.c");
	testCall("sip:test@" + domain,"sip:test@" + domain,"test");
	testCall("test","sip:test@" + domain,"test");

});