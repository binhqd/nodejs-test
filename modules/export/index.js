module.exports = function() {
    var express = require('express');
    var tool = require("./tool.js");
    var editionExport = require("./model.js");
    var app = express();
    
    app.get('/', function(req, res) {
//        if (!req.session.admin) {
//            res.redirect("/admin/login");
//        }
        res.render('exports/blank', {
            pagetype : "exports",
            layout: 'layouts/backend-main',
            title:"Exports"

        });
//        var editionID = 9;
//        tool.pack(9, function(edition) {
//            console.log(edition);
//        });
    });
    
    app.post('/', function(req, res, next) {
//        if (!req.session.admin) {
//            res.redirect("/admin/login");
//        }
        
        var editionID = req.body.id;
        tool.pack(editionID, function(ret) {
            // TODO: save record to edition_exports
            // Update 
            res.json({
                meta : {
                    code : 200,
                    message : 'Edition has been exported successful'
                },
                data: {
                    filename : ret.filename,
                    created : new Date().toISOString()
                }
            });
        });
    });
    
    app.get('/search', function(req, res, next) {
//        if(!req.session.admin)
//        {
//            res.redirect("/");
//        }
        editionExport()(req, res, next, '/search');
    });
    
    app.get('/detail/:id', function(req, res, next) {
//        if(!req.session.admin)
//        {
//            res.redirect("/");
//        }
        editionExport()(req, res, next, '/detail');
    });
    
    app.delete('/:id', function(req, res, next) {
        if(!req.session.admin)
        {
            res.redirect("/");
        }
        editionExport()(req, res, function(info) {
            tool.removeExport(info, function() {
                res.json({
                    code : 200,
                    message : "Export has been removed successful!"
                });
            });
        });
    });
    
    return app;
}();