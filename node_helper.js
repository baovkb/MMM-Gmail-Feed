var NodeHelper = require("node_helper");
var xml2js = require("xml2js");

module.exports = NodeHelper.create({

	init(){
	},

	start() {
		console.log('Starting module helper:' +this.name);
	},

	stop(){
		console.log('Stopping module helper: ' +this.name);
	},

	socketNotificationReceived(notification, payload) {
		console.log(this.name + " received a socket notification: " + notification + " - Payload: " + payload);
		// if config message from module
		if (notification === "CONFIG") {
			this.config=payload
		}
		else if(notification === "Fetch_Mail_Data") {
			this.getMail();
		}

	},

	getMail: async function() {
		const response = await fetch(
			"https://mail.google.com/mail/u/0/feed/atom",
			{
				headers: {
				Authorization: `Basic ${btoa(`${this.config.gmail}:${this.config.password}`)}`
				}
			});

			if (!response.ok) {
				this.sendSocketNotification("Fetch_Mail_Data_Error", error.message);
				return;
			}
		
		const body = await response.text();
		const json = xml2js.parseString(body, (error, result) => {
			this.sendSocketNotification("Fetch_Mail_Data_Json", result);
		});		
	}


});