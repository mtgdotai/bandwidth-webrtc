"use strict";
var SIP = require("sip.js");
var Joi = require("joi");
var BWCall = require("./BWCall");
var EventEmitter = require("events").EventEmitter;
var globalConfig = require("./configFile.js");
var Util = require("./Util");

function BWPhone(config) {
	var self = this;
	var logLevel = "log";
	var callNotification = null;

	var configSchema = Joi.object().keys({
		username  : Joi.string().required(),
		domain    : Joi.string().required().hostname(),
		password  : Joi.string().optional(),
		logLevel  : Joi.string().optional().allow([ "debug","log","warn","error" ]),
		authToken : Joi.string().optional()
	})
	.nand("password", "authToken");

	config = config || {};

	Joi.assert(config,configSchema);

	var domain = config.domain;

	logLevel = config.logLevel || "log";
	var uaConfig = {
		uri               : "sip:" + config.username + "@" + config.domain,
		wsServers         : globalConfig.wsServers,
		register          : false,//always false, must register AFTER invite handlers are set
		hackViaTcp        : true,
		authorizationUser : config.username,
		password          : config.password,
		log               : {
			level : logLevel
		},
		traceSip          : config.logLevel === "debug",
		stunServers       : globalConfig.stunServers
	};
	var userAgent = new SIP.UA(uaConfig);

	var wsConnectedPromise = new Promise(function (resolve) {
		userAgent.on("connected", resolve);
	});
	userAgent.on("registered", function () {
		self.emit("registrationSuccess");
	});
	userAgent.on("registrationFailed", function () {
		self.emit("registrationFailed");
	});
	userAgent.on("invite",function (session) {
		var localSip = uaConfig.uri;
		var remoteSip = session.request.headers.From[ 0 ].parsed.uri.toString();
		var localName = getName(getId(localSip));
		var remoteName = getName(getId(remoteSip));
		var notification = notify("Incoming Call", {
			body : remoteName,
			icon : globalConfig.incomingCallIcon
		});
		var bwCall = new BWCall({
			info         : {
				direction  : "in",
				localUri   : uaConfig.uri,
				localId    : getId(localSip),
				localName  : localName,
				remoteUri  : remoteSip,
				remoteId   : getId(remoteSip),
				remoteName : remoteName
			},
			session      : session,
			notification : notification
		});

		playIncomingCallRing();
		bwCall.on("connected", stopIncomingCallRing);
		bwCall.on("ended", stopIncomingCallRing);
		self.emit("incomingCall",bwCall);
	});
	var incomingCallAudio =  new global.Audio(globalConfig.incomingCallAudio);

	function playIncomingCallRing () {
		incomingCallAudio.currentTime = 0;
		incomingCallAudio.play();
		incomingCallAudio.loop = true;
	}
	function stopIncomingCallRing () {
		incomingCallAudio.pause();
	}
	function notify(title, options){
		if (global.Notification && global.Notification.permission === "granted"){
			callNotification = new global.Notification(title, options);
			setTimeout(function () {
				callNotification.close();
			}, 30 * 1000);
			callNotification.onclick = function () {
				global.focus();
			};
			self.emit("notification", callNotification);
			return callNotification;
		}
	}

	//extracts a simplified id that call() can correctly parse back into a sip uri
	//ex: "sip:+12223334444@<registered-domain>" will return "+12223334444"
	function getId (uri) {
		if (uri.indexOf("sip:") === 0){
			uri = uri.substr(4);
		}
		if (uri.indexOf("@" + domain) !== -1){
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
		var phoneNumber = Util.parsePhoneNumber(uri);
		if (phoneNumber){
			uri = "sip:" + phoneNumber + "@" + domain;
		}
		else {
			if (uri.indexOf("sip:") === 0){
				uri = uri.substr(4);
			}
			if (uri.indexOf("@") === -1){
				uri = uri + "@" + domain;
			}
			uri = "sip:" + uri;
		}
		return uri;
	}
	this.call = function (uri, options) {
		return new BWCall({
			options   : options,
			authToken : config.authToken,
			userAgent : userAgent,
			domain    : config.domain,
			info      : {
				direction  : "out",
				localUri   : uaConfig.uri,
				localId    : getId(uaConfig.uri),
				localName  : getName(getId(uaConfig.uri)),
				remoteUri  : idToSip(uri),
				remoteId   : getId(uri),
				remoteName : getName(getId(uri))
			}
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
	this.getTraceSip = function () {
		return uaConfig.traceSip;
	};
	this.register = function () {
		var options = {
			extraHeaders : []
		};
		if (config.authToken){
			options.extraHeaders.push("X-Callsign-Token: " + config.authToken);
		}
		wsConnectedPromise
		.then(function () {
			userAgent.register(options);
		});
	};
	this.unregister = function () {
		userAgent.unregister();
	};
}

BWPhone.prototype = Object.create(EventEmitter.prototype);
module.exports = BWPhone;