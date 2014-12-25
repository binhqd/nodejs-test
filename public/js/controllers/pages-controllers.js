
BackendCtrls
.controller('NewsDetailCtrl', function ($scope,$http, $stateParams) {
    var id = $stateParams.id;


})
.controller('PageFormCtrl', function($scope, $http, $stateParams) {

    $scope.addImages = function() {

        $('#selectFiles').trigger('click');
    }

	$scope.removePhoto = function(image, index) {
		if (confirm("Are you sure to remove this image?")) {
			$scope.uploadedImages.items.splice(index, 1);
		}
	}

	$scope.savePage = function(isValid) {
        if (!isValid) {
            alert('Invalid input. Please check your form');
            return;
        }

        var postData = $scope.page;
        postData.uploadedImages = [];
        postData.addType = $scope.page.addType;

        postData.uploadedImages = [];

        for (var i = 0; i < $scope.uploadedImages.items.length; i++) {
        	postData.uploadedImages.push($scope.uploadedImages.items[i].name);
        }

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
		 */

        if (!$scope.isNew) {
            var req = {
                method: 'PUT',
                url: '/pages/' + $scope.page.id,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
                },
                // transformRequest: transformRequestAsFormPost,
                data: $.param(postData)
            }
            $http(req).success(function(res) {
                // window.location = "/pages/#/news";
                // $scope.news = {};
                alert("Page has been saved successful");
                window.location = "#/list";
            }).error(function(){
                console.log('err');
            });
        } else {
            var req = {
                method: 'POST',
                url: '/pages',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
                },
                // transformRequest: transformRequestAsFormPost,
                data: $.param(postData)
            }
            $http(req).success(function(res) {
                // window.location = "/pages/#/news";
                // $scope.news = {};
                alert("Page has been saved successful");
                window.location = "#/list";
            }).error(function(){
                console.log('err');
            });
        }
    }
})
.controller('PagesCtrl', function ($scope,$http) {
	$scope.page = {
        id : null,
        title : "",
        subtitle : "",
        author : "",
        text : "",
        status : 0,
        type : 1,
        edition_id : null,
        photos : [],
        addType : "news",
        typeLabel : "News"
    };

	$scope.uploadedImages = {
		items : []
	};

	$scope.specifications = {
		items : []
	}
	$scope.selectedEdition = {
        item : {
            name : "Select Edition",
            id : -1,
            edition : -1
        }
    };

	$scope.category = {
        items : []
    };
	$scope.editions = {
		items : []
	};
	$scope.status = {
        0  : 'image',
        1: 'article',
        2: 'news'
    }

    $scope.selectEdition = function(item) {
        $scope.selectedEdition.item = item;
    }

	$scope.selectType = function(type) {
		console.log(type);
        $scope.page.addType = type;
        switch (type) {
            case 'news':
                $scope.page.typeLabel = "News";
                break;
            case 'image':
                $scope.page.typeLabel = "Images";
                break;
            case 'article':
                $scope.page.typeLabel = "Articles";

                break;
        }
    }
})
.controller('ListPageCtrl', function ($scope,$http,transformRequestAsFormPost, $timeout, $stateParams) {
	$scope.pages = {};

    var req = {
        method: 'GET',
        url: '/pages/search',
        headers: {
            'Content-Type': 'application/json; charset=utf-8'
        }
    }

    $http(req).success(function(res) {

        $scope.pages.items = res.data.items;

    }).error(function(){
        console.log('err');
    });

    $scope.deletePage = function(page, index) {
        var req = {
            method: 'DELETE',
            url: '/pages/news/' + page.id,
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            }
        }

        if (confirm("Are you sure to delete this page?")) {
            $http(req).success(function(res) {
                $scope.pages.items.splice(index, 1);
                alert("Page #"+page.id+" has been deleted");
            }).error(function(){
                console.log('err');
            });
        }
    }
})

.controller('AddPageCtrl', function ($scope,$http,transformRequestAsFormPost, $timeout) {
	$scope.isNew = true;
    var req = {
        method: 'GET',
        url: '/editions/search'
    }
    $scope.selectedEdition = {
        item : {
            name : "Select Edition",
            id : -1,
            edition : -1
        }
    };

    $http(req).success(function(res) {
    	console.log(res);
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


})
.controller('EditPageCtrl', function ($scope,$http,transformRequestAsFormPost, $timeout, $stateParams) {
    var id = $stateParams.id;
    $scope.isNew = false;
//    $scope.selectedEdition = {
//        item : {
//            name : "Select Edition",
//            id : -1,
//            edition : -1
//        }
//    };

    $scope.category = {
        items : []
    };

    var req = {
        method: 'GET',
        url: '/pages/' + $stateParams.id
    }

    $http(req).success(function(res) {
        $scope.page = angular.extend($scope.page, res.page);

        $scope.page.title = res.page.title;
        $scope.selectType($scope.status[res.page.type]);

        // postData.specifications
        var specs = [];
        for (var i = 0; i < res.page.specifications.length; i++) {
        	if (!!res.page.specifications[i].category) {
        		spec = res.page.specifications[i];
        		spec.categoryName = spec.category.title;
        		spec.category_id = spec.category.id;

        		specs.push(spec);
        	}

        }

        $scope.specifications.items = specs;

        // Get editions
        var req = {
            method: 'GET',
            url: '/editions/search'
        }
        $http(req).success(function(result) {
            if (!!result.data.items && result.data.items.length > 0) {
                $scope.editions.items = result.data.items;

                for (var i = 0; i < result.data.items.length; i++) {
                    if (result.data.items[i].id == res.page.edition_id) {
                        $scope.selectedEdition.item = result.data.items[i];
                        break;
                    }
                }
            } else {
                alert('You need to add new Edition before adding new page');
                window.location = '/pages/#/add';
            }

        }).error(function(){
            console.log('err');
        });

        // images
        $scope.uploadedImages.items = [];
        for (var i = 0; i < res.page.photos.length; i++) {
            var photo = res.page.photos[i];

            $scope.uploadedImages.items[i] = {
                url : '/uploads/' + photo.image,
                originalName : photo.image,
                id : res.page.photos[i].id,
                name : photo.image
            }
        }

    }).error(function(){
        console.log('err');
    });


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

    $scope.delete = function(spec, index) {
		if (confirm('Are you sure to remove this specification?')) {
			$scope.specifications.items.splice(index, 1);
		}

    }



    $scope.openAddSpec = function() {
    	$scope.selectedCategory = {
	        item : {
	            title : "Select Category",
	            id : -1
	        }
	    };

        ngDialog.open({
            template: '/templates/pages/partials/add-spec.html',
            controller : function($scope) {

            	// Reset each time category is open
            	$scope.selectedCategory = {
        	        item : {
        	            title : "Select Category",
        	            id : -1
        	        }
        	    };
            	$scope.selectCategory = function(item) {
                    $scope.selectedCategory.item = item;
                }

            	$scope.specification = {name:'',value:''};

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

                $scope.openAddCategory = function() {
                    ngDialog.open({
                        template: '/templates/pages/partials/add-category.html',
                        // controller : 'UploadImageListCtrl',
                        scope: $scope,
                        controller : 'AddPageCategoryCtrl'
                    });
                }
            },
            scope: $scope
        });
    }


})
.controller('AddPageCategoryCtrl', function ($scope,$http, transformRequestAsFormPost, $timeout) {
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

    $scope.deleteCat = function(item, index) {
        if (confirm("Delete this category also delete all technical specifications related to it. Do you want to continue?")) {
            var req = {
                method: 'DELETE',
                url: '/pages/categories/' + item.id
            }
            $http(req).success(function(res) {
                if (res.code == 200) {
                    // select different category if it are being deleted
                    if ($scope.selectedCategory.item.id == $scope.category.items[index].id) {
                        if (!!$scope.category.items[0]) {
                            $scope.selectedCategory.item = $scope.category.items[0];
                        }
                    }

                    $scope.category.items.splice(index, 1);
                } else {
                    alert(res.message);
                }
            }).error(function(){
                console.log(err);
            });
        }
    }

    $scope.cat = {};
    $scope.editCat = function(item, index) {
        $scope.cat.input = item.title;
        $scope.showEditInput = item.id;

        $scope.cat.beforeText = item.title;
        $timeout(function() {
            document.getElementById('cat-' + index).focus();
        }, 100);
    }

    $scope.updateCat = function(item, index) {
        if ($scope.cat.input != $scope.cat.beforeText) {
            var req = {
                method: 'PUT',
                url: '/pages/categories/' + item.id,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
                },
                transformRequest: transformRequestAsFormPost,
                data: {
                    id : item.id,
                    title : $scope.cat.input
                }
            }

            $http(req).success(function(res) {
                if (res.code == 200) {
                    if ($scope.showEditInput == item.id) {
                        $scope.showEditInput = -1;
                    }

                    item.title = $scope.cat.input;
                    $scope.category.items[index] = {
                        id : item.id,
                        title : $scope.cat.input
                    }
                } else {
                    alert(res.message);
                }
            }).error(function(){
                console.log(err);
            });
        } else {
            // remove input state
            $scope.showEditInput = -1;

            // console.log('Nothing to update');
        }
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
