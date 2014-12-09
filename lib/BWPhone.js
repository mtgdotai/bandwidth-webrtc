"use strict";
var SIP = require("sip.js");
function BWPhone(config) {
	function checkConfigValidity(){
		if (!config){
			throw new Error("configuration object is required");
		}
		if (!config.username){
			throw new Error("username is required");
		}
		if (!config.domain){
			throw new Error("domain is required");
		}
	}

	checkConfigValidity(config);

	var userAgent = new SIP.UA({
		uri               : "sip:" + config.username + "@" + config.domain,
		register          : config.register || false,
		wsServers         : [ "wss://rocket.ring.to:10443" ],
		traceSip          : true,
		authorizationUser : config.username,
		password          : config.password
	});

	//temporary - using userAgent until it is actually used,
	//otherwise style checking complains
	userAgent = userAgent;
}
module.exports = BWPhone;