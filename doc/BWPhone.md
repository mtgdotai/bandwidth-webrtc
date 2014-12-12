#BWPhone
BWPhone is bound to a single identity (phone-number), and is used to make/receive audio calls.
##Api
###call(uri)
Creates an outgoing call to `uri` and returns a [BWCall](BWCall.md).

**Parameters**

* `uri` (String)

The destination to call

**Result**

A [BWCall](BWCall.md) instance


**Example**


```javascript
var bwPhone = BWClient.createPhone({
    username: "user_123",
    domain: "prod.domain.com",
    password: "taco123",
});
var bwCall = bwPhone.call("sip:bob@domain.com");
```
