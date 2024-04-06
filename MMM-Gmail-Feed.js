Module.register("MMM-Gmail-Feed", {
	mailData: null,
	intervalFetch: null,
	// holder for config info from module_name.js
	config:null,

	// anything here in defaults will be added to the config data
	// and replaced if the same thing is provided in config
	defaults: {
		gmail: "magicmirrorbyvk@gmail.com",
		password: "yqcu bpdg lfqp fhdc",
		fetchInterval: 10000,
		maxMails: 5,
	},

	init: function(){
	},

	start: function(){
	},

	loaded: function(callback) {
	},

	// return list of other functional scripts to use, if any (like require in node_helper)
	getScripts: function() {
	return	[]
	}, 

	// return list of stylesheet files to use if any
	getStyles: function() {
		return 	['style.css'];
	},

	// only called if the module header was configured in module config in config.js
	getHeader: function() {
		return `Danh sách mail chưa đọc<br>(${this.config.gmail})`; 
	},

	notificationReceived: function(notification, payload, sender) {
		if(notification==="ALL_MODULES_STARTED"){
			// send our config to our node_helper
			this.sendSocketNotification("CONFIG",this.config)
		} else if (notification === "MODULE_DOM_CREATED") {
			this.getMailByInterval();
		}
	},

	socketNotificationReceived: function(notification, payload) {
		if(notification === "Fetch_Mail_Data_Json"){
			this.mailData = payload;
			this.updateDom();

		} else if (notification === "Fetch_Mail_Data_Error") {
			console.log(payload);
		}
	},

	suspend: function(){

	},

	resume: function(){

	},

	getDom: function() {
		var wrapper = document.createElement("table");
		var table_html = `
			<tr>
				<th class="left-align">Người gửi</th>
				<th class="title">Tiêu đề</th>
				<th class="right-align">Thời gian</th>
			</tr>
		`

		if (this.mailData !== null && this.mailData.feed.hasOwnProperty("entry")) {
			entries = this.mailData.feed.entry;
			
			if (!Array.isArray(entries)) {
				entries = [entries];
			}

			now = Date.now() /1000;
			for (i = 0; i < this.config.maxMails && i < entries.length; ++i) {
				time = new Date(entries[i].issued);
				unixTime = time.getTime() / 1000;

				subTime = now - unixTime;
				timeResult = "";
				if (subTime < 24*60*60) {
					if (subTime < 60*60) {
						if (subTime < 60) {
							timeResult = "< 1 phút trước"
						} else {
							timeResult = `${Math.floor(subTime / 60)} phút trước`;
						}
					} else {
						timeResult = `${Math.floor(subTime / (60*60))} giờ trước`;
					}
				} else {
					hours = time.getHours() < 10 ? `0${time.getHours()}` : `${time.getHours()}`;
					minutes = time.getMinutes() < 10 ? `0${time.getMinutes()}` : `${time.getMinutes()}`;
					date = time.getDate() < 10 ? `0${time.getDate()}` : `${time.getDate()}`;
					month = time.getMonth()+1 < 10 ? `0${time.getMonth()+1}` : `${time.getMonth()+1}`;

					timeResult = `${hours}:${minutes} ${date}/${month}/${time.getFullYear()}`;
				}

				table_html += `
				<tr>
					<td class="left-align">${entries[i].author[0].name}</td>
					<td class="title">${entries[i].title}</td>
					<td class="right-align">${timeResult}</td>
				</tr>
				`
			}
		}
		wrapper.innerHTML = table_html;
		return wrapper;
	},

	getMailByInterval: function() {
		this.sendSocketNotification("Fetch_Mail_Data");
		if (this.intervalFetch !== null) {
			this.pauseGetMail();
		}
		this.intervalFetch = setInterval(() => {
			this.sendSocketNotification("Fetch_Mail_Data");
		}, this.config.fetchInterval);
	},

	pauseGetMail: function() {
		if (this.intervalFetch !== null) {
			clearInterval(this.intervalFetch);
			this.intervalFetch = null;
		}
	},
})
