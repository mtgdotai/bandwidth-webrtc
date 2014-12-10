"use strict";
var BWPhone = require("./BWPhone");

function BWClient() {}

BWClient.prototype.createPhone = function (config) {
	return new BWPhone(config);
};

global.BWClient = new BWClient();