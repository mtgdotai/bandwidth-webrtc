"use strict";
var SIP = require("sip.js");
var Joi = require("joi");
var BWCall = require("./BWCall");
var EventEmitter = require("events").EventEmitter;

function BWPhone(config) {
	var defaultDomain = "nfuchs.ringto.stage.bwc-clients.com";
	var self = this;
	var logLevel = "log";
	var configSchema = {
		username : Joi.string().required(),
		domain   : Joi.string().required().hostname(),
		password : Joi.string().optional(),
		logLevel : Joi.string().optional().allow([ "debug","log","warn","error" ])
	};
	config = config || {};

	Joi.assert(config,configSchema);
	logLevel = config.logLevel || "log";
	var uaConfig = {
		uri               : "sip:" + config.username + "@" + config.domain,
		wsServers         : [ "wss://rocket.bwincubator.com:10443" ],
		register          : false,//always false, must register AFTER invite handlers are set
		traceSip          : true,
		authorizationUser : config.username,
		password          : config.password,
		log               : {
			level : logLevel
		}
	};
	var userAgent = new SIP.UA(uaConfig);
	userAgent.on("invite",function (session) {
		var localSip = uaConfig.uri;
		var remoteSip = session.request.headers.From[ 0 ].parsed.uri.toString();
		var bwCall = new BWCall({
			info    : {
				direction  : "in",
				localUri   : uaConfig.uri,
				localId    : getId(localSip),
				localName  : getName(getId(localSip)),
				remoteUri  : remoteSip,
				remoteId   : getId(remoteSip),
				remoteName : getName(getId(remoteSip))
			},
			session : session
		});
		self.emit("incomingCall",bwCall);
	});

	function parsePhoneNumber (uri) {
		var regex = /^\s*(?:\+?\s*1)?\s*\(?\s*([0-9]{3})\s*\)?\s*-?\s*([0-9]{3})\s*-?\s*([0-9]{4})\s*$/;
		var match = regex.exec(uri);
		if (match){
			return "+1" + match[ 1 ] + match[ 2 ] + match[ 3 ];
		}
		else {
			return null;
		}
	}
	//extracts a simplified id that call() can correctly parse back into a sip uri
	//ex: "sip:+12223334444@<registered-domain>" will return "+12223334444"
	function getId (uri) {
		if (uri.indexOf("sip:") === 0){
			uri = uri.substr(4);
		}
		if (uri.indexOf("@" + defaultDomain) !== -1){
			uri = uri.substr(0,uri.indexOf("@"));
		}
		return uri;
	}

	//extracts a user friendly display name. This will ensure no ip addresses or
	//anything else are in the name, but it cannot be used for calling
	function getName (id){
		var index = id.indexOf("@");
		if (index === -1){
			return id;
		}
		else {
			return id.substr(0,id.indexOf("@"));
		}
	}

	function idToSip (uri) {
		var phoneNumber = parsePhoneNumber(uri);
		if (phoneNumber){
			uri = "sip:" + phoneNumber + "@" + defaultDomain;
		}
		else {
			if (uri.indexOf("sip:") === 0){
				uri = uri.substr(4);
			}
			if (uri.indexOf("@") === -1){
				uri = uri + "@" + defaultDomain;
			}
			uri = "sip:" + uri;
		}
		return uri;
	}
	this.call = function (uri) {
		return new BWCall({
			info      : {
				direction  : "out",
				localUri   : uaConfig.uri,
				localId    : getId(uaConfig.uri),
				localName  : getName(getId(uaConfig.uri)),
				remoteUri  : idToSip(uri),
				remoteId   : getId(uri),
				remoteName : getName(getId(uri))
			},
			userAgent : userAgent
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
	this.register = function () {
		userAgent.register();
	};
	this.unregister = function () {
		userAgent.unregister();
	};
}
BWPhone.prototype = Object.create(EventEmitter.prototype);
module.exports = BWPhone;