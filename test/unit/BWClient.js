"use strict";
require("../../lib/BWClient");
var expect = require("chai").expect;
var sinon = require("sinon");
var SIP = require("sip.js");
var BWPhone = require("../../lib/BWPhone");
var UserAgentMock = require("../helpers/userAgentMock");

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
});