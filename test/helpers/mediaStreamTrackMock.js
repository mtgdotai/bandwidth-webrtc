"use strict";

function MediaStreamTrackMock(){
	var self = this;

	var sources = [
		{
			kind  : "audio",
			id    : "123",
			label : "Awesome Sound System #1"
		},
		{
			kind  : "not audio",
			id    : "001",
			label : "Meh Speakers Inc."
		}
	];
	self.getSources = function (callback) {
		callback(sources);
	};
}
module.exports = MediaStreamTrackMock;