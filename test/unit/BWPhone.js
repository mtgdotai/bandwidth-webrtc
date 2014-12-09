"use strict";
var BWPhone = require("../../lib/BWPhone");
var expect = require("chai").expect;
//var sinon = require("sinon");
//var SIP = require("sip.js");

describe("BWPhone", function () {
	var validConfig = {
		websocketProxyUrl : "ws://myAwesomeProxy.com",
		domain            : "domain.com",
		username          : "nathan"
	};
	it("constructor should require config object",function () {
		function test(){
			return new BWPhone(undefined);
		}
		expect(test).to.throw(Error,"configuration object is required");
	});
	it("constructor should require username",function () {
		var config = JSON.parse(JSON.stringify(validConfig));
		delete config.username;
		function test(){
			return new BWPhone(config);
		}
		expect(test).to.throw(Error,"username is required");
	});
	it("constructor should require websocketProxyUrl",function () {
		var config = JSON.parse(JSON.stringify(validConfig));
		delete config.websocketProxyUrl;
		function test(){
			return new BWPhone(config);
		}
		expect(test).to.throw(Error,"websocketProxyUrl is required");
	});
	it("constructor should require domain",function () {
		var config = JSON.parse(JSON.stringify(validConfig));
		delete config.domain;
		function test(){
			return new BWPhone(config);
		}
		expect(test).to.throw(Error,"domain is required");
	});
});