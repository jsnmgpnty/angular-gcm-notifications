var angularGcmNotifications = angular.module("angularGcmNotifications", []);

angularGcmNotifications.factory("gcmService", ["$http", "$q", "gcmProvider", "$interval",
    function ($http, $q, gcmProvider, $interval) {
    	var isAppInitialized = false;
    	
        var notificationsApiUrl = gcmProvider.getNotificationsApiUrl();
        
        var subscribeServerUrl = gcmProvider.getSubscribeServerUrl();
        
        var unsubscribeServerUrl = gcmProvider.getUnsubscribeServerUrl();
        
       	var errorIcon = gcmProvider.getErrorIcon();

		var defaultIcon = gcmProvider.getDefaultIcon();
		
		var serviceUrl = gcmProvider.getServiceWorkerUrl();
        
        var deviceId = null;
        
        var appId = null;
        
        var isPushEnabled = false;
        
		var subscribeToServer = function (subscription) {
			if (subscription.endpoint.indexOf("https://android.googleapis.com/gcm/send") > -1) {
				var endpointParts = subscription.endpoint.split('/');
				deviceId = endpointParts[endpointParts.length - 1];
			}
				
			var deferred = $q.defer();

            $http({
                url: subscribeServerUrl + deviceId,
                method: "GET"
            }).success(function (response) {
                deferred.resolve(response);
            }).error(function (e) {
                deferred.reject(e);
            });

            return deferred.promise;
		};
		
		var unsubscribeToServer = function (subscription) {
			if (subscription.endpoint.indexOf("https://android.googleapis.com/gcm/send") > -1) {
				var endpointParts = subscription.endpoint.split('/');
				deviceId = endpointParts[endpointParts.length - 1];
			}
				
			var deferred = $q.defer();

            $http({
                url: unsubscribeServerUrl + deviceId,
                method: "GET"
            }).success(function (response) {
            	pushSubscription.unsubscribe().then(function(successful) {
					isPushEnabled = false;
                	deferred.resolve(response);
				}).catch(function(e) {
					console.log('Unsubscription error: ', e);
					isPushEnabled = false;
                	deferred.reject(e);
				});  
            }).error(function (e) {
                deferred.reject(e);
            });

            return deferred.promise;
		};
		
		var initializeState = function () {
			// Are Notifications supported in the service worker?
			if (!('showNotification' in ServiceWorkerRegistration.prototype)) {  
				console.warn('Notifications aren\'t supported.');
				return;
			}
			
			// Check the current Notification permission.  
			// If its denied, it's a permanent block until the  
			// user changes the permission  
			if (Notification.permission === 'denied') {  
				console.warn('The user has blocked notifications.');  
				return;  
			}
		
			// Check if push messaging is supported  
			if (!('PushManager' in window)) {  
				console.warn('Push messaging isn\'t supported.');  
				return;  
			}
		
			navigator.serviceWorker.ready.then(function(serviceWorkerRegistration) {  
				serviceWorkerRegistration.pushManager.getSubscription().then(
					function(subscription) {
						isAppInitialized = true;
						
						if (!subscription) return;
						subscribeToServer(subscription).then(function (response) {
							var data = {
								deviceId: response,
								notificationsApi: notificationsApiUrl,
								errorIcon: errorIcon,
								defaultIcon: defaultIcon
							};
	                		navigator.serviceWorker.controller.postMessage(data);
						});
				  }).catch(function(err) {
						console.warn('Error during getSubscription()', err); 
				  });
			});
		};
		
		var unsubscribe = function () {
       		navigator.serviceWorker.ready.then(function(serviceWorkerRegistration) {  
	        	serviceWorkerRegistration.pushManager.getSubscription().then(  
					function(pushSubscription) {
						if (!pushSubscription) { 
							isPushEnabled = false;
							return;  
						}  
	
						var subscriptionId = pushSubscription.subscriptionId;
						unsubscribeToServer(subscriptionId);
					}).catch(function(e) {  
						console.error('Error thrown while unsubscribing from push messaging.', e);  
					}); 
			});
       };
       
       var subscribe = function () {
       		navigator.serviceWorker.ready.then(function(serviceWorkerRegistration) {  
	        	serviceWorkerRegistration.pushManager.subscribe({ userVisibleOnly: true }).then(
	        		function(subscription) {  
						isPushEnabled = true;
						return subscribeToServer(subscription);  
					})
					.catch(function(e) {  
						if (Notification.permission === 'denied') { 
							console.warn('Permission for Notifications was denied');  
						} else {  
							console.error('Unable to subscribe to push.', e);
						}  
						isPushEnabled = false;  
					});
			});
       };
		
        return {
            togglePushState: function (toggle) {
            	if (typeof toggle === "undefined") {
            		isPushEnabled = !isPushEnabled;
            		
            		if (isPushEnabled) {
            			subscribe();
            		} else {
            			unsubscribe();
            		}
            		
            		return isPushEnabled;
            	}
            	
            	isPushEnabled = toggle;
            	
            	if (isPushEnabled) {
        			subscribe();
        		} else {
        			unsubscribe();
        		}
            	return isPushEnabled;
            },
            
            initialize: function () {
            	if ('serviceWorker' in navigator) {  
					navigator.serviceWorker.register(serviceUrl).then(initializeState);  
				} else {  
					console.warn('Service workers aren\'t supported in this browser.');  
				} 
           },
            
           subscribe: function () {
           		subscribe();
           },
            
            unsubscribe: function () {
            	unsubscribe();
            }
        };
    }
]);

angularGcmNotifications.provider("gcmProvider", [function () {
    var notificationsApiUrl = "";
        
    var subscribeServerUrl = null;
    
    var unsubscribeServerUrl = null;
    
   	var errorIcon = null;

	var defaultIcon = null;
	
	var serviceUrl = null;

    this.$get = [function () {
        return {
            /* Getters */
            getNotificationsApiUrl: function () {
                return notificationsApiUrl;
            },

            getSubscribeServerUrl: function () {
                return subscribeServerUrl;
            },

            getUnsubscribeServerUrl: function () {
                return unsubscribeServerUrl;
            },

            getErrorIcon: function () {
                return errorIcon;
            },

            getDefaultIcon: function () {
                return defaultIcon;
            },
            
            getServiceWorkerUrl: function () {
            	return serviceUrl;
            },

            /* Setters */
            setNotificationsApiUrl: function (val) {
            	notificationsApiUrl = val;
            },

            setSubscribeServerUrl: function (val) {
                subscribeServerUrl = val;
            },

            setUnsubscribeServerUrl: function (val) {
                unsubscribeServerUrl = val;
            },

            setErrorIcon: function (val) {
                errorIcon = val;
            },

            setDefaultIcon: function (val) {
                defaultIcon = val;
            },
            
            setServiceWorkerUrl: function (val) {
            	serviceUrl = val;
            }
        };
    }];
}]);