"use strict";

function Notification(){
	this.onclick = null;
}
Notification.requestPermission = function () {};
Notification.prototype.close = function () {};

module.exports = Notification;