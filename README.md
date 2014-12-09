#Bandwidth WebRTC Client
[![Build Status](https://magnum.travis-ci.com/inetCatapult/webrtc-client.svg?token=BQBnkCKjpv5Ls9SpJgzy&branch=master)](https://magnum.travis-ci.com/inetCatapult/webrtc-client)

##Getting Started
The client is contained in a single javascript file and has no other dependencies. There is a single global object, "BWClient" that is used the access the api.


##BWClient

###BWClient.createPhone(config)
A phone is needed to make/receive calls. Each phone is associated with a single number/identity. To create a phone, create a configuration object and pass it to *BWClient.createPhone()*. This returns a Promise that will contain a BWPhone object, or fail if a problem occured.

```javascript
BWClient.createPhone(<config object>)
  .then(function(phone){
      //... do something with your account here
  }).catch(function(e){
  	//e contains information about the error
});
```

The configuration object given to *BWClient.createPhone()* contains connection parameters and other options.
It currently only supports SIP for WebRTC signaling.
```javascript
{
    //mandatory: SIP username to identify yourself (IMS Private Identity)
    username: "user_123",
    
    //mandatory: domain name
    domain: "prod.domain.com",
    
    //mandatory: valid SIP Uri (IMS Public Identity)
    uri: "sip:user_123@prod.domain.com",
    
    //optional: password to authenticate the SIP user
    password: "taco123",
    
    //optional: websocket proxy
    websocket_proxy_url: "wss://1.2.3.4:5060",
}
```

##BWPhone
A BWPhone owns a single identity (phone number), and can create calls. If you need multiple numbers you can create multiple BWPhone objects. See the BWClient section to create a BWPhone.

###BWPhone.register(config)
Registers this phone to receive incoming events, such as incoming calls.
```javascript
var phone = ... //(see the BWPhone section to create this)

//just use the defaults
phone.register();

//or choose your own values
phone.register({
	expire: 1800 //default expiration (30 minutes)
});


```

###BWPhone.unregister()
Unregisters this phone. Incoming events will no longer be received.
```javascript
var phone = ... //(see the BWPhone section to create this)
phone.unregister();
```

###BWPhone.createCall()
```javascript
var phone = ... //(see the BWPhone section to create this)
var call = phone.createCall();
```
###BWPhone.setLogLevel(level)
Sets the level of logs that are printed to the console.
Possible values are "FATAL","ERROR","WARN","INFO", or "OFF" (no messages are displayed)
```javascript
BWClient.setLogLevel("WARN");
```

##BWCall

####Outgoing Calls
```javascript
<audio id = "audio-remote"></audio>
...
var phone = ... //(see the BWPhone section to create this)
var call = phone.createCall();
call.setRemoteAudioElement(document.getElementById('audio-remote'));
call.on("connecting",function(){
	//call is connecting
});
call.on("connected",function(){
	//call is connected
});
call.on("ended",function(){
	//call has ended
});
call.dial("+12223334444@prod.domain.com");
```

####Incoming Calls
To receive an incoming call, the configuration object given to *BWClient.createPhone()* must have *register* set to *true*, then you will receive incoming call events that you can accept or decline.
```javascript
<audio id = "audio-remote"></audio>
...
BWClient.createPhone(config)
  .then(function(phone){
    phone.register();//register MUST be called to receive incoming call events
    phone.on("incomingCall",function(call){
      //to reject the call
      call.reject();
      
      //to accept the call
      call.setRemoteAudioElement(document.getElementById('audio-remote'));
      call.on("started",function(){
      //the call has started
      });
      call.on("ended",function(){
      //the call has ended
      });
      
      //event handlers should be setup before accept() is called to prevent a race-condition
      call.accept();
    });
      
  }).catch(function(e){
      //e contains information about the error
});
```
###BWCall.dial(uri)
Starts the call. Event handlers should be set up before calling this so prevent race-conditoins.
```javascript
<audio id = "audio-remote"></audio>
...
var phone = ... //(see the BWPhone section to create this)
var call = phone.createCall();
call.dial("+12223334444@prod.domain.com");

```

###BWCall.setRemoteAudioElement(htmlElement)
Sets the HTML audio element that will play audio from the call. This can be set at any time before or during the call.
```javscript
<audio id = "audio-remote"></audio>
...
var call = phone.call(...);
call.setRemoteAudioElement(document.getElementById("audio-remote"));
```
###BWCall.hangup()
Hangup the call
```javascript
var call = phone.call(...);
call.hangup()
```

###BWCall.sendDtmf(tone)
Play a DTMF (dual-tone multi-frequency) tone on the remote stream
```javascript
var call = phone.call(...);
....
call.sendDtmf('#');
call.sendDtmf('*');
call.sendDtmf('0');
call.sendDtmf('9');
```

###BWCall.getInfo()
Retrieves an object with info about the call
```javascript
var call = phone.call(...);
var info = call.getInfo();

//example info from an outgoing SIP call
{
	direction: "out",
    localUri: "sip:user_123@prod.domain.com",
    remoteUri: "sip:+12223334444@prod.domain.com"
}
```




##Supported Browsers
* Firefox
* Chrome
* Opera



