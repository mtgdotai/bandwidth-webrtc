"use strict";
var SIP = require("sip.js");
var Joi = require("joi");
var BWCall = require("./BWCall");
var EventEmitter = require("events").EventEmitter;

function BWPhone(config) {
	var self = this;
	var logLevel = "log";

	var configSchema = Joi.object().keys({
		username      : Joi.string().required(),
		domain        : Joi.string().required().hostname(),
		password      : Joi.string().optional(),
		logLevel      : Joi.string().optional().allow([ "debug","log","warn","error" ]),
		callsignToken : Joi.string().optional()
	})
	.nand("password", "callsignToken");

	config = config || {};

	Joi.assert(config,configSchema);

	var domain = config.domain;
	logLevel = config.logLevel || "log";
	var uaConfig = {
		uri               : "sip:" + config.username + "@" + config.domain,
		wsServers         : [ "wss://stage-webrtc.registration.bandwidth.com:10443" ],
		register          : false,//always false, must register AFTER invite handlers are set
		traceSip          : true,
		authorizationUser : config.username,
		password          : config.password,
		log               : {
			level : logLevel
		}
	};
	var userAgent = new SIP.UA(uaConfig);

	var wsConnectedPromise = new Promise(function (resolve) {
		userAgent.on("connected", resolve);
	});

	userAgent.on("invite",function (session) {
		var localSip = uaConfig.uri;
		var remoteSip = session.request.headers.From[ 0 ].parsed.uri.toString();
		var localName = getName(getId(localSip));
		var remoteName = getName(getId(remoteSip));
		var bwCall = new BWCall({
			info    : {
				direction  : "in",
				localUri   : uaConfig.uri,
				localId    : getId(localSip),
				localName  : localName,
				remoteUri  : remoteSip,
				remoteId   : getId(remoteSip),
				remoteName : remoteName
			},
			session : session
		});
		notify("Incoming Call", {
			body : remoteName,
			icon :"https://d23gfec6haquvp.cloudfront.net/media/call_icon.png"
		});
		playIncomingCallRing();
		bwCall.on("connected", stopIncomingCallRing);
		bwCall.on("ended", stopIncomingCallRing);
		self.emit("incomingCall",bwCall);
	});
	var incomingCallAudio =  new global.Audio("https://d23gfec6haquvp.cloudfront.net/media/incoming_alert.mp3");

	function playIncomingCallRing () {
		incomingCallAudio.currentTime = 0;
		incomingCallAudio.play();
	}
	function stopIncomingCallRing () {
		incomingCallAudio.pause();
	}
	function notify(title, options){
		if (global.Notification && global.Notification.permission === "granted"){
			var notification = new global.Notification(title, options);
			setTimeout(function () {
				notification.close();
			}, 30 * 1000);
			notification.onclick = function () {
				global.focus();
			};
			self.emit("notification", notification);
			return notification;
		}
	}
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
		var phoneNumber = parsePhoneNumber(uri);
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
	this.call = function (uri) {
		return new BWCall({
			info          : {
				direction  : "out",
				localUri   : uaConfig.uri,
				localId    : getId(uaConfig.uri),
				localName  : getName(getId(uaConfig.uri)),
				remoteUri  : idToSip(uri),
				remoteId   : getId(uri),
				remoteName : getName(getId(uri))
			},
			callsignToken : config.callsignToken,
			userAgent     : userAgent
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
		var options = {
			extraHeaders : []
		};
		if (config.callsignToken){
			options.extraHeaders.push("X-Callsign-Token: " + config.callsignToken);
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