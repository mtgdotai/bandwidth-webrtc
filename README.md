#Bandwidth WebRTC Client
[![Build Status](https://magnum.travis-ci.com/inetCatapult/webrtc-client.svg?token=BQBnkCKjpv5Ls9SpJgzy&branch=master)](https://magnum.travis-ci.com/inetCatapult/webrtc-client)
[![Coverage Status](https://coveralls.io/repos/inetCatapult/webrtc-client/badge.png?branch=master)](https://coveralls.io/r/inetCatapult/webrtc-client?branch=master)

##Generating BWClient library
```javascript
npm install
grunt compile-assets
```
BWClient.js will be generated at "dist/BWClient.js"
Just include this at the top of your HTML page that will declare a global BWClient object.

```
<script src="BWClient.js"></script>
```
##Quick Start
Full docs are [here](doc/)

###Outbound Call
```javascript
<audio id = "audio-remote"></audio>
...
var bwPhone = BWClient.createPhone({
    username: "user_123",
    domain: "prod.domain.com",
    password: "taco123",
});
var bwCall = bwPhone.createCall();
bwCall.setRemoteAudioElement(document.getElementById('audio-remote'));
bwCall.on("connected",function(){
	//the call has connected, and audio is playing
});
bwCall.on("ended",function(){
	//the call has ended
});
bwCall.dial("sip:user_234");
...
//play a DTMF tone
bwCall.sendDtmf("1");
bwCall.sendDtmf("#");

//to hangup the call
bwCall.hangup();
```

##Supported Browsers
* Firefox
* Chrome
* Opera



