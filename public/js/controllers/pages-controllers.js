BackendCtrls
.controller('NewsDetailCtrl', function ($scope,$http, $stateParams) {
    var id = $stateParams.id;

    
})
.controller('PagesCtrl', function ($scope,$http) {        
    $scope.news = {};

    var req = {
        method: 'GET',
        url: '/pages/search',
        headers: {
            'Content-Type': 'application/json; charset=utf-8'
        }
    }

    $http(req).success(function(res) {
        $scope.pages = {};
        $scope.pages.items = res.data.items;
        
    }).error(function(){
        console.log('err');
    });

    $scope.delete = function(newsId, index) {
        var req = {
            method: 'DELETE',
            url: '/pages/news/' + newsId,
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            }
        }

        if (confirm("Are you sure to delete this page?")) {
            $http(req).success(function(res) {                    
                $scope.pages.items.splice(index, 1);
                alert("Page #"+newsId+" has been deleted");
            }).error(function(){
                console.log('err');
            });
        }
        
    }
})

.controller('AddPageCtrl', function ($scope,$http,transformRequestAsFormPost, $timeout) {
    $scope.uploadedImages = {};
    $scope.uploadedImages.items = [];
    $scope.page = {};
    $scope.article = {};
    $scope.category = {
        items : []
    };
    $scope.editions = {};

    $scope.selectedCategory = {
        item : {
            title : "Select Category",
            id : -1
        }
    };
    $scope.selectedEdition = {
        item : {
            name : "Select Edition",
            id : -1,
            edition : -1
        }
    };

    var req = {
        method: 'GET',
        url: '/editions/search'
    }
    $http(req).success(function(res) {
        if (!!res.data.items && res.data.items.length > 0) {
            $scope.selectedEdition.item = res.data.items[0];
            $scope.editions.items = res.data.items;
        } else {
            alert('You need to add new Edition before adding new page');
            window.location = '/pages/#/add';
        }
        
    }).error(function(){
        console.log('err');
    });

    // Initialize toolbar
    

    $scope.addType = "news";
    $scope.typeLabel = "News";

    $scope.specification = {};
    $scope.specifications = {};
    $scope.specifications.items = [];

    $scope.selectEdition = function(item) {
        $scope.selectedEdition.item = item;
    }

    

    $scope.selectType = function(type) {
        $scope.addType = type;
        switch (type) {
            case 'news':
                $scope.typeLabel = "News";
                break;
            case 'image':
                $scope.typeLabel = "Images";
                break;
            case 'article':
                $scope.typeLabel = "Articles";
                break;
        }
    }

    $scope.addImages = function() {
        
        $('#selectFiles').trigger('click');
    }

    $scope.news = {};
    $scope.savePage = function(isValid) {
        if (!isValid) {
            alert('Invalid input. Please check your form');
            return;
        }

        var postData = $scope.page;
        postData.uploadedImages = [];
        postData.addType = $scope.addType;

        postData.uploadedImages = [];
        $('#inputFiles .uploadedImage').each(function(e) {
            postData.uploadedImages[postData.uploadedImages.length] = $(this).val();
        });

        postData.edition_id = $scope.selectedEdition.item.id;

        postData.specifications = [];
        for (var i = 0; i < $scope.specifications.items.length; i++) {
            postData.specifications[postData.specifications.length] = {
                category_id: $scope.specifications.items[i].category_id,
                name: $scope.specifications.items[i].name,
                value: $scope.specifications.items[i].value
            };
        }

        /**
         * Validation
         * */



        //postData.specifications = $scope.specifications.items;
        //console.log($.param(postData));
        var req = {
            method: 'POST',
            url: '/pages',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
            },
            //transformRequest: transformRequestAsFormPost,
            data: $.param(postData)
        }
        $http(req).success(function(res) {                    
            //window.location = "/pages/#/news";
            //$scope.news = {};
            alert("Page has been saved successful");
            window.location = "#/list";
        }).error(function(){
            console.log('err');
        }); 


    }
})

.controller('ManageSpecCtrl', function ($scope,$http, ngDialog, transformRequestAsFormPost) {
    var req = {
            method: 'GET',
            url: '/pages/categories'
        }
        $http(req).success(function(res) {
            $scope.category.items = res.data.items;
        }).error(function(){
            console.log('err');
        }); 

    $scope.selectCategory = function(item) {
        $scope.selectedCategory.item = item;
    }

    

    $scope.openAddCategory = function() {
        ngDialog.open({ 
            template: '/templates/pages/partials/add-category.html',
            // controller : 'UploadImageListCtrl',
            scope: $scope,
            controller : 'AddPageCategoryCtrl'
        });
    }

    $scope.openAddSpec = function() {
        ngDialog.open({ 
            template: '/templates/pages/partials/add-spec.html',
            controller : function($scope) {
                $scope.addSpec = function() {
                    var spec = angular.copy($scope.specification, {});
                    spec.category_id = $scope.selectedCategory.item.id;
                    spec.categoryName = $scope.selectedCategory.item.title;
                    if (spec.category_id <= 0
                        || spec.name == ""
                        || spec.value == ""
                    ) {
                        return;
                    }
                    
                    $scope.specifications.items.push(spec);
                    $scope.specification = {name:'',value:''};
                    $scope.closeThisDialog('abc');
                }
            },
            scope: $scope
        });
    }


})
.controller('AddPageCategoryCtrl', function ($scope,$http, transformRequestAsFormPost) {
    $scope.saveCategory = function() {
        if ($scope.form.title == "") {
            alert("Category name can't be left blank");
            return;
        }

        var req = {
            method: 'POST',
            url: '/pages/categories',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
            },
            transformRequest: transformRequestAsFormPost,
            data: $scope.form
        }
        $http(req).success(function(res) {
            $scope.form = {};

            $scope.category.items[$scope.category.items.length] = res;

            $scope.selectedCategory.item = res;
            $scope.closeThisDialog();
        }).error(function(){
            console.log('err');
        }); 
    }
})

.controller('PageDetailCtrl', function ($scope, $http, $stateParams, $sce) {
    var req = {
        method: 'GET',
        url: '/pages/' + $stateParams.id
    }

    $http(req).success(function(res) {
        $scope.page = {};

        res.page.text = $sce.trustAsHtml(res.page.text);

        $scope.page.current = res.page;
    }).error(function(){
        console.log('err');
    }); 
})
;
