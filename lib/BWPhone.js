"use strict";
var SIP = require("sip.js");
var Joi = require("joi");
var BWCall = require("./BWCall");

function BWPhone(config) {
	var logLevel = "log";
	var configSchema = {
		username : Joi.string().required(),
		domain   : Joi.string().required().hostname(),
		password : Joi.string().optional(),
		register : Joi.boolean().optional(),
		logLevel : Joi.string().optional().allow([ "debug","log","warn","error" ])
	};
	config = config || {};

	Joi.assert(config,configSchema);
	logLevel = config.logLevel || "log";
	var uaConfig = {
		uri               : "sip:" + config.username + "@" + config.domain,
		wsServers         : [ "wss://rocket.ring.to:10443" ],
		register          : config.register || false,
		traceSip          : true,
		authorizationUser : config.username,
		password          : config.password,
		log               : {
			level : logLevel
		}
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
	function isSipUri (uri) {
		var regex = /^sip:..*@..*\...*$/;
		return regex.exec(uri);
	}
	this.call = function (uri) {
		var phoneNumber = parsePhoneNumber(uri);
		var remoteUri = null;

		if (phoneNumber){
			remoteUri = "sip:" + phoneNumber + "@rocket-gw.ring.to";
		}
		else if (isSipUri(uri)){
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
	this.setLogLevel = function (level) {
		var schema = Joi.string().valid([ "debug","log","warn","error" ]);
		Joi.assert(level,schema);
		userAgent.log.level = level;
		logLevel = level;
	};
	this.getLogLevel = function () {
		return logLevel;
	};
}
module.exports = BWPhone;