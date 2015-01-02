module.exports = function(options){
    console.log(options);
	var express = require('express');
	var app = express();

	var page = require("./page.js");
	var category = require("./category.js");

	app.get('/', function(req, res){
	    if(!req.session.admin)
        {
            res.redirect("/");
        }
		res.render('pages/blank', {
			pagetype : "page",
			layout: 'layouts/backend-main',
			title:"Pages"

		});
	});

	app.post('/', function(req, res, next) {
		page()(req, res, next);
	});

	app.get('/search', function(req, res, next) {
		page()(req, res, next, '/search');
	});
	app.get('/categories', function(req, res, next) {
		category()(req, res, next);
	});

	app.get('/:id', function(req, res, next) {
		page()(req, res, next, '/detail');
	});

	app.get('/pages/news/form', function(req, res, next) {
		res.render('pages/form', {
			layout: 'layouts/page-form',
			title:"Eae Editora"
		});
	});

	app.post('/categories', function(req, res, next) {
		category()(req, res, next);
	});

	app.post('/news', function(req, res, next) {
		page()(req, res, next);
	});

	app.put('/:id', function(req, res, next) {
		page()(req, res, next);
	});

	app.delete('/categories/:id', function(req, res, next) {
		category()(req, res, next);
	});
	app.delete('/news/:id', function(req, res, next) {
		page()(req, res, next);
	});

	app.put('/categories/:id', function(req, res, next) {
		category()(req, res, next);
	});

	return app;
}();