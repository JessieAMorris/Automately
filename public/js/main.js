"use strict";

(function() {
	var fabric = new _.Fabric();

	function getDeviceHtml(device) {
		var deviceHtml = $("<div class='deviceContainer'>").attr("id", device.id).addClass(device.type);
		var deviceName = $("<div class='deviceName'>").text(device.name);

		deviceHtml.append(deviceName);

		var deviceControlHtml = $("<div class='deviceControl'>");
		switch(device.type) {
			case "thermostat":
				deviceControlHtml.append(getThermostatHtml(device, deviceHtml));

				break;
			case "light":
				deviceControlHtml.append(getLightHtml(device, deviceHtml));
				break;
		}

		deviceHtml.append(deviceControlHtml);

		return deviceHtml;
	}

	function getThermostatHtml(device) {
		var thermostatHtml = $("<div class='thermostatContainer'>");
		var thermostatGraph = $("<div class='thermostatGraph'>");
		thermostatHtml.append(thermostatGraph);

		device.chart = new google.visualization.Gauge(thermostatGraph[0]);
		device.chart.options = {
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
		device.chart.data = google.visualization.arrayToDataTable([
			['Label', 'Value'],
			['Current Temp', device.currentTemperature],
			['Goal Temp', device.goalTemperature]
		]);

		device.chart.draw(device.chart.data, device.chart.options);

		var thermostatValueSlider = $("<input class='thermostatSlider' type='range' min='60' max=85' />").val(device.goalTemperature);
		thermostatValueSlider.change(function() {
			var newTemperature = thermostatValueSlider.val();

			automation.setTemperature(device.id, newTemperature);
		});

		thermostatHtml.append(thermostatValueSlider);
		
		return thermostatHtml;
	}

	function getLightHtml(device, deviceHtml) {
		var lightHtml = $("<div class='lightContainer'></div>");
		var lightToggle = $("<div class='lightToggle'>");
		lightHtml.append(lightToggle);

		// Add the status indicator next to the name
		var lightStatus = $("<div class='lightStatus'/>").addClass(device.state);
		$(".deviceName", deviceHtml).append(lightStatus)

		var lightCheckbox = $("<input class='lightToggle' type='checkbox' />");
		lightCheckbox.change(function() {
			var isOn = lightCheckbox.val();

			automation.toggleLight(device.id, isOn);
		});

		lightToggle.append(lightCheckbox);
		
		return lightHtml;
	}

	automation.setFabric(fabric);

	automation.fetchAutomationLocation("10").done(function() {
		var rooms = automation.getRooms();
		var devices = automation.getDevices();

		subscribeToEvents();

		var roomsNav = $("#roomsNav");
		var roomsContent = $("#roomsContent");

		for(var roomId in rooms) {
			var room = rooms[roomId];

			var roomNav = $("<li class='roomNavItem presentation'></li>").attr("id", roomId + "_nav")
			var roomNavAnchor = $("<a role='tab' data-toggle='pill'>").attr("aria-controls", roomId + "_nav");
			roomNav.append(roomNavAnchor);

			$("a", roomNav).text(room.name).attr("href", "#" + roomId + "_tab");

			var roomContainer = $("<div role='tabpanel' class='tab-pane roomContainer'>").attr("id", roomId + "_tab");
			var roomName = $("<div class='roomName'>").text(room.name);
			roomContainer.append(roomName);

			// Make the first room active by default
			if(roomsNav.children().length === 0) {
				roomNav.addClass("active");
				roomContainer.addClass("active in");
			} else {
				roomContainer.addClass("fade");
			}


			var devicesContainer = $("<div class='devicesContainer'>");

			var devices = room.devices;
			for(var deviceId in devices) {
				var device = devices[deviceId];

				devicesContainer.append(getDeviceHtml(device));
			}

			roomContainer.append(devicesContainer);

			roomsNav.append(roomNav);
			roomsContent.append(roomContainer);
		}
	});

	function lightUpdated(published) {
		var device = published.data;

		var deviceContainer = $("#" + device.id);

		$(".lightStatus", deviceContainer).removeClass("on off").addClass(device.state);
		$(".lightToggle", deviceContainer).val(device.state === "on" ? true : false);
	}

	function thermostatUpdated(published) {
		var device = published.data;

		var deviceContainer = $("#" + device.id);

		// TODO: Move this to a handler
		device.chart.data.setValue(1, 1, device.goalTemperature);
		device.chart.draw(device.chart.data, device.chart.options);
		$(".lightToggle", deviceContainer).val(device.goalTemperature);
	}

	function subscribeToEvents() {
		fabric.subscribe({
			urn: "lights:*:updated",
			callback: lightUpdated
		});

		fabric.subscribe({
			urn: "thermostats:*:updated",
			callback: thermostatUpdated
		});
	}
})();
