/**
 * Created by PG on 30/07/2017.
 */
angular.module('posbroker')
    .controller('homeController', ['$scope', '$http', '$window', '$routeParams', function ($scope, $http, $window, $routeParams) {
        $scope.shop = $routeParams.shop;
        console.log($scope.shop);


        function getShopData() {
            $http.get('shop/' + $scope.shop).then(function (result) {
                console.log(result.data);

            }, function (err) {
                console.log(err);
            })
        }
        getShopData();


    }])
