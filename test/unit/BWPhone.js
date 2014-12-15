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
	describe(".call(sip-uri)",function () {
		var call;
		var userAgentMock;
		before(function () {
			userAgentMock = new UserAgentMock();
			var phone = new BWPhone(validConfig);
			call = phone.call("sip:a@b.c");
		});
		it("should return a BWCall",function () {
			expect(call).is.an.instanceOf(BWCall);
		});
		it("should set direction = 'out'",function () {
			expect(call.getInfo().direction).to.equal("out");
		});
		it("should set localUri",function () {
			expect(call.getInfo().localUri).to.equal("sip:nathan@domain.com");
		});
		it("should set remoteUri",function () {
			expect(call.getInfo().remoteUri).to.equal("sip:a@b.c");
		});
	});
	describe(".call(phone number)",function () {
		var call;
		var userAgentMock;
		before(function () {
			userAgentMock = new UserAgentMock();
			var phone = new BWPhone(validConfig);
			call = phone.call("+12223334444");
		});
		it("should set correct remoteUri",function () {
			expect(call.getInfo().remoteUri).to.equal("sip:+12223334444@rocket-gw.ring.to");
		});
	});
	describe(".call(invalid uri)",function () {
		var userAgentMock;
		var functionToTest;
		before(function () {
			userAgentMock = new UserAgentMock();
			var phone = new BWPhone(validConfig);
			functionToTest = function () {
				phone.call("this is invalid");
			};
		});
		it("should throw an error",function () {
			expect(functionToTest).to.throw(Error,"invalid uri");
		});
	});
});