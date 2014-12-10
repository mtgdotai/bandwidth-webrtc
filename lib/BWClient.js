"use strict";
function BWClient() {
	var BWPhone = require("./BWPhone");

	BWClient.prototype.createPhone = function (config) {
		return new BWPhone(config);
	};
}
global.BWClient = new BWClient();