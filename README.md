# Home Automation
This is a fairly simple example of a Home Automation UI. It's pretty basic and only supports "lights" and "HVAC". I put those words in quotes because really it does nothing but change the UI state & make a failed HTTP request.

## Running
I used a simple Node server to serve the files. If you have Node.js installed, simply run `npm install` followed by `node server.js` to start the server. You can then open (localhost:8888)[http://localhost:8888] to view the files.

If you'd rather just server the files using apache or some other similar item, simply set the web server's root to the `public/` directory of this project.

## Events
It is very easy to extend the functionality and/or subscribe to a given event. Using the [Jive-JS Fabric](https://github.com/jive/JiveJS-Commons/blob/master/docs/fabric.md) as the mechanism to send notifications of events.

### Subscribing to events
To subscribe to a given event you use the `getFabric` method on the `automation` global. The `getFabric` method returns an instance of the Jive Fabric. Use the `.subscribe` method on the Fabric in order to get events.

```
automation.getFabric().subscribe({
	urn: "lights:*:updated",
	callback: function(published) {
		var device = published.data;

		console.log("The device info", device);
	}
});
```

This method will be called any time the device information is published. This could theoretically happen via Websocket, HTTP updates request (polling for changes), or for changes initiated through the UI. Your callback will only be called if and when the changes are successfully saved to the sever & the JS object (or would be if the server were real). Device data is available on the published.data field.

### URNs
The URNs used follow a very simple pattern. The pattern is: `{deviceType}:{deviceId}:{eventType}`. Currently the event type is always `updated`.

If you wish to subscribe to all deviceTypes, deviceIds, or eventTypes you can use a wildcard. A `*` will match all items between `:`s (colons). A `#` will match all items including `:`s (colons).

For example, `#:updated` would be any updated events. `*:*:updated` would also be any updated events. `lights:*:updated` would be any lights being updated.

#### URN specs

##### `lights:*:updated`
This event is published any time a light's state changes.

The published event data is as follows:

```
{
	"id": "12859a82b29c",
	"name": "Ceiling Light",
	"type": "light",
	"room": "1bcd289fe02",
	"states": ["on", "off"],
	"state": "off",
	"dimState": 89,
	"dims": true,
	"location": "10"
}
```

The `state` field will be either `on` or `off`. Currently the `dimState` field is not really used.


##### `thermostats:*:updated`
This event is published any time a thermostats data changes. This may be because the current temperature has changed or because the goal temperature has changed.

The published event data is as follows:
```
{
	"id": "85924c9581dba",
	"name": "Main Thermostat",
	"type": "thermostat",
	"room": "2cfab90d25",
	"states": ["heating", "cooling", "recirculating", "off"],
	"state": "heating",
	"currentTemperature": 64,
	"goalTemperature": 68,
	"location": "10"
}
```

All temperatures are in degrees Fahrenheit.

foo foo again
