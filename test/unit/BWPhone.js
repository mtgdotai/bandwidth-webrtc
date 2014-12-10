"use strict";
var BWPhone = require("../../lib/BWPhone");
var expect = require("chai").expect;
var sinon = require("sinon");
var SIP = require("sip.js");

describe("BWPhone", function () {
	var validConfig;
	before(function () {
		validConfig = {
			domain   : "domain.com",
			username : "nathan"
		};
		sinon.stub(SIP,"UA",function () {});
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
			config = JSON.parse(JSON.stringify(validConfig));
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
	describe(".createCall()",function () {
		var call;
		before(function () {
			var phone = global.BWClient.createPhone(validConfig);
			call = phone.createCall();
		});
		it("should return a BWCall",function () {
			expect(call.constructor.name).to.equal("BWCall");
		});
	});
});