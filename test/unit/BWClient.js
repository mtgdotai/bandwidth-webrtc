"use strict";
require("../../lib/BWClient");
var assert = require("assert");

describe("The Bandwidth WebRTC client", function () {
	it("should declare BWClient as a global",function () {
		assert(typeof BWClient !== undefined);
	});
});