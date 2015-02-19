"use strict";
var eventListener = null;
var audioElement = {};
audioElement.play = function () {
	setTimeout(function () {
		if (eventListener){
			eventListener();
		}
	},10);
};
audioElement.pause = function () {};
audioElement.addEventListener = function (event,func) {
	eventListener = func;
};
audioElement.removeEventListener = function () {
	eventListener = null;
};

function Audio(){
	return audioElement;
}
Audio.getMockElement = function () {
	return audioElement;
};
module.exports = Audio;