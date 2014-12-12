"use strict";
var SIP = require("sip.js");
var Joi = require("joi");
var BWCall = require("./BWCall");

function BWPhone(config) {
	var configSchema = Joi.object().keys({
		username : Joi.string().required(),
		domain   : Joi.string().required().hostname(),
		password : Joi.string()
	});
	config = config || {};

	Joi.validate(config,configSchema,function (err) {
		if (err){
			throw err;
		}
	});

	var uaConfig = {
		uri               : "sip:" + config.username + "@" + config.domain,
		wsServers         : [ "wss://rocket.ring.to:10443" ],
		register          : false,
		traceSip          : true,
		authorizationUser : config.username,
		password          : config.password
	};
	var userAgent = new SIP.UA(uaConfig);

	this.call = function (uri) {
		return new BWCall(userAgent,{
			direction : "out",
			localUri  : uaConfig.uri,
			remoteUri : uri
		});
	};
}
module.exports = BWPhone;