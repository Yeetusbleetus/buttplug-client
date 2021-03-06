var WebSocketClient = require('websocket').client;
exports.ButtplugClient = function() {
    const EventEmitter = require('events');
    const client = new EventEmitter();

    let buttplugmessageid = 1;
    let buttplugsocket = new WebSocketClient();

    buttplugsocket.on('connect', async function(connection) {
        connection.on('error', function(error) {
            console.log("Connection Error: " + error.toString());
        });
        connection.on('close', function() {
            //console.log('echo-protocol Connection Closed');
        });

        const messagefunctions = {
            "ServerInfo": function(msg) {
                client.emit("ready",msg)
            },
            "DeviceAdded": async function(msg) {
                await updateDevices()
            },
            "DeviceRemoved": function(msg) {
                client.emit("DeviceRemoved",msg)
            },
            "ScanningFinished": function(msg) {
                scanning = false
            },
            "DeviceList": function(msg) {
                let olddevices = client.Devices
                client.Devices = []
                for (let i = 0; i < msg.Devices.length; i++) {
                    let device = {}
                    device.Id = msg.Devices[i].DeviceIndex
                    device.Name = msg.Devices[i].DeviceName

                    if (msg.Devices[i].DeviceMessages.VibrateCmd) {
                        device.Vibrate = function(motor,speed) {
                            client.SendRawMessage([
                                {
                                  "VibrateCmd": {
                                    "DeviceIndex": device.Id,
                                    "Speeds": [
                                        {
                                          "Index": motor,
                                          "Speed": speed
                                        },
                                      ]
                                    }
                                }
                            ])
                        }
                        device.VibrateMotorCount = msg.Devices[i].DeviceMessages.VibrateCmd.FeatureCount
                    }
                    

                    if (msg.Devices[i].DeviceMessages.RotateCmd) {
                        device.Rotate = function(motor,speed,clockwise) {
                            client.SendRawMessage([{
                                  "RotateCmd": {
                                    "DeviceIndex": device.Id,
                                    "Speeds": [
                                        {
                                            "Index": motor,
                                            "Speed": speed,
                                            "Clockwise": clockwise,
                                        },
                                      ]
                                    }
                                }
                            ])
                        }
                        device.RotateMotorCount = msg.Devices[i].DeviceMessages.RotateCmd.FeatureCount
                    }
                    

                    if (msg.Devices[i].DeviceMessages.LinearCmd) {
                        device.Linear = function(motor,duration,position) {
                            client.SendRawMessage([{
                                  "LinearCmd": {
                                    "DeviceIndex": device.Id,
                                    "Vectors": [
                                        {
                                            "Index": motor,
                                            "Duration": duration,
                                            "Position": position,
                                        },
                                      ]
                                    }
                                }
                            ])
                        }
                        device.LinearMotorCount = msg.Devices[i].DeviceMessages.LinearCmd.FeatureCount
                    }
                    

                    device.raw = msg.Devices[i]
                    if (olddevices[i]) {
                        client.Devices[device.Id] = device
                    } else {
                        client.Devices[device.Id] = device
                        client.emit("DeviceAdded", device)
                    }
                }
            }
        }

        connection.on('message', async function(wsmessage) {
            //console.log(wsmessage)
            if (wsmessage.type === 'utf8') {
                let buttplugmessages = JSON.parse(wsmessage.utf8Data);
                // loop trough the message array
                for (let i = 0; i < buttplugmessages.length; i++) {
                    let message = buttplugmessages[i]
                    let messagekey = Object.keys(message)[0]
                    if (messagefunctions[messagekey]) {
                        messagefunctions[messagekey](message[messagekey])
                    }
                }
            }
        });

        client.SendRawMessage = function(message) {
            // loop through the message array and change the id
            for (let i = 0; i < message.length; i++) {
                message[i][Object.keys(message[i])[0]].Id = buttplugmessageid++;
            }

            let json = JSON.stringify(message);
            connection.sendUTF(json);
            //console.log(json)
        }

        client.SendRawMessage([
            {
              "RequestServerInfo": {
                "ClientName": "node-buttplug-client",
                "MessageVersion": 1
              }
            }
        ])

        let scanning = false
        async function updateDevices() {
            await client.SendRawMessage([{"RequestDeviceList": {}}])
            if (scanning == false) {
                scanning = true
                await client.SendRawMessage([
                    {"StartScanning": {} }
                ])
            }
        }
       
        setInterval(function() {
            updateDevices()
            client.SendRawMessage([{Ping:{}}])
        },3000)
        updateDevices()

    })

    client.Devices = []
    client.connect = function(url) {
        url = url || 'ws://localhost:12345/';
        buttplugsocket.connect(url)
    }

    return client
}