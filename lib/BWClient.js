"use strict";
function BWClient() {
	//BWPhone constructor is private, so it can only be created with a BWClient
	var BWPhone = require("./BWPhone");

	BWClient.prototype.createPhone = function (config) {
		return new BWPhone(config);
	};
}
global.BWClient = new BWClient();