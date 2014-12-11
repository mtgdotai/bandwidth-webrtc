#BWCall
BWCall is used to control inbound/outbound audio calls
#Api
##setRemoteAudioElement(element)
Sets the HTML audio element that will be used to play audio from the remote-side of the call.
If set after the call has started, the audio will start playing immediately. If called before, it will automatically start playing once the call has connected.

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
var bwCall = bwPhone.createCall();
bwCall.setRemoteAudioElement(document.getElementById('audio-remote'));
```

##dial(uri)
Starts an outbound call to the `uri` given.

**Parameters**

* `uri` String

The uri to call.

**Example**

```javascript
<audio id = "audio-remote"></audio>
...
var bwPhone = BWClient.createPhone({
    username: "user_123",
    domain: "prod.domain.com",
    password: "taco123",
});
var bwCall = bwPhone.createCall();
bwCall.dial("sip:user_234");
```

