module.exports = function(){
	var express = require('express');
	var edition = require("./edition.js");
	var app = express();

	app.get('/', function(req, res){
	    if(!req.session.admin)
        {
            res.redirect("/");
        }
		res.render('editions/blank', {
			pagetype : "edition",
			layout: 'layouts/backend-main',
			title:"Editions"
		});
	});

	app.get('/search', function(req, res, next) {
	    if(!req.session.admin)
        {
            res.redirect("/");
        }
		edition()(req, res, next, '/search');
	});

	app.get('/detail/:id', function(req, res, next) {
	    if(!req.session.admin)
        {
            res.redirect("/");
        }
		edition()(req, res, next, '/detail');
	});

	app.put('/:id', function(req, res, next) {
	    if(!req.session.admin)
        {
            res.redirect("/");
        }
		edition()(req, res, next);
	});

	app.post('/', function(req, res, next) {
	    if(!req.session.admin)
        {
            res.redirect("/");
        }
		edition()(req, res, next);
	});

	app.delete('/:id', function(req, res, next) {
	    if(!req.session.admin)
        {
            res.redirect("/");
        }
		edition()(req, res, next);
	});
	return app;
}();