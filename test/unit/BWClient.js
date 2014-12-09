"use strict";
require("../../lib/BWClient");
var expect = require("chai").expect;

describe("The Bandwidth WebRTC client", function () {
	it("should declare BWClient as a global",function () {
		expect(global.BWClient).to.not.equal(undefined);
	});
});