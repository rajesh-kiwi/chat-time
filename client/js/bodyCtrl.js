app.controller('bodyCtrl', function ($scope, $location) {
    $scope.activeConversation = {};
    $scope.windowDimensions = {
        width: window.innerWidth
        , height: window.innerHeight
    }

    $scope.credentials = {};
    $scope.localDB = {};
    $scope.incomingMessageDetails = {};

    $scope.changeView = function (page) {
        $location.path = page;
    }

    $scope.storeInLocalDB = function (messageDetails) {
        if (!$scope.localDB[messageDetails.from.contactNumber]) {
            $scope.localDB[messageDetails.from.contactNumber] = [];
        }
        $scope.localDB[messageDetails.from.contactNumber].push(messageDetails);
    }

    $scope.setActiveChat = function (contact) {
        $scope.activeConversation = contact;
        if ($scope.localDB[contact.contactNumber]) {
            $scope.localDB[contact.contactNumber].forEach(function (incomingMessageDetails) {
                setTimeout(function () {
                    $scope.appendIncomingMessage(incomingMessageDetails);
                }, 1000);
            });
        }
    }

    $scope.getContacts = function () {
        socket.emit('getContacts');
    }

    $scope.appendIncomingMessage = function (messageDetails) {
        $('#' + messageDetails.from.contactNumber + '-conversationDiv').append('<div class="col-lg-12" style="margin: 10px;"><span class="messageContent">' + messageDetails.message + '</span></div><br>');
    }

    $scope.appendOutgoingMessage = function (messageDetails) {
        $('#' + messageDetails.to.contactNumber + '-conversationDiv').append('<div class="col-lg-12" style="margin: 10px;"><span style="float:right;margin-right: 2%;" class="messageContent">' + messageDetails.message + '</span></div><br>');
    }

    socket.on('setContactDetails', function (contacts) {
        $scope.$apply(function () {
            $scope.contacts = JSON.parse(contacts);
        })
    });

    socket.on('recieveMessage', function (incomingMessageDetails) {
        $scope.$apply(function () {
            incomingMessageDetails = JSON.parse(incomingMessageDetails);
            $scope.appendIncomingMessage(incomingMessageDetails);
            incomingMessageDetails.type = "incoming";
            $scope.storeInLocalDB(incomingMessageDetails)
        });
    });
});