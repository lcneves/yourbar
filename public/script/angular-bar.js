(function() {
    var app = angular.module('barModule', ['loginModule']);
    app.config(function($locationProvider) {
        $locationProvider.html5Mode(true).hashPrefix('!');
    });
    app.controller('MainController', ['$scope', 'loginStatus', function($scope, loginStatus) {
        
        // Check for login status using loginModule's loginStatus factory
        
        $scope.receivedLogin = false;
        $scope.isLogged = false;
        $scope.user = '';
        loginStatus.getLogin().then(function() {
            $scope.receivedLogin = true;
            if (loginStatus.data) {
                $scope.user = loginStatus.data;
                $scope.isLogged = true;
            }
            $scope.$apply();
        });
    }]);
}());