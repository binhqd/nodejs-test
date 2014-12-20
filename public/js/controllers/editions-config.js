pages.config(function($routeProvider, $stateProvider) {
	$stateProvider
	// Pages
	// setup an abstract state for the tabs directive
	
	//
	// Editions
	.state('listeditions', {
		url: '/list',
		views: {
			'tabContent': {
				templateUrl: '/templates/editions/list.html',
				controller: 'ListEditionsCtrl'
			}
		}
	})
	.state('addedition', {
		url: '/add',
		views: {
			'tabContent': {
				templateUrl: '/templates/editions/form.html',
				controller: 'AddEditionsCtrl'
			}
		}
	})
	.state('viewedition', {
		url: '/detail/:id',
		views: {
			'tabContent': {
				templateUrl: '/templates/editions/detail.html',
				controller: 'EditionDetailCtrl'
			}
		}
	})
});