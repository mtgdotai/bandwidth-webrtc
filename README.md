#Bandwidth WebRTC Client
[![Build Status](https://travis-ci.org/bandwidthcom/bandwidth-webrtc.svg?branch=master)](https://travis-ci.org/bandwidthcom/bandwidth-webrtc)
[![Coverage Status](https://coveralls.io/repos/bandwidthcom/bandwidth-webrtc/badge.svg)](https://coveralls.io/r/bandwidthcom/bandwidth-webrtc)

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

##Prerequisites

- Register for a Catapult (Bandwidth Application Platform) account [here](https://catapult.inetwork.com)
- Register a SIP domain
- Create an endpoint/user
- If you want to make calls to the PSTN (normal phones) you will need a server to handler events from Catapult
- Make phone calls

For a more in depth guide, view [this article](http://ap.bandwidth.com/docs/how-to-guides/use-endpoints-make-receive-calls-sip-clients)

##Quick Start
Full docs are [here](doc/)

[JSFIDDLE Demo Client](https://jsfiddle.net/fuchsnj/5e38j33x/)

###Outbound Call
```javascript
var bwPhone = BWClient.createPhone({
    username: "user_123",
    domain: "prod.domain.com",
    password: "taco123",
    logLevel: "debug"//can be debug,log,warn,error (default=log)
});
var bwCall = bwPhone.call("222-333-4444");
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
        ...
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

#License: [MIT](LICENSE)