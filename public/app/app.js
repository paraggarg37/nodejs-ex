angular.module('posbroker', ['ngMaterial', 'ngRoute'])

    .config(['$compileProvider', '$mdThemingProvider', '$routeProvider', function ($compileProvider, $mdThemingProvider, $routeProvider) {
        'use strict';

        $compileProvider.debugInfoEnabled(false);

        $mdThemingProvider.theme('default')
            .primaryPalette('blue')
            .accentPalette('pink');


        $routeProvider.when("/", {
            templateUrl: "app/modules/main/main.html",
            controller: "mainController"
        })
        $routeProvider.when("/home/:shop", {
            templateUrl: "app/modules/home/home.html",
            controller: "homeController"
        }).when("/red", {
            templateUrl: "red.html"
        })

    }])


    .controller('appController', ['$scope', '$http', function ($scope, $http) {

        $scope.toggleLeft = buildToggler('left');
        $scope.isOpenLeft = function () {
            return $mdSidenav('right').isOpen();
        };

        function buildToggler(navID) {
            return function () {
                // Component lookup should always be available since we are not using `ng-if`
                $mdSidenav(navID)
                    .toggle()
                    .then(function () {
                    });
            };
        }


    }]);
