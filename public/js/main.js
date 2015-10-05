"use strict";

(function() {
	function getDeviceHtml(device) {
		var deviceHtml = $("<div class='deviceContainer'>");
		var deviceName = $("<div class='deviceName'>").text(device.name);

		deviceHtml.append(deviceName);

		var deviceControlHtml = $("<div class='deviceControl'>").attr("id", device.id);
		switch(device.type) {
			case "thermostat":
				deviceControlHtml.append(getThermostatHtml(device));

				break;
			case "light":
				break;
		}

		deviceHtml.append(deviceControlHtml);

		return deviceHtml;
	}

	function getThermostatHtml(device) {
		var thermostatHtml = $("<div class='thermostatContainer'>");
		var thermostatGraph = $("<div class='thermostatGraph'>");
		thermostatHtml.append(thermostatGraph);

		var data = google.visualization.arrayToDataTable([
			['Label', 'Value'],
			['Current Temp', device.currentTemperature],
			['Goal Temp', device.goalTemperature]
		]);

		var options = {
			width: 400,
			height: 120,
			yellowFrom: 75,
			yellowTo: 90,
			redFrom: 90,
			redTo: 100,
			min: 60,
			max: 100,
			minorTicks: 5
		};

		var chart = new google.visualization.Gauge(thermostatGraph[0]);

		chart.draw(data, options);

		var thermostatValueSlider = $("<input class='thermostatSlider' type='range' min='60' max=85' />");
		thermostatValueSlider.change(function() {
			var newTemperature = thermostatValueSlider.val();

			automation.setTemperature(device.id, newTemperature);

			data.setValue(1, 1, newTemperature);
			chart.draw(data, options);
		});

		thermostatHtml.append(thermostatValueSlider);
		
		return thermostatHtml;
	}


	automation.fetchAutomationLocation("10").done(function() {
		var rooms = automation.getRooms();
		var devices = automation.getDevices();

		for(var roomId in rooms) {
			var room = rooms[roomId];
			var roomContainer = $("<div class='roomContainer'>").attr("id", roomId);
			var roomName = $("<div class='roomName'>").text(room.name);
			roomContainer.append(roomName);

			var devicesContainer = $("<div class='devicesContainer'>");

			var devices = room.devices;
			for(var deviceId in devices) {
				var device = devices[deviceId];

				devicesContainer.append(getDeviceHtml(device));
			}

			roomContainer.append(devicesContainer);

			$("#main").append(roomContainer);
		}
	});
})();
