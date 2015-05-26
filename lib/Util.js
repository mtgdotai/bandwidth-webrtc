"use strict";

var Util = {};
Util.parsePhoneNumber = function (uri) {
	var regex = /^\s*(?:\+?\s*1)?\s*\(?\s*([0-9]{3})\s*\)?\s*-?\s*([0-9]{3})\s*-?\s*([0-9]{4})\s*$/;
	var match = regex.exec(uri);
	if (match){
		return "+1" + match[ 1 ] + match[ 2 ] + match[ 3 ];
	}
	else {
		return null;
	}
};

module.exports = Util;