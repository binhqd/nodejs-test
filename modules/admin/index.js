module.exports = function() {
    var express = require('express');
    var admin = require("./administrator.js");
    var app = express();
    var adminModule = require("../../model/administrator.js");

    app.get('/', function(req, res) {
        if (req.session.admin) {
            res.redirect("/home");
        }
        else {
            res.redirect('/admin/login');
        }
    });

    app.get("/login", function(req, res, next) {
        if (req.session.admin) {
            res.redirect("/home");
        }
        else {
            res.render('index', {
                layout : 'login',
                title : "Editora Taboca",
                erro : req.session.erro,
                code : ""
            });
            req.session.destroy();
        }
    });

    // app.get('/search', function(req, res, next) {
    // if (!req.session.admin) {
    // res.redirect("/");
    // }
    // edition()(req, res, next, '/search');
    // });

    app.post("/login", function(req, res, next) {
        var user = null;
        try {
            admin.login(req.body.login, req.body.senha, function(retDatabase) {
                req.session.admin = retDatabase;
                res.redirect("/home");
            });
        }
        catch (err) {
            console.log(err);
            req.session.erro = {
                code : 500,
                message : err
            };
            res.redirect("/admin/login");
        }
    });

    app.get("/form", function(req, res, next) {
        if (!req.session.admin) {
            req.session.erro = {
                code : 400,
                message : "Sem acesso"
            };
            res.redirect('/admin/login');
        }

        if (req.query.p1) {
            admin.getAdmin(req.query.p1, function(existedAdmin) {
                res.render('formAdmin', {
                    layout : 'home',
                    param : existedAdmin,
                    title : "Editora Taboca",
                    username : req.session.admin.usuario,
                    code : err
                });
            });
        }
        else {
            res.render('formAdmin', {
                layout : 'home',
                title : "Editora Taboca",
                username : req.session.admin.usuario,
                code : err
            });
        }

    });

    app.get("/list", function(req, res, next) {
        var params = req.params;

        var retJson = req.query.json;
        if (req.session.admin) {
            admin.search(function(err, listAllAdmins) {
                if (retJson && listAllAdmins && listAllAdmins.length > 0)
                    res.json(listAllAdmins);
                else {
                    res.render('listAdmin', {
                        layout : 'home',
                        qryAdmin : listAllAdmins,
                        title : "Editora Taboca",
                        username : req.session.admin.usuario,
                        code : err
                    });
                }
            });
        }
        else {
            req.session.erro = {
                code : 400,
                message : "Sem acesso"
            };
            res.redirect("/");
        }
    });

    app.post("/save", function(req, res, next) {
        var admin = require("./administrator.js");

        if (!req.session.admin) {
            req.session.erro = {
                code : 400,
                message : "Sem acesso"
            };
            res.redirect("/");
            return;
        }

        var username = req.body.login;
        var password = req.body.senha;
        if (!!req.body.identificador) {
            var _admin = admin;
            admin.getAdmin(req.body.identificador, function(existedAdmin) {
                _admin.saveAdmin(existedAdmin, username, password, function(
                        err, saveAdmin) {
                    if (!err) {
                        req.session.erro = {
                            code : 666,
                            message : "Usuário alterado com sucesso!"
                        };
                        res.redirect("/home");
                    }
                    else {
                        req.session.erro = {
                            code : 666,
                            message : err.message
                        };
                        res.redirect("/home");
                    }
                });
            });
        }
        else {
            admin.create(username, password, function(err, savedAdmin) {
                if (!err) {
                    req.session.erro = {
                        code : 666,
                        message : "Usuário incluído com sucesso!"
                    };
                    res.redirect("/home");
                }
                else {
                    req.session.erro = {
                        code : 666,
                        message : err.message
                    };
                    res.redirect("/home");
                }
            });
        }
    });
    
    app.post("/remove", function(req, res, next) {
        var id = req.body.id;
        
        admin.remove(id, function() {
            res.redirect("/admin/list");
        });
    });
    
    return app;
}();