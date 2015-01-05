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
    
    //optional: if the phone should register to receive incoming events (incoming calls)
    register: true //default is false
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
    register: true
});
```

