"use strict";

function GetUserMediaMock(){
	var self = this;
	var onSuccess = null;
	var onFail = null;

	self.getUserMedia = function (constraints,success,fail) {
		onSuccess = success;
		onFail = fail;
	};
	self.accept = function () {
		setTimeout(function () {
			if (onSuccess){
				onSuccess();
			}
		},0);
	};
	self.decline = function () {
		setTimeout(function () {
			if (onFail){
				onFail();
			}
		},0);
	};
}
module.exports = GetUserMediaMock;