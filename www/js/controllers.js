/*
    Copyright (c) 2015 Felix Herrmann (github.com/hfx)

    This file is part of ionic-audioguide.

    ionic-audioguide is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 2 of the License, or
    (at your option) any later version.

    ionic-audioguide is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with ionic-audioguide.  If not, see <http://www.gnu.org/licenses/>.
*/


var PROJECT_URL="http://<URL to your webserver>"
angular.module('starter.controllers', [])

// static page for description, contents in templates/description.html 
.controller('DescrCtrl', function($scope) {
})

// exit controller
.controller('ExitCtrl', function($scope) {
    $scope.$on('$destroy', function() {
        $scope.stop();
    });
    ionic.Platform.exitApp();
    navigator.app.exitApp();
})

// map and gelocation controller
.controller('OverviewCtrl', function($scope, $http, $interval, $ionicPopup, $state, $rootScope) {
        
    $scope.click = function (aid) {
        for (var key in aid) {
          console.log(key);
        }
        console.log("ID" + aid.latLng)
        $state.go('app.audiostation', {"audiostationId": aid})
    }

    // Calculate distance between points 
    function calcDistance(lat1, long1, lat2, long2) {
        var p1 = new google.maps.LatLng(lat1, long1);
        var p2 = new google.maps.LatLng(lat2, long2);
        distance = google.maps.geometry.spherical.computeDistanceBetween(p1,p2);

        // Return the distance in meters
        return distance;
    }; 

    // preparations to get current position 
     var gmap_options = {
          enableHighAccuracy: true,
          timeout: 60000,
          maximumAge: 0
    };
    
    function gmap_success(pos) {
        crd = pos.coords;
        $scope.crd = crd;
    };

    function gmap_error(err) {
        console.warn('ERROR(' + err.code + '): ' + err.message);
    };
    // initial run to get current position
    navigator.geolocation.getCurrentPosition(gmap_success, gmap_error, gmap_options);

    // function to get current position
    $scope.currentPosition = function() {
        navigator.geolocation.watchPosition(gmap_success, gmap_error, {enableHighAccuracy: true, timeout: 10000});
        console.log('position update ' + $scope.crd.latitude + ',' + $scope.crd.longitude)
        nextAS();
        $scope.marker = {
            position: [$scope.crd.latitude, $scope.crd.longitude]
          }
        }

    // update every 15 seconds 
    $interval($scope.currentPosition, 15000);

   function nextAS () { 
        // find first nearby audiostation
        $scope.audiostations.forEach( function (as) {
            dist = calcDistance($scope.crd.latitude, $scope.crd.longitude, 
            as.latitude, as.longitude)
            //dist = calcDistance($scope.fixedlat, $scope.fixedlong, as.latitude, as.longitude)
            if (dist <= 50) {
                //console.log(dist)
                console.log("isPlaying " + $rootScope.isPlaying)
                console.log("autoMode " + $rootScope.automode)
                // don't change automatically to next audiostation if audio is played 
                if ($rootScope.isPlaying != true && $rootScope.automode != false) {
                    console.log("goto " + as.dbid)
                    $state.go('app.audiostation', {"audiostationId": as.dbid})
                }
            }
        })
    }

    // get JSON from server
    $http.get(PROJECT_URL + "audiofiles/guide/1/")
    .success(function(response)
    {
        $scope.title = response.title;
        $scope.description = response.description;
        $scope.audiostations = response.segments;
        console.log($scope.map)
        $scope.markers = [];
        $scope.audiostations.forEach( function (as) {
            console.log(as.dbid)
            var latLng = new google.maps.LatLng(as.latitude, as.longitude);
            var marker = new google.maps.Marker({position:latLng, map:$scope.map, title:as.address});
            $scope.markers.push(marker)
        })
    })
    .error(function(response)
    {
        console.log('RESPONSE' + response.data)
        $ionicPopup.alert({title: 'Error', text: response.data})
    })

})

// settings controller, so far only a switch for gps auto-mode on/off
.controller('SettingsCtrl', function($scope, $ionicLoading, $ionicPopup, $rootScope, $timeout) {
        $scope.pushNotificationChange = function() {
            $timeout(function() {
                console.log('Push Notification Change: '+ $scope.pushNotification.checked);
                $rootScope.automode = $scope.pushNotification.checked
                console.log('AutoMode ' + $rootScope.automode)
            }, 0);
        };
          
        $scope.pushNotification = { checked: true };
})

// audiostations controller, get from server information about the guide and all included audiostations 
.controller('AudiostationsCtrl', function($scope, $http, $ionicPopup) {
    $http.get(PROJECT_URL + "audiofiles/guide/1/")
    .success(function(response)
    {
        $scope.title = response.title;
        $scope.description = response.description;
        $scope.audiostations = response.segments;
    })
    .error(function(response)
    {
        console.log('RESPONSE' + response.status)
        $ionicPopup.alert({title: 'Error', text: response})
        $scope.title = response
    })
})

// audiostation controller, auto playback through streaming the linked media file from server 
// code for this controller adapted from https://github.com/devgeeks/ExampleHTML5AudioStreaming/blob/master/www/scripts/html5audio.js
// Copyright (c) 2011 Tommy-Carlos Williams (github.com/devgeeks)
// this part of code is licensed under The MIT license by the original author, please see https://github.com/devgeeks/ExampleHTML5AudioStreaming#license
.controller('AudiostationCtrl', function($scope, $rootScope, $http, $stateParams, $cordovaMedia) {
    var audioplayer = function() {
        // check if audio is running and stop it
        try {
            $rootScope.myaudio.stop()
            $rootScope.isPlaying = false;
        }
        catch (e) {
            console.log('no audio running')
            $rootScope.isPlaying = false;
        }
        $rootScope.audio = new Audio($rootScope.audio_file);
        if ($rootScope.isPlaying == false) { 
            console.log('ip false=' + $rootScope.isPlaying)
            $rootScope.isPlaying = true;
            $rootScope.audio.autoplay = true;
            
        }
        console.log('rs ' + $rootScope.audio)
        var readyStateInterval = null;


        $rootScope.myaudio = {
            play: function()
            {
                $rootScope.isPlaying = true;
                $rootScope.audio.play();
            
                $rootScope.audio.addEventListener("error", function() {
                     console.log('$rootScope.audio ERROR');
                }, false);
                $rootScope.audio.addEventListener("canplay", function() {
                     console.log('$rootScope.audio CAN PLAY');
                }, false);
                $rootScope.audio.addEventListener("waiting", function() {
                     //console.log('$rootScope.audio WAITING');
                     $rootScope.isPlaying = false;
                }, false);
                $rootScope.audio.addEventListener("playing", function() {
                     $rootScope.isPlaying = true;
                }, false);
                $rootScope.audio.addEventListener("ended", function() {
                     //console.log('$rootScope.audio ENDED');
                     navigator.notification.alert('Streaming failed. Possibly due to a network error.', null, 'Stream error', 'OK');
                      navigator.notification.confirm(
                     	'Streaming failed. Possibly due to a network error.', // message
                     	onConfirmRetry,	// callback to invoke with index of button pressed
                     	'Stream error',	// title
                     	'Retry,OK'		// buttonLabels
                      );
                     if (window.confirm('Streaming failed. Possibly due to a network error. Retry?')) {
                        onConfirmRetry();
                     }
                }, false);
            },
            pause: function() {
                $rootScope.isPlaying = false;
                clearInterval(readyStateInterval);
                $rootScope.audio.pause();
            },
            stop: function() {
                $rootScope.isPlaying = false;
                clearInterval(readyStateInterval);
                $rootScope.audio.pause();
                $rootScope.audio = null;
                $rootScope.audio = new Audio($rootScope.audio_file);
            }
        };

    }
    $audiostationId = $stateParams.audiostationId
    $http.get(PROJECT_URL + "audiofiles/segment/" + $audiostationId)
    .success(function(response)
    {
        $scope.segment = response;
        $rootScope.audio_file = response.audio_file
        audioplayer()
    })
});
