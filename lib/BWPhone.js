"use strict";
var SIP = require("sip.js");
var Joi = require("joi");
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

	var userAgent = new SIP.UA({
		uri               : "sip:" + config.username + "@" + config.domain,
		wsServers         : [ "wss://rocket.ring.to:10443" ],
		register          : false,
		traceSip          : true,
		authorizationUser : config.username,
		password          : config.password
	});

	//temporary - using userAgent until it is actually used,
	//otherwise style checking complains
	userAgent = userAgent;
}
module.exports = BWPhone;