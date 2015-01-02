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
	before(function () {
		validConfig = {
			domain   : "domain.com",
			username : "nathan"
		};
		sinon.stub(SIP,"UA",function (config) {
			return new UserAgentMock(config);
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
			config = JSON.parse(JSON.stringify(validConfig));
			delete config.domain;
			func = function () {
				return new BWPhone(config);
			};
		});
		it("throws an error",function () {
			expect(func).to.throw(Error,"domain is required");
		});
	});
	// describe(".call(sip-uri)",function () {
	// 	var call;
	// 	var userAgentMock;
	// 	before(function () {
	// 		userAgentMock = new UserAgentMock();
	// 		var phone = new BWPhone(validConfig);
	// 		call = phone.call("sip:a@b.c");
	// 	});

	// });
	//Tests that the given uri calls remoteUri, or that is throws if remoteUri is null
	function testCall(uri,remoteUri){
		describe(".call(" + uri + ")",function () {
			var userAgentMock;
			var functionToTest;

			before(function () {
				userAgentMock = new UserAgentMock();
				var phone = new BWPhone(validConfig);
				functionToTest = function () {
					return phone.call(uri);
				};
			});
			if (remoteUri){
				it("should set correct remoteUri",function () {
					expect(functionToTest().getInfo().remoteUri).to.equal(remoteUri);
				});
				it("should set localUri",function () {
					expect(functionToTest().getInfo().localUri).to.equal("sip:nathan@domain.com");
				});
				it("should set direction = 'out'",function () {
					expect(functionToTest().getInfo().direction).to.equal("out");
				});
				it("should return a BWCall",function () {
					expect(functionToTest()).is.an.instanceOf(BWCall);
				});
			}
			else {
				it("should throw an error",function () {
					expect(functionToTest).to.throw(Error,"invalid uri");
				});
			}
		});
	}
	testCall("+12223334444", "sip:+12223334444@rocket-gw.ring.to");
	testCall("+1 222 333 4444", "sip:+12223334444@rocket-gw.ring.to");
	testCall("+1 (222) 333-4444", "sip:+12223334444@rocket-gw.ring.to");
	testCall("+1(222)-333-4444", "sip:+12223334444@rocket-gw.ring.to");
	testCall("+(222)-333-4444", null);
	testCall("(222)-333-4444", "sip:+12223334444@rocket-gw.ring.to");
	testCall("2223334444", "sip:+12223334444@rocket-gw.ring.to");
	testCall("+12223334444", "sip:+12223334444@rocket-gw.ring.to");
	
	testCall("this is invalid", null);
	testCall("sip:a@b.c", "sip:a@b.c");

});