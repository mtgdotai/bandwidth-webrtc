"use strict";

function Notification(){
	console.log("NOTIFICATION CONSTRUCTOR");
	this.onclick = null;
}
Notification.requestPermission = function () {};
Notification.prototype.close = function () {};

module.exports = Notification;