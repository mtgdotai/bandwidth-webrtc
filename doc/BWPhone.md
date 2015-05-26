#BWPhone
BWPhone is bound to a single identity (phone-number), and is used to make/receive audio calls.
##Api
###call(uri, options)
Creates an outgoing call to `uri` and returns a [BWCall](BWCall.md).

**Parameters**

* `uri` (String)

The destination to call. This can be either a valid phone number, or a sip uri.

* `options` (Object)
  - `identity`(String | Null | Undefined)
  
    An identity (P-Preferred-Identity) to use as the 'from' number. This will be converted to an E164 phone number         automatically. The backend server that receives incoming call events must also support this and create the outgoing leg with this number when the legs are bridged together to form the call. This will apprear as `preferredId` for incoming call events from Catapult, and the value will be the full SIP uri.

    Example Catapult incoming call event:
    ```
    {
        "preferredId":"<sip:+15202223333@yourdomain.com>"`,
        ...
    }
    ```

A valid phone number is in the format `+12223334444`, with optional extra spacing such as `+1 (222) 333 4444` or `222-333-4444`. (The +1 country code is optional, and is implied if not given. Numbers with a different country code are not supported).

A sip uri must be in the format `sip:<username>@<domain>`

**Result**

A [BWCall](BWCall.md) instance


**Example**


```javascript
var bwPhone = BWClient.createPhone({
    username: "user_123",
    domain: "prod.domain.com",
    password: "taco123"
});
var bwCall = bwPhone.call("sip:bob@domain.com");
```
###setLogLevel(level)
Sets the log level

**Parameters**

* `level` (String)

Can be "debug","log","warn" or "error"

**Result**

none

**Example**
```javascript
var bwPhone = BWClient.createPhone(<config>);
bwPhone.setLogLevel("warn");

```

###getLogLevel()
Retrieves the current log level. The default level is "log".

**Parameters**

none

**Result**

The current log level ("debug", "log", "warn", or "error"). 

**Example**
```javascript
var bwPhone = BWClient.createPhone(<config>);
var logLevel = bwPhone.getLogLevel();

```

##register()
Registers the phone to receive incoming calls.

Note: You may notice while using a callsign token, when re-registration occurs
the first registration will fail to send the callsign token, then it will be 
repeated a 2nd time with the correct credentials. This is due to a bug in a lower
level library being used.

**Parameters**

none

**Result**

no return value

**Example**
```javascript
var bwPhone = BWClient.createPhone(<config>);
bwPhone.register();
```

##unregister()
Unregisters the phone. Incoming calls will not be received.

**Parameters**

none

**Result**

no return value

**Example**
```javascript
var bwPhone = BWClient.createPhone(<config>);
bwPhone.register();
bwPhone.unregister();
```