module.exports = function (options) {

    return function (req, res, next, path) {
        var sqlite3 = require('sqlite3').verbose();
        var db = new sqlite3.Database('db/mydb.db');
        var check;

        var status = {
            image : 0,
            article : 1,
            news : 2
        }
        
        var PageModel = function (req, res, db, callback) {
            this.req = req;
            this.res = res;
            this.callback = callback;
            this.db = db;
        };

        PageModel.prototype.post = function () {
            //console.log(this.req.body);
            //res.end();
            var title = this.req.body.title;
            var subtitle = this.req.body.subtitle;
            var author = this.req.body.author;
            var text = this.req.body.text;
            var addType = this.req.body.addType;
            var edition_id = this.req.body.edition_id;
            var specifications = this.req.body.specifications;

            // get uploaded images
            var uploadedImages = [];
            if (typeof this.req.body.uploadedImages != "undefined") {
                uploadedImages = this.req.body.uploadedImages;
            }

            var insertedID = null;
            //var photoStmt = this.db.prepare("INSERT INTO pages_photos VALUES (?, ?, ?)");

            // Save basic information if type is news or article
            if (addType == "news" || addType == "article") {
                db.run("INSERT INTO pages VALUES (?, ?, ?, ?, ?, ?, ?, ?)", null, title, subtitle, author, text, 0, status[addType], edition_id, function() {
                    insertedID = this.lastID;
                    // insert uploaded images
                    for (var i = 0; i < uploadedImages.length; i++) {
                        console.log(uploadedImages[i]);
                        db.run("INSERT INTO pages_photos VALUES (?, ?, ?)", null, uploadedImages[i], insertedID);
                        //photoStmt.run(null, uploadedImages[i], insertedID);
                    }
                    //stmt.finalize();
                    //photoStmt.finalize();
                    if (addType == "article") {
                        if (!!specifications) {
                            for (var i = 0; i < specifications.length; i++) {
                                db.run("INSERT INTO article_specifications VALUES (?, ?, ?, ?, ?)", null, specifications[i].name, specifications[i].value, specifications[i].category_id, insertedID);
                            }
                        }
                    }
                    // if type is article, continue insert specification

                    // test again if images has been inserted
                    // db.each("SELECT id,image, page_id FROM pages_photos", function(err, row) {
                    //     console.log(row.id + ": " + row.image + ": " + row.page_id);
                    // });

                });
            } else if (addType == "image") {
                for (var i = 0; i < uploadedImages.length; i++) {
                    db.run("INSERT INTO pages VALUES (?, ?, ?, ?, ?, ?, ?, ?)", null, uploadedImages[i], '', '', '', 0, status[addType], edition_id, function() {
                       // callback here 
                    });
                }
            }
            
            // If type is article, 

            this.db.close();
            res.json(200, this.req.body);
            //res.end();

        };

        PageModel.prototype.delete = function () {
            var id = this.req.params.id;
            var stmt = this.db.prepare("DELETE from pages where id = ?");
            stmt.run(id);
            stmt.finalize();

            this.db.close();

            res.json(200, {code: 200, message: "OK"});
        }

        PageModel.prototype.getPhotos = function(pageID, callback) {
            // get images
            db.all("SELECT id,image,page_id FROM pages_photos where page_id = ?", pageID , function(err, photos){
                //page.photos = photos;
                callback(err,photos);
            });
        }
        PageModel.prototype.getEdition = function(editionID, callback) {
            db.get("SELECT id,name,edition FROM editions where id = ?", editionID , function(err, edition){
                //page.photos = photos;
                callback(err, edition);
            });
        }

        PageModel.prototype.getSpecifications = function(pageID, callback) {
            db.all("SELECT id,name,value,category_id FROM article_specifications where page_id = ?", pageID , function(err, specs){
                var totalSpecs = specs.length;
                for (var i = 0; i < totalSpecs; i++) {
                    var cnt = 0;
                    var categoryID = specs[i].category_id;
                    db.get("SELECT id, title FROM page_categories where id = ?", categoryID, function(err, cat) {
                        specs[cnt].category = cat;

                        if (cnt == totalSpecs - 1) {
                            callback(err, specs);
                        }
                        cnt++;
                    });
                }
                //page.photos = photos;
                
            });
        }

        PageModel.prototype.detail = function () {
            var _this = this;
            var pageID = this.req.params.id;

            db.get("SELECT id,title,subtitle,text,status,type,edition_id FROM pages where id = ?", pageID , function(err, page){
                if (typeof page != "undefined") {
                    page.photos = [];
                    _this.getPhotos(pageID, function(err, photos) {
                        _this.getEdition(page.edition_id, function(err, edition) {
                            
                            if (page.type == status['article']) {
                                _this.getSpecifications(pageID, function(err, specs) {
                                    page.photos = photos;

                                    page.edition = edition;
                                    page.specifications = specs;
                                    _this.res.json({
                                        page : page
                                    });
                                });
                            } else {
                                page.photos = photos;

                                page.edition = edition;
                                //page.specifications = specs;
                                _this.res.json({
                                    page : page
                                });
                            }
                            
                            
                        });
                    });
                } else {
                    _this.res.json({
                        page : page
                    });
                }
            });
        }

        PageModel.prototype.search = function () {
            var _this = this;
            var pages = [];

            db.all("SELECT id,title,subtitle,text,status,type,edition_id FROM pages order by id desc", function(err, pages){
                var cnt = 0;
                var pageLength = pages.length;

                if (typeof pages != "undefined") {
                    for (var i = 0; i < pageLength; i++) {
                        if (pages[i].type == status['image']) break;

                        pages[i].photos = [];
                        var pageId = pages[i].id;

                        _this.getPhotos(pageId, function(err, photos) {
                            var editionID = pages[cnt].edition_id;
                            _this.getEdition(editionID, function(err, edition) {

                                // _this.getSpecifications(pageId, function(err, specs) {
                                //     pages[cnt].photos = photos;

                                //     pages[cnt].edition = edition;

                                //     pages[cnt].specifications = specs;

                                //     if (cnt == pageLength - 1) {
                                //         _this.res.json({
                                //             data : {
                                //                 items : pages
                                //             }
                                //         });
                                //     }
                                //     cnt++;
                                // });

                                pages[cnt].photos = photos;

                                pages[cnt].edition = edition;

                                if (cnt == pageLength - 1) {
                                    _this.res.json({
                                        data : {
                                            items : pages
                                        }
                                    });
                                }
                                cnt++;
                            });
                        });
                    }
                } else {
                    _this.res.json({
                        data : {
                            items : []
                        }
                    });
                }
            });
        }
        var page = new PageModel(req, res, db, function (result, redirect) {
            //console.log('callback');
            // callback
        });

        switch (req.method) {
            case 'OPTIONS':
                res.end();
                break;
            case 'HEAD':
            case 'GET':
                if (path == "/search") {
                    page.search();
                } else if (path == "/detail") {
                    page.detail();
                }
                
                break;
            case 'POST':
                page.post();

                break;
            case 'DELETE':
                page.delete();
                break;
            default:
                res.send(405);
        }
    }
}