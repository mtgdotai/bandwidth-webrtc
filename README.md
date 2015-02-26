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

[JSFIDDLE Demo Client](https://jsfiddle.net/wtcross/uk1fahor/)

###Outbound Call
```javascript
<audio id = "audio-remote"></audio>
...
var bwPhone = BWClient.createPhone({
    username: "user_123",
    domain: "prod.domain.com",
    password: "taco123",
    logLevel: "debug"//can be debug,log,warn,error (default=log)
});
var bwCall = bwPhone.call("222-333-4444");
bwCall.setRemoteAudioElement(document.getElementById('audio-remote'));
bwCall.on("connected",function(){
    //the call has connected, and audio is playing
});
bwCall.on("ended",function(){
    //the call has ended
});
...
//play a DTMF tone
bwCall.sendDtmf("1");
bwCall.sendDtmf("#");

//mute call
bwCall.mute();

//unmute call
bwCall.unmute();

//to hangup the call
bwCall.hangup();
```
###Inbound Call
```javascript
<audio id = "audio-remote"></audio>
...
var bwPhone = BWClient.createPhone({
    username : "user_123",
    domain   : "prod.domain.com",
    password : "taco123",
    logLevel : "debug"
});
bwPhone.on("incomingCall",function (bwCall) {
    //get into to determine if the call should be accepted/rejected
    var info = bwCall.getInfo();
    
    //user friendly remote identifier
    var remoteId = info.remoteId;
    
    //setup event handlers
    bwCall.on("connected",function () {
        
    });
    //to accept the call
    bwCall.accept();
    
    //to reject the call
    bwCall.reject();
});
```
##Supported Browsers
* Firefox
* Chrome
* Opera



