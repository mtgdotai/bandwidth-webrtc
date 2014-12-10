"use strict";
var BWPhone = require("../../lib/BWPhone");
var expect = require("chai").expect;

describe("BWPhone", function () {
	var validConfig;
	before(function () {
		validConfig = {
			websocketProxyUrl : "ws://myAwesomeProxy.com",
			domain            : "domain.com",
			username          : "nathan"
		};
	});
	describe("constructor called with missing config",function () {
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
	describe("constructor called with config with missing username",function () {
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
	describe("constructor called with config with missing domain",function () {
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
});