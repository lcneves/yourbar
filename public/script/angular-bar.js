(function() {
    var app = angular.module('barModule', ['loginModule']);
    app.config(function($locationProvider) {
        $locationProvider.html5Mode(true).hashPrefix('!');
    });
    app.controller('MainController', ['$scope', 'loginStatus', function($scope, loginStatus) {
        
        // Listen to angular-login.js' $emit info on login
        
        $scope.receivedLogin = false;
        $scope.$on('received', function(event, data){
            $scope.receivedLogin = true;
        });
        $scope.$on('user', function(event, data){
            if (data) {
                $scope.isLogged = true;
                $scope.user = data;
            } else {
                $scope.isLogged = false;
                $scope.user = '';
            }
        });
        $scope.$on('userID', function(event, data){
            $scope.userID = data;
        });
        
        $scope.query = function(queryString) {
            if (!$scope.isLoadingQuery) {
                $scope.isLoadingQuery = true;
                jQuery.post("query", {location: queryString}, function(data) {
                    if (data.error) {
                        $scope.message = data.message;
                    } else {
                        $scope.hasResults = true;
                        $scope.results = data.data.bars;
                        $scope.message = '';
                    }
                    $scope.isLoadingQuery = false;
                    $scope.$apply();
                });
            }
        };
        
        // Function to add the registered user to the "going" array of the bar in the DB.
        // Angular will update the results without making a new query, if the response contains no error.
        $scope.addGoing = function(bar, barIndex) {
            if (!bar.isLoading) {
                bar.isLoading = true;
                jQuery.post("add-going", {bar: bar.id}, function(data) {
                    if (data.error) {
                        // TODO: handle error
                    } else {
                        $scope.results[barIndex].going.push($scope.userID);
                    }
                    bar.isLoading = false;
                    $scope.$apply();
                });
            }
        };
        
        // Function to remove the user from the "going" array, complementary to the addGoing function.
        $scope.removeGoing = function(bar, barIndex) {
            if (!bar.isLoading) {
                bar.isLoading = true;
                jQuery.post("remove-going", {bar: bar.id}, function(data) {
                    if (data.error) {
                        // TODO: handle error
                    } else {
                        var userIndex = $scope.results[barIndex].going.indexOf($scope.userID);
                        if (userIndex == -1) {
                            // TODO: handle error
                        } else {
                            $scope.results[barIndex].going.splice(userIndex, 1);
                        }
                    }
                    bar.isLoading = false;
                    $scope.$apply();
                });
            }
        };
    }]);
}());