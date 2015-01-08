pages.config(function($routeProvider, $stateProvider) {
    $stateProvider
    // Pages
    // setup an abstract state for the tabs directive
    .state('listexports', {
        url : '/list',
        views : {
            'tabContent' : {
                templateUrl : '/templates/exports/list.html',
                controller : 'ListExportsCtrl'
            }
        }
    }).state('addExport', {
        url : '/add',
        views : {
            'tabContent' : {
                templateUrl : '/templates/exports/form.html',
                controller : 'AddExportsCtrl'
            }
        }
    })
});

BackendCtrls.controller('ListExportsCtrl', function($scope, $http) {
    $scope.exports = {
        items : []
    };
    var req = {
        method : 'GET',
        url : '/exports/search'
    }

    $http(req).success(function(res) {
        // TODO: Check if res.meta.code == 200
        $scope.exports.items = res.data.items;
    }).error(function() {
        console.log('err');
    });
    
    $scope.delete = function(exportID, index) {
        if (confirm("Are you sure to delete this export?")) {
            var req = {
                method : 'DELETE',
                url : '/exports/' + exportID
            }
            
            $http(req).success(function(res) {
                // TODO: Check if res.meta.code == 200
                if (res.code == 200) {
                    $scope.exports.items.splice(index, 1);
                } else {
                    alert(res.message);
                }
                
            }).error(function() {
                console.log('err');
            });
        }
        
    }
})
.controller('AddExportsCtrl', function($scope, $http) {
    $scope.exports = {
        items : []
    };
    var req = {
        method : 'GET',
        url : '/exports/search'
    }

    $http(req).success(function(res) {
        // TODO: Check if res.meta.code == 200
        $scope.exports.items = res.data.items;
    }).error(function() {
        console.log('err');
    });
})
;
