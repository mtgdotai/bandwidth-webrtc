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
    //either a password or authToken can be used for authentication
    password: "taco123",
    
    //optional: a temporary authToken token to authenticate with instead of a password
    authToken: "283ha89bva289fajf2093jf"
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
###getUserMedia
By default, the browser will ask for permission to use media right when you need it. You can call this method to request the permission whenever it is appropriate in your app, and if it is running over HTTPS, this setting will be remembered. Once media permission is accepted, any further media request will be fufilled immediately without user intervention.

**Example**
```
//media permission is 'pending' here
BWClient.getUserMedia()
.then(function () {
    //accepted
})
.catch(function () {
    //rejected
})
```
