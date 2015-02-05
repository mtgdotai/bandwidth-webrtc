#BWClient
BWClient is a global singleton used to access the Bandwidth WebRTC Client functionality.
##Api
###createPhone(config) [static]
A phone is needed to make/receive calls. Each phone is associated with a single number/identity. To create a phone, create a configuration object and pass it to *BWClient.createPhone()*. This returns a BWPhone object, or throws an exception if the configuration is invalid.

**Parameters**

`config`

The configuration object contains connection parameters and other options.
It currently only supports SIP for WebRTC signaling.
```javascript
{
    //mandatory: SIP username to identify yourself (IMS Private Identity)
    username: "user_123",
    
    //mandatory: domain name
    domain: "prod.domain.com",
    
    //optional: password to authenticate the SIP user
    password: "taco123",
}
```
**Result**

A BWPhone instance


**Example**


```javascript
var bwPhone = BWClient.createPhone({
    username: "user_123",
    domain: "prod.domain.com",
    password: "taco123",
});
```

###getMicrophones
Retrieves a list of microphones that can be used for the call. See `BWCall.setMicrophoneId()` to choose which microphone to use.
Note: The `name` field will only be available on web pages using HTTPS, and will be null otherwise.

**Parameters**

none

**Result**

A promise that will contain an array of microphone objects.

```javascript
Microphone Object
{
	id   : "9n16xb29337fbaubc89a23bb7213n08", //a unique id
    name : "Super Extreme High-Definition HD microphone 9800"//a user-friendly name to identify the microphone
}
```

**Example**
```javascript
BWClient.getMicrophones()
.then(function(microphoneArray){
	//microphoneArray contains an array of microphone objects
})
.catch(function(){
	//something went wrong...
});

```