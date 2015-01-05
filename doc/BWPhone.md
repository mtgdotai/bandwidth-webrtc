#BWPhone
BWPhone is bound to a single identity (phone-number), and is used to make/receive audio calls.
##Api
###call(uri)
Creates an outgoing call to `uri` and returns a [BWCall](BWCall.md).

**Parameters**

* `uri` (String)

The destination to call. This can be either a valid phone number, or a sip uri.

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
Can be "debug","log","warn" or "error"

**Result**

The current log level ("debug", "log", "warn", or "error"). 

**Example**
```javascript
var bwPhone = BWClient.createPhone(<config>);
var logLevel = bwPhone.getLogLevel();

```