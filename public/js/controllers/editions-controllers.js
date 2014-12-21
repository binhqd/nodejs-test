BackendCtrls
.controller('AddEditionsCtrl', function ($scope, $http,$state, transformRequestAsFormPost) {
    $scope.form = {};

    $scope.saveEdition = function(isValid) {
        if (isValid) {
            var req = {
                method: 'POST',
                url: '/editions',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
                },
                transformRequest: transformRequestAsFormPost,
                data: $scope.form
            }

            $http(req).success(function(res) {
                // TODO: Check if res.meta.code == 200
                alert('Edition has been created successful');
                $state.go('listeditions');
            }).error(function(){
                console.log('err');
            });
        } else {
            alert("Validation failed! Please check your form inputs");
        }
    }



    $scope.test = function(isValid) {
        console.log(isValid);
    }
})
.controller('ListEditionsCtrl', function ($scope,$http) {
    $scope.editions = {};
    var req = {
        method: 'GET',
        url: '/editions/search',
        // headers: {
        //     'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
        // },
        //transformRequest: transformRequestAsFormPost,
        //data: $scope.form
    }

    $http(req).success(function(res) {
        // TODO: Check if res.meta.code == 200
        $scope.editions.items = res.data.items;
    }).error(function(){
        console.log('err');
    });
    
    $scope.delete = function(id, index) {
        if (!confirm("Are you sure to delete this edition?")) {
            return;
        }

        var req = {
            method: 'DELETE',
            url: '/editions/' + id,
            // headers: {
            //     'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
            // },
            //transformRequest: transformRequestAsFormPost,
            //data: $scope.form
        }

        $http(req).success(function(res) {
            // TODO: Check if res.meta.code == 200
            $scope.editions.items.splice(index, 1);
        }).error(function(){
            console.log('err');
        });
    }


})
.controller('EditionDetailCtrl', function ($scope,$http, $stateParams) {
    $scope.edition = {};
    var req = {
        method: 'GET',
        url: '/editions/detail/' + $stateParams.id,
        // headers: {
        //     'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
        // },
        //transformRequest: transformRequestAsFormPost,
        //data: $scope.form
    }

    $http(req).success(function(res) {
        // TODO: Check if res.meta.code == 200
        $scope.edition.item = res.editions;
    }).error(function(){
        console.log('err');
    });
})
.controller('EditEditionsCtrl', function ($scope,$http, $stateParams, transformRequestAsFormPost, $state) {
    $scope.isEditing = true;
    $scope.form = {};

    // get edition info
    var req = {
        method: 'GET',
        url: '/editions/detail/' + $stateParams.id
    }

    $http(req).success(function(res) {
        // TODO: Check if res.meta.code == 200
        $scope.form = res.editions;
    }).error(function(){
        console.log('err');
    });

    $scope.updateEdition = function(isValid) {
        if (isValid) {
            var req = {
                method: 'PUT',
                url: '/editions/' + $scope.form.id,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
                },
                transformRequest: transformRequestAsFormPost,
                data: $scope.form
            }

            $http(req).success(function(res) {
                alert(res.meta.message);
                if (res.meta.code == 200) {
                    $state.go('listeditions');
                }
            }).error(function(){
                console.log('err');
            });
        } else {
            alert("Validation failed! Please check your form inputs");
        }
    }
})
;
