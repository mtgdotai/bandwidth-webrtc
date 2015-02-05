#BWCall
BWCall is used to control inbound/outbound audio calls. See [BWPhone](BWPhone.md) to create a BWCall.
#Api
##setRemoteAudioElement(element)
Sets the HTML audio element that will be used to play audio from the remote-side of the call.
If set after the call has connected, the audio will start playing immediately. If called before, it will automatically start playing once the call has connected.

**Parameters**

* `element` HTML element

HTML audio element

**Result**

no output


**Example**


```javascript
<audio id = "audio-remote"></audio>
var bwPhone = BWClient.createPhone({
    username: "user_123",
    domain: "prod.domain.com",
    password: "taco123",
});
var bwCall = bwPhone.call("bob@domain.com");
bwCall.setRemoteAudioElement(document.getElementById('audio-remote'));
```

##getInfo()
Returns call information

**Parameters**

None

**Result**
An object that contains information about the call

**Example**

```javascript
var info = call.getInfo();

//an example of what might be returned
{
    //can be 'in' or 'out'
    direction : "out",
    
    //state is always given. Possible states are
    // 'connecting', 'connected' 
    state     : "connecting",
    
    //your uri (always available for SIP calls)
    localUri  : "sip:bob123@domain.com",
    
    //the remote uri (always available for SIP calls)
    remoteUri : "sip:alice123@domain.com",
    
    //a simplified version of localUri 
    localId   : "bob123",
    
    //a simplified version of remoteUri, can still be used to make calls
    remoteId  : "alice123"
}
```

##hangup()
Hang up the call. The call must be in `connected` state.

**Parameters**

None

**Example**
```javascript
var bwCall = bwPhone.call("sip:user_234");
bwCall.on("ended",function(){
    //the call has ended
});
bwCall.hangup();
```
##accept()
Accept an incoming call. The call must in the 'connecting' state.

**Parameters**

None

**Example**
```javascript
var bwPhone = ... (see [BWPhone](BWPhone.md) to create this)
bwPhone.on("incomingCall",function (bwCall) {
    bwCall.accept();
});

```

##reject()
Reject an incoming call. The call must be in the `connecting` state

**Parameters**

None

**Example**
```javascript
var bwPhone = ... (see [BWPhone](BWPhone.md) to create this)
bwPhone.on("incomingCall",function (bwCall) {
    bwCall.reject();//the call will be in the ended state
});
```

##sendDtmf(tone)
Send a DTMF (dual-tone multi-frequency) to the remote device.

**Parameters**

* `tone` String (size =1)

The tone to play. Can be (0-9), #,*

##mute()
Mute the microphone on the local device.


**Parameters**

None

**Result**

No return value

##unmute()
Unmute the microphone on the local device.

**Parameters**

None

**Result**

No return value

##setMicrophoneId(id)
Sets the microphone to be used during the call.
Must be called before the call is connected.

**Parmeters**

* `id` String

A microphone identifier. See [BWClient.getMicrophones()](BWClient.md) to retrieve a list of microphones and their id.

**Result**

No return value

**Example**
```javascript

var microphoneId = ... //choose the microphone you want before starting a call

var bwCall = bwPhone.call("sip:user_234");
bwCall.setMicrophoneId(microphoneId);

bwCall.on("connected",function(){
    //call is connected, and using the microphone specified above.
});

...

bwCall.hangup();

```


--------
#Events

BWCall is an EventEmitter, and will emit the following events. No extra data is given with the event. Use `getInfo` to get additional information about the call.
###`connecting`
For an outbound call, this is emitted when the call is started. `BWPhone.call()` waits until the next tick to actually start the call to allow event listeners to attach. So this is useful if you need to fire any events when the call actually starts connecting. (For example, you cannot hangup a call until this event is fired).
###`connected`
For an outbound call, this is emitted once the call is connected, after the remote-audio has been started (if applicable).
For an inbound call, this is emitted once the call has been accepted and the remote-audio has been started (if applicable).
###`ended`
The call has ended.

###Example
```javascript
var call = bwPhone.call("sip:jim-bob@domain.com");
call.on("connected",function(){
    //do something when the call has connected
});
```