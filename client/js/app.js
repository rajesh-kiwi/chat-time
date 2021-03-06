var app = angular.module('myApp', ['ngRoute']);

app.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/', {
        templateUrl: 'views/login.html'
        , controller: 'loginCtrl'
    }).when('/dashboard', {
        templateUrl: 'views/dashboard.html'
        , controller: 'dashboardCtrl'
    }).when('/activeChat', {
        templateUrl: 'views/activeChat.html'
        , controller: 'activeChatCtrl'
    }).otherwise({
        redirectTo: '/'
    });
}]);

app.directive('fileModel', ['$parse', function ($parse) {
    return {
        restrict: 'A'
        , link: function (scope, element, attrs) {
            var model = $parse(attrs.fileModel);
            var modelSetter = model.assign;

            element.bind('change', function () {
                scope.$apply(function () {
                    modelSetter(scope, element[0].files[0]);
                });
            });
        }
    };
}]);

var socket = io.connect('http://localhost:3000');
//var socket = io.connect('https://e0d8e04d.ngrok.io');