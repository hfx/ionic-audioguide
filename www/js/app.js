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


// ionic-audioguide app

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'ngMap', 'ngCordova'])


.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

  .state('app', {
    url: "/app",
    abstract: true,
    templateUrl: "templates/menu.html",
    controller: 'AppCtrl'
  })

  .state('app.overview', {
    url: "/overview",
    views: {
      'menuContent': {
        templateUrl: "templates/overview.html",
        controller: 'OverviewCtrl'
      }
    }
  })

  
  .state('app.settings', {
    url: "/settings",
    views: {
      'menuContent': {
        templateUrl: "templates/settings.html",
        controller: 'SettingsCtrl'
      }
    }
  })
  
  .state('app.description', {
    url: "/description",
    views: {
      'menuContent': {
        templateUrl: "templates/description.html",
        controller: 'DescrCtrl'
      }
    }
  })
  
  .state('app.browse', {
    url: "/exit",
    views: {
      'menuContent': {
        templateUrl: "templates/exit.html",
          controller: 'ExitCtrl'
      }
    }
  })
    .state('app.audiostations', {
      url: "/audiostations",
      views: {
        'menuContent': {
          templateUrl: "templates/audiostations.html",
          controller: 'AudiostationsCtrl'
        }
      }
    })

  .state('app.audiostation', {
    url: "/audiostation/:audiostationId",
    views: {
      'menuContent': {
        templateUrl: "templates/audiostation.html",
        controller: 'AudiostationCtrl'
      }
    }
  });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/overview');
});
