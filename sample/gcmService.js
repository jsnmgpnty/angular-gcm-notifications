self.deviceId = null;

self.notificationsApi = null;

self.errorIcon = null;

self.defaultIcon = null;

self.periodicNotifications = [];

self.addEventListener('push', function(event, a, b, c) {  
	var refreshIntervalId = setInterval(function () {
		if (self.deviceId && self.notificationsApi) {
			clearInterval(refreshIntervalId);
			refreshIntervalId = null;
			
			try {
				event.waitUntil(fetch(self.notificationsApi + self.deviceId).then(function (response) {
					if (response.status !== 200) {
						throw new Error();
					}
	
					return response.json().then(function (data) {
						if (!data) {
							throw new Error();
						}
	
						var title = data.title;
						var message = data.content;
						var icon = data.icon;
						var notificationTag = data.tag;
						var url = data.url;
						
						return self.registration.showNotification(title, {
							body: message,
							icon: icon,
							tag: notificationTag,
							data: url
						});
					});
				}).catch(function (err) {
					var title = 'An error occurred';
					var message = 'We were unable to get the information for this push message';
					var icon = self.defaultIcon;
					var notificationTag = 'notification-error';
					return self.registration.showNotification(title, {
						body: message,
						icon: icon,
						tag: notificationTag,
						data: url
					});
				}));
			} catch (ex) {
				console.log(ex);
			}
		}
	}, 250);
});

self.addEventListener("install", function(e) {
	setInterval(function () {
		var notificationsLength = self.periodicNotifications.length;
		for (var i = 0; i < notificationsLength; i++) {
			if (self.periodicNotifications[i]) {
				var dt = self.periodicNotifications[i].date;
				var dtNow = new Date();
				if (dt <= dtNow) {
					var notification = self.periodicNotifications[i].notification;
					var title = notification.title;
					var message = notification.message;
					var icon = notification.icon;
					var notificationTag = notification.tag;
					var url = notification.url;
					
					self.periodicNotifications.splice(i, 1);
					
					return self.registration.showNotification(title, {
						body: message,
						icon: icon,
						tag: notificationTag,
						data: url
					});
				}
			}
		}
	}, 10000);
}, false);

self.addEventListener("message", function(e) {
	if (e.data) {
		if (e.data.type === "default") {
			var data = e.data.data;
			self.deviceId = data.deviceId;
		  self.notificationsApi = data.notificationsApi;
		  self.errorIcon = data.errorIcon;
		  self.defaultIcon = data.defaultIcon;
		} else if (e.data.type === "notifications") {
			var data = e.data.data;
			self.periodicNotifications = data;
		}
	}
}, false);

self.addEventListener('notificationclick', function(event) {  
	console.log('On notification click: ', event.notification.tag);  
	event.notification.close();
	
	var notificationItem = event.notification;

	event.waitUntil(
		clients.matchAll({  
			type: "window"  
		}).then(function(clientList) {  
			for (var i = 0; i < clientList.length; i++) {  
				var client = clientList[i];
				if (notificationItem && notificationItem.data && clients.openWindow) {
					return clients.openWindow(notificationItem.data);  
				}
			}
		})
	);
});