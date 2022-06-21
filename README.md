# buttplug-client

## a simple buttplug.io nodejs implementation

buttplug.io protocol implementation for server-side javascript (nodejs) and interfacing with buttplug server applications like [Intiface Desktop](https://intiface.com/)

* Interface with buttplug.io servers
* Easily program lovense and similiar products (Hush, Edge, Lush, etc.)

## Basic Usage

```js
var buttplugclient = require("buttplug-client").ButtplugClient()

buttplugclient.on("ready", function(ServerInfo) {
    console.log(ServerInfo)
})

buttplugclient.on("DeviceAdded", function(device) {
    device.Vibrate(0,Math.random())
})

buttplugclient.connect("ws://localhost:12345")

setInterval(() => {
    // get first device
    var device = buttplugclient.Devices[0]
    if (device) {
        device.Vibrate(0,Math.random())
        device.Vibrate(1,Math.random())
    }
}, 200);
```
