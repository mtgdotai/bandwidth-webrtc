"use strict";
require("../../lib/BWClient");
var expect = require("chai").expect;
var sinon = require("sinon");
var SIP = require("sip.js");

describe("BWClient", function () {
	it("should declare BWClient as a global",function () {
		expect(global.BWClient).to.not.equal(undefined);
	});
	it(".createPhone() should call BWPhone constructor",function () {
		sinon.stub(SIP,"UA",function () {});
		var validConfig = {
			username          : "nathan",
			websocketProxyUrl : "ws://myAwesomeProxy.com",
			domain            : "domain.com"
		};
		var phone = global.BWClient.createPhone(validConfig);
		expect(phone.constructor.name).to.equal("BWPhone");
		SIP.UA.restore();
	});
});