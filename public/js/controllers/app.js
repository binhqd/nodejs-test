var pages = angular.module('pagesApp', [
	'ngRoute',
	'BackendCtrls',
	'ui.router',
	'ngDialog',
	'ui.bootstrap',
  'ui.tinymce'
]);

var BackendCtrls = angular.module('BackendCtrls', []);