# buttplug-client

buttplug.io protocol implementation for server-side javascript and interfacing with buttplug server applications like [Intiface Desktop](https://intiface.com/)


## Basic Usage
```js
var buttplugclient = require("buttplug-client").ButtplugClient()

buttplugclient.on("ready", function(data) {
    console.log(data)
})

buttplugclient.on("DeviceAdded", function(device) {
    device.Vibrate(0,Math.random())
})

buttplugclient.connect()

setInterval(() => {
    // get first device
    var device = buttplugclient.Devices[0]
    if (device) {
        device.Vibrate(0,Math.random())
        device.Vibrate(1,Math.random())
    }
}, 200);
```
