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
    // turn on all the motors at max power
    for (let i = 0; i < device.VibrateMotorCount; i++) {
        device.Vibrate(i,1)
    }   
})

buttplugclient.connect("ws://localhost:12345")

setInterval(() => {
    // get first device
    var device = buttplugclient.Devices[0]
    if (device) {
        let p = (Math.sin(Date.now()/500)/2.5)+0.5
        console.log(p)
        for (let i = 0; i < device.VibrateMotorCount; i++) {
            device.Vibrate(i,p)
        }
    }
}, 200);
```
