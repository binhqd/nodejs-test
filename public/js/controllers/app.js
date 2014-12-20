var pages = angular.module('pagesApp', [
	'ngRoute',
	'BackendCtrls',
	'ui.router',
	'ngDialog',
	'ui.bootstrap'
]);

var BackendCtrls = angular.module('BackendCtrls', []);