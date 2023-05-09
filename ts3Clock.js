registerPlugin({
	name: 'Ts3 clock',
	version: '0.1',
	description: 'Clock for using with sinusbot, it shows the hour in a channel and can send alerts(pokes) if user wish',
	author: 'Ronald',
	vars: {
		//Here the user will select wich channel of the server will be modified
		id1: {
			title: 'Channel for Line #1',
			type: 'channel'
		},
		//interval of time for refreshing the hour, set to 1 minute by default
		interval: {
			title: 'Update interval',
			type: 'number',
			placeholder: '1'
		},
		//format of 12hours or 24hours
		format: {
			title: 'Format',
			type: 'select',
			options: ['24h', '12h']
		},
		//number of digits in your clock
		digits: {
			title: 'Digits',
			type: 'select',
			options: ['1-digit (0:00)', '2-digits (00:00)']
		},
		//style of text showed in the clock
		style: {
			title: 'Time design',
			type: 'select',
			options: ['01:23', '⓪①:②③', '⓿❶:❷❸', 'Ⓞ⓵:⓶⓷', '𝟘𝟙:𝟚𝟛', '⁰¹*²³']
		},
		//timezone based in the UTC
		timezone: {
			title: 'Time zone',
			type: 'select',
			options: ['UTC-12:00', 'UTC-11:00', 'UTC-10:00', 'UTC-09:30', 'UTC-09:00', 'UTC-08:00', 'UTC-07:00', 'UTC-06:00', 'UTC-05:00', 'UTC-04:30', 'UTC-04:00', 'UTC-03:30', 'UTC-03:00',
				'UTC-02:00', 'UTC-01:00', 'UTC±00:00', 'UTC+01:00', 'UTC+02:00', 'UTC+03:00', 'UTC+03:30', 'UTC+04:00', 'UTC+04:30', 'UTC+05:00', 'UTC+05:30', 'UTC+05:45', 'UTC+06:00', 'UTC+06:30',
				'UTC+07:00', 'UTC+08:00', 'UTC+08:30', 'UTC+08:45', 'UTC+09:00', 'UTC+09:30', 'UTC+10:00', 'UTC+10:30', 'UTC+11:00', 'UTC+12:00', 'UTC+12:45', 'UTC+13:00', 'UTC+14:00']
		},
		//This option allows to the user to send alerts at an previous configured time
		//if this is not selected, alerts of any kind won't be send
		wannaPoke: {
			title: 'Send alerts to all server clients?',
			type: 'select',
			placeholder: 'message',
			options: ['Yes', 'No']
		},
		//here the user enters the hours where want to receive alerts, the input must be done in csv format
		//example :  hh:mm,hh:mm,hh:mm...
		hours: {
			title: 'Enter the hours where you want to send the alert',
			type: 'multiline',
			placeholder: 'Enter the hours in the next format: H1:M1,H2:M2,H3:M3...'
		},
		//the message that will be sent at the momment of the alert
		//if user leaves this empty, no alert will be send
		messageToPoke: {
			title: 'Message',
			type: 'multiline',
			placeholder: 'Enter here your message'
		},
		//this option must be selected if user wants an anticipated alert
		wannaAnticiPoke: {
			title: 'Do you want anticipated alert?',
			type: 'select',
			options: ['Yes', 'No']
		},
		//anticipation time to send the anticipated alert
		anticipationTime: {
			title: 'Select how many minutes you want to receive anticipated alert',
			type: 'number',
			placeholder: '5'
		},
		//message to be sent with the anticipated alert, if user leaves it empty, alert won't be send
		optMessageToPoke: {
			title: 'Message',
			type: 'multiline',
			placeholder: 'Enter here your message'
		}

	}
}, function (sinusbot, config) {
	var backend = require('backend');
	var engine = require('engine');

	//if there's no configuration the script won't run
	if (!config || !config.id1) {
		engine.log("Channel for clock not configured!, disabling it...");
		return;
	}


	//if there's no channel selected the script won't run
	if (backend.getChannelByID(config.id1) === undefined) {
		engine.log("Channel for clock not configured!, disabling it...");
		return;
	}
	//here are the clock styles that will be shown
	if (config.style == 0) {
		var clockFont = [
			['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', ':']
		];
	} else if (config.style == 1) {
		var clockFont = [
			['⓪', '①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨', ':']
		];
	} else if (config.style == 2) {
		var clockFont = [
			['⓿', '❶', '❷', '❸', '❹', '❺', '❻', '❼', '❽', '❾', ':']
		];
	} else if (config.style == 3) {
		var clockFont = [
			['Ⓞ', '⓵', '⓶', '⓷', '⓸', '⓹', '⓺', '⓻', '⓼', '⓽', ':']
		];
	} else if (config.style == 4) {
		var clockFont = [
			['𝟘', '𝟙', '𝟚', '𝟛', '𝟜', '𝟝', '𝟞', '𝟟', '𝟠', '𝟡', ':']
		];
	} else if (config.style == 5) {
		var clockFont = [
			['⁰', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹', '*']
		];
	}



	//here we set the timezones, equally orderes as they appear in the options
	var timezones = [-12, -11, -10, -9.5, -9, -8, -7, -6, -5, -4.5, -4, -3.5, -3, -2, -1, 0, 1, 2, 3, 3.5, 4, 4.5, 5, 5.5, 5.75, 6,
		6.5, 7, 8, 8.5, 8.75, 9, 9.5, 10, 10.5, 11, 12, 12.75, 13, 14];



	//this function will update the hour
	function updateHour() {
		var nonutc = new Date();
		var utc = nonutc.getTime() + (nonutc.getTimezoneOffset() * 60000);
		var time = new Date(utc + (3600000 * timezones[config.timezone]));
		var hours = 0;



		if (config.format == 0) {
			hours = time.getHours();
		} else if (config.format == 1) {
			hours = time.getHours() % 12 || 12;
		}
		var minutes = time.getMinutes();
		var lines = [''];
		for (var i = 0; i < 1; i++) {
			lines[i] = '[cspacer]' + String.fromCharCode(9472);
			if (hours >= 10) {
				lines[i] += clockFont[i][Math.floor(hours / 10)];
			} else {
				if (config.digits == 1) {
					lines[i] += clockFont[i][0];
				}
			}
			lines[i] += clockFont[i][hours % 10];
			lines[i] += clockFont[i][10]; // :
			lines[i] += clockFont[i][Math.floor(minutes / 10)];
			lines[i] += clockFont[i][minutes % 10];

		}

		var channel_id1 = backend.getChannelByID(config.id1);


		channel_id1.update({ name: lines[0] });
	};
	updateHour();

	function sendPoke(message) {
		var clients = backend.getClients();



		clients.forEach(function (client) {
			client.poke(message);
		}
		)
	};
	//if the anticipated time is not configured, but the 'Send anticipated alert' is set as true, the alert will be send
	//whithin 5 minutes of anticipation as default
	var antTime = 5;
	//if another time is set, then antTime will be set to that time
	if (config.anticipationTime) {
		antTime = config.anticipationTime;
	}
	//this function gets the hours setted by the user and creates a list of them, every run it updates and compare the times between the actual time and the 
	//setted hours, it can send pokes with anticipation too
	function pokeTimer(min) {
		hourslist = config.hours ? config.hours.split(',') : [];
		hourslist.forEach(function (value) {
			let hour = value.split(':');
			try {
				let minutes = parseInt(hour[0]) * 60 + parseInt(hour[1]);
				//with this we solve the problem at comparing smaller hours for example 23:59 vs 00:00
				if ((minutes - min) < 0) {
					minutes = 1440 + parseInt(hour[1]);
				}
				if (min == minutes && config.wannaPoke == 0 && config.messageToPoke != '') {
					sendPoke(config.messageToPoke);

				}

				if ((minutes - min) == antTime && config.wannaAnticiPoke == 0 && config.optMessageToPoke != '' && config.wannaPoke == 0 && config.messageToPoke != '') {
					sendPoke(config.optMessageToPoke);
				}
			} catch (error) {
				engine.log("Error at configured hours!");
			}



		});
	};

	var inter = 1;
	if (config.interval) {
		inter = config.interval;
	}
	var old = 0;
	//here is the interval for every script's run, at every iteration, it runs our configured functions
	setInterval(function () {
		var nonutc = new Date();
		var utc = nonutc.getTime() + (nonutc.getTimezoneOffset() * 60000);
		var now = new Date(utc + (3600000 * timezones[config.timezone]));

		if (now.getMinutes() != old) {
			old = now.getMinutes();
			timecomp = now.getMinutes() + now.getHours() * 60;

			updateHour();
			pokeTimer(timecomp);
		}

	}, inter * 1000);



	engine.log("Clock has been initialized!");
});