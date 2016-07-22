app.service('dashboardService', function ($http) {
    
    this.fk = {
        login: function () {
            $http.get('/login').success(function (result) {
                console.log(result);
            });
        }
        , order: {
            fetch: function () {
                $http.post('/fetch/order').success(function (result) {
                    console.log(result);
                });
            }
        }
    }
    
});