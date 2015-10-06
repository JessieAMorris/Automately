"use strict";

(function(global) {
	// Allows us to use the factory later in the exports
	var factory = (function() {
		function doGet(url) {
			return $.get(url);
		}

		function doPost(url, data) {
			return $.post(url, data);
		}

		var rooms = {};
		var devices = {};
		var fabric = null;

		var automation = {
			fetchAutomationLocation: function fetchAutomationLocation(locationId) {
				return doGet("/location/" + locationId + ".json").done(function(data) {
					if(data) {
						if(data.rooms) {
							data.rooms.forEach(function(room) {
								rooms[room.id] = room;
							});
						}

						if(data.devices) {
							data.devices.forEach(function(device) {
								devices[device.id] = device;
							});
						}
					}
				});
			},

			getRoom: function getRoom(id) {
				if(rooms[id]) {
					if(rooms[id].devices) {
						rooms[id].devices.forEach(function(deviceId, j) {
							if(typeof deviceId === "string") {
								if(devices[deviceId]) {
									rooms[id].devices[j] = devices[deviceId];
								}
							}
						});
					}

					return rooms[id];
				}
			},

			getRooms: function getRooms() {
				for(var id in rooms) {
					this.getRoom(id);
				}

				return rooms;
			},

			getDevice: function getDevice(id) {
				if(devices[id]) {
					if(devices[id].room) {
						if(typeof devices[id].room === "string") {
							if(rooms[devices[id].room]) {
								devices[id].room = rooms[devices[id].room];
							}
						}
					}

					return devices[id];
				}
			},

			getDevices: function getDevices() {
				for(var id in devices) {
					this.getDevice(id);
				}

				return devices;
			},

			setFabric: function setFabric(fabric) {
				this.fabric = fabric;
			},

			getFabric: function getFabric() {
				return this.fabric;
			},

			publish: function publish(data) {
				if(this.fabric !== null) {
					this.fabric.publish(data);
				}
			},

			setTemperature: function setValue(deviceId, newTemperature) {
				var that = this;

				// Will fail every time since the server doesn't handle POSTs currently
				return doPost("/device/" + deviceId + ".json", {goalTemperature: newTemperature}).always(function() {
					devices[deviceId].goalTemperature = newTemperature;

					that.publish({
						urn: "thermostats:" + deviceId + ":updated",
						data: devices[deviceId]
					});
				});
			},

			toggleLight: function toggleLight(deviceId) {
				var that = this;

				var lightState = devices[deviceId].state;
				lightState = (lightState === "off") ? "on" : "off";

				// Will fail every time since the server doesn't handle POSTs currently
				return doPost("/device/" + deviceId + ".json", {state: lightState}).always(function() {
					devices[deviceId].state = lightState;

					that.publish({
						urn: "lights:" + deviceId + ":updated",
						data: devices[deviceId]
					});
				});
			}
		};

		return automation;
	});

	if(typeof define === 'function' && define.amd) {
		define(factory);
	} else if(typeof exports === 'object') {
		module.exports = factory();
	} else {
		global.automation = factory();
	}
})(this);
