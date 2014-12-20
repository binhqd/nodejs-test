module.exports = function(){
	var express = require('express');
	var edition = require("./edition.js");
	var app = express();

	app.get('/', function(req, res){
		res.render('editions/blank', {
			pagetype : "edition",
			layout: 'layouts/backend-main',
			title:"Editions"
		});
	});

	app.get('/search', function(req, res, next) {
		edition()(req, res, next, '/search');
	});

	app.get('/detail/:id', function(req, res, next) {
		edition()(req, res, next, '/detail');
	});

	app.post('/', function(req, res, next) {
		edition()(req, res, next);
	});

	app.delete('/:id', function(req, res, next) {
		edition()(req, res, next);
	});
	return app;
}();