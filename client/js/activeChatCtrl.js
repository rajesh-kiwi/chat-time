app.controller('activeChatCtrl', function ($scope, $http) {
    $scope.payload = {};
    $scope.payload.to = angular.copy($scope.activeConversation);
    $scope.payload.from = angular.copy($scope.credentials);

    $scope.sendMessage = function () {
        if (!$scope.payload.message.trim())
            return;
        var payload = angular.copy($scope.payload);
        socket.emit('sendMessage', JSON.stringify(payload));
        var convDiv = document.getElementById($scope.activeConversation.contactNumber+'-conversationDiv');
        convDiv.scrollTop = convDiv.scrollHeight;
        payload.type = 'outgoing';
        $scope.appendOutgoingMessage(payload);
        $scope.storeInLocalDB(payload);
        $scope.payload.message = '';
    }

    $scope.uploadFile = function () {
        var file = $scope.myFile;
        var uploadUrl = "http://localhost:4000/api/photo";
        var fd = new FormData();
        fd.file = file;
        //fd.append('file', file);
        var options = {
            transformRequest: angular.identity
            , headers: {
                'Content-Type': undefined,
                'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
            }
        }
        $http.post(uploadUrl, fd, options)
            .success(function () {
                console.log("success!!");
            })
            .error(function (err) {
                console.log(err);
            });
    };
});