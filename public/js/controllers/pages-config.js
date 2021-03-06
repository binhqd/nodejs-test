pages.config(function($routeProvider, $stateProvider) {
    $stateProvider
    // Pages
    // setup an abstract state for the tabs directive
    .state('listpages', {
        url : '/list',
        views : {
            'tabContent' : {
                templateUrl : '/templates/pages/list.html',
                controller : 'ListPageCtrl'
            }
        }
    }).state('pagedetail', {
        url : '/detail/:id',
        views : {
            'tabContent' : {
                templateUrl : '/templates/pages/detail.html',
                controller : 'PageDetailCtrl'
            }
        }
    }) //

    .state('addpage', {
        url : '/add',
        views : {
            'tabContent' : {
                templateUrl : '/templates/pages/form.html',
                controller : 'AddPageCtrl'
            }
        }
    }).state('editpage', {
        url : '/edit/:id',
        views : {
            'tabContent' : {
                templateUrl : '/templates/pages/form.html',
                controller : 'EditPageCtrl'
            }
        }
    }).state('listcats', {
        url : '/cats',
        views : {
            'tabContent' : {
                templateUrl : '/templates/pages/list-category.html',
                controller : 'ManageSpecCtrl'
            }
        }
    }).state('addCat', {
        url : '/cats/add',
        views : {
            'tabContent' : {
                templateUrl : '/templates/pages/form-category.html',
                controller : 'ManageSpecCtrl'
            }
        }
    }).state('editCat', {
        url : '/cats/edit/:id',
        views : {
            'tabContent' : {
                templateUrl : '/templates/pages/form-category.html',
                controller : 'ManageSpecCtrl'
            }
        }
    }).state('test', {
        url : '/test',
        views : {
            'tabContent' : {
                templateUrl : '/templates/pages/test.html',
                controller : 'TestCtrl'
            }
        }
    })
});