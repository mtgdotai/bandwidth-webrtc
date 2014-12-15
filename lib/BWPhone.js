"use strict";
var SIP = require("sip.js");
var Joi = require("joi");
var BWCall = require("./BWCall");

function BWPhone(config) {
	var configSchema = Joi.object().keys({
		username : Joi.string().required(),
		domain   : Joi.string().required().hostname(),
		password : Joi.string().optional(),
		register : Joi.boolean().optional()
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
		register          : config.register || false,
		traceSip          : true,
		authorizationUser : config.username,
		password          : config.password
	};
	var userAgent = new SIP.UA(uaConfig);

	function parsePhoneNumber (uri) {
		var regex = /^\s*(?:\+?\s*1)?\s*\(?\s*([0-9]{3})\s*\)?\s*-?\s*([0-9]{3})\s*-?\s*([0-9]{4})\s*$/;
		var match = regex.exec(uri);
		if (match){
			return "+1" + match[1] + match[2] + match[3];
		}
		else {
			return null;
		}
	}

	this.call = function (uri) {
		var phoneNumber = parsePhoneNumber(uri);
		var remoteUri = null;

		if (phoneNumber){
			remoteUri = "sip:" + phoneNumber + "@rocket-gw.ring.to";
		}
		else if (/^sip:..*@..*\...*$/.exec(uri)){
			remoteUri = uri;
		}
		else {
			throw new Error("invalid uri");
		}

		return new BWCall(userAgent,{
			direction : "out",
			localUri  : uaConfig.uri,
			remoteUri : remoteUri
		});
	};
}
module.exports = BWPhone;