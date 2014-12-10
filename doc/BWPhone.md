#BWPhone
BWPhone is bound to a single identity (phone-number), and is used to make/receive audio calls.
##Api
###createCall()
Creates a BWCall that can be used to make outgoing calls.

**Parameters**

none

**Result**

A BWCall instance


**Example**


```javascript
var bwPhone = BWClient.createPhone({
    username: "user_123",
    domain: "prod.domain.com",
    password: "taco123",
});
var bwCall = bwPhone.createCall();
```
