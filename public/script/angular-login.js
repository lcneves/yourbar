(function() {
    var app = angular.module('loginModule', []);
    app.factory('loginStatus', function() {
        var service = {};
        service.getLogin = function() {
            return jQuery.post("session/check", function(data) {
                hasCheckedLogin = true;
                service.data = username = data;
                return service.data;
            });
        };
        return service;
    });
    
    app.controller('StatusController', ['$scope', 'loginStatus', function($scope, loginStatus) {
        $scope.receivedLogin = false;
        $scope.getLogin = function() {
            loginStatus.getLogin().then(function() {
                $scope.$emit('received', true)
                $scope.receivedLogin = true;
                if (loginStatus.data) {
                    $scope.$emit('user', loginStatus.data);
                    $scope.user = loginStatus.data;
                    $scope.isLogged = true;
                } else {
                    $scope.$emit('user', false);
                    $scope.user = loginStatus.data;
                    $scope.isLogged = false; 
                }
                $scope.$apply();
            });
        };
        $scope.getLogin();
    }]);
    
    app.controller('RegisterController', ['$scope', function($scope) {
        $scope.user = {
            username: '',
            password: '',
            passwordRepeat: '',
            realname: ''
        };
        $scope.message = "";
        $scope.register = function() {
            var enteredUser = JSON.parse(JSON.stringify($scope.user));
            jQuery.post("session/register", enteredUser, function(data) {
                if (data === true) {
                    jQuery.post("session/login", enteredUser, function(data) {
                        $scope.$parent.getLogin();
                    });
                } else {
                    $scope.message = data;
                    $scope.user.password = '';
                    $scope.user.passwordRepeat = '';
                    $scope.$apply();
                }
            });
        };
    }]);
    
    app.controller('LoginController', ['$scope', function($scope) {
        $scope.user = {
            username: '',
            password: ''
        };
        $scope.message = "";
        $scope.login = function() {
            jQuery.post("session/login", $scope.user, function(data) {
                $scope.user.password = '';
                if (data.message) {
                    $scope.message = data.message;
                    $scope.$apply();
                } else {
                    $scope.$parent.getLogin();
                }
            });
        };
    }]);
    
    app.controller('LogoutController', ['$scope', function($scope) {
        $scope.logout = function() {
            jQuery.post("session/logout", function(data) {
                $scope.$parent.getLogin();
            });
        };
    }]);
})();