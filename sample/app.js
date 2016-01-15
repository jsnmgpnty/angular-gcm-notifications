var sample = angular.module("sample", ["angularGcmNotifications"]);

sample.run(["gcmProvider", function (gcmProvider) {
	gcmProvider.setNotificationsApiUrl("http://localhost/push/api/push/notifications?registrationId=");
	gcmProvider.setSubscribeServerUrl("http://localhost/push/api/push/subscribe?registrationId=");
	gcmProvider.setUnsubscribeServerUrl("http://localhost/push/api/push/unsubscribe?registrationId=");
	gcmProvider.setServiceWorkerUrl("gcmService.js");
	gcmProvider.setErrorIcon();
	gcmProvider.setDefaultIcon();
}]);

sample.controller('sampleController', ["$scope", "gcmService", "$http", "$q", function($scope, gcmService, $http, $q) {
	$scope.isNotificationEnabled = false;
	
	$scope.setNotifications = function () {
		var notifications = [
			{
				date: new Date(new Date().getTime() + (1 * 60000)),
				notification: {
					message: "This is a periodic notification",
					icon: "",
					tag: "sample_periodic_notification",
					data: "https://www.google.com",
					title: "Periodic notification",
					isDone: false
				}
			},
			{
				date: new Date(new Date().getTime() + (2 * 60000)),
				notification: {
					body: "This is a periodic notification",
					icon: "",
					tag: "sample_periodic_notification",
					data: "https://www.google.com",
					title: "Periodic notification",
					isDone: false
				}
			},
			{
				date: new Date(new Date().getTime() + (3 * 60000)),
				notification: {
					body: "This is a periodic notification",
					icon: "",
					tag: "sample_periodic_notification",
					data: "https://www.google.com",
					title: "Periodic notification",
					isDone: false
				}
			}
		];
		
		gcmService.setPeriodicNotifications(notifications);
	};
	
	$scope.sendNotifications = function () {
    $http({
        url: "http://localhost/push/api/push/trigger",
        method: "GET"
    }).success(function (response) {
    	console.log(response);
    }).error(function (e) {
        deferred.reject(e);
    });
	};
	
	$scope.toggleNotifications = function () {
		$scope.isNotificationsEnabled = gcmService.togglePushState();
	};
	
	$scope.isPushEnabled = function () {
		if ($scope.isNotificationsEnabled) {
			return "Disable notifications";
		} else {
			return "Enable notifications";
		}
	};
	
	gcmService.initialize();
}]);