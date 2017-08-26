/**
 * Created by PG on 30/07/2017.
 */
angular.module('posbroker')
    .controller('mainController', ['$scope', '$http','$window', function ($scope, $http,$window) {


        $scope.name = "";
        $scope.onSubmit = function () {

            $http.get("getUrl?name=" + $scope.name).then(function (result) {
                $window.location.href = result.data.url;
            })
        }

    }])
