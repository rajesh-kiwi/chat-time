app.controller('loginCtrl', function ($scope, $location) {
    $scope.register = function () {
        socket.emit('registerUser', JSON.stringify($scope.credentials));
        $location.path('/dashboard');
        //$scope.getContacts();
    }
});