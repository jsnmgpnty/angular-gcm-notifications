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