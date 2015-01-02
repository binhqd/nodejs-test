module.exports = function (options) {
    var uploadDir = (__dirname + '/../../public/uploads');
    return function (req, res, next, path) {
        
        var sqlite3 = require('sqlite3').verbose();
        var db = new sqlite3.Database('db/mydb.db');
        var check;
        var mime = require('mime');
        
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
        
        PageModel.prototype.moveFile = function(editionFolder, imageName, s3, fs) {
            var _this = this;
            fs.move(uploadDir + '/' + '/' + imageName, uploadDir + '/' + editionFolder + '/' + imageName, function(err) {
              if (err) return console.error(err)
              console.log("File success moved!");
              
              _this.putToS3(imageName, editionFolder, s3, fs);
            });
            
        }
        PageModel.prototype.putToS3 = function(imageName, folder, s3, fs) {
            var _this = this;
            
            fs.readFile(uploadDir + '/' + folder + '/' + imageName, function (err, data) {
              if (err) { throw err; }
              var mimeType = mime.lookup(uploadDir + '/' + folder + '/' + imageName);
              
              console.log(imageName);
              s3.putObject({
                Key: folder + '/' + imageName,
                Body: data,
                ACL:'public-read',
                ContentType: mimeType
              }, function (err) {
                if (err) { throw err; }
              });
            });
        }
        PageModel.prototype.post = function () {
            // console.log(this.req.body);
            // res.end();
            var title = this.req.body.title;
            var subtitle = this.req.body.subtitle;
            var author = this.req.body.author;
            var text = this.req.body.text;
            var addType = this.req.body.addType;
            var edition_id = this.req.body.edition_id;
            var specifications = this.req.body.specifications;
            var _this = this;
            
            // get uploaded images
            var uploadedImages = [];
            if (typeof this.req.body.uploadedImages != "undefined") {
                uploadedImages = this.req.body.uploadedImages;
            }

            var insertedID = null;
            // var photoStmt = this.db.prepare("INSERT INTO pages_photos VALUES
			// (?, ?, ?)");

            // Save basic information if type is news or article
            if (addType == "news" || addType == "article") {
                db.run("INSERT INTO pages VALUES (?, ?, ?, ?, ?, ?, ?, ?)", null, title, subtitle, author, text, 0, status[addType], edition_id, function() {
                    insertedID = this.lastID;
                    // insert uploaded images
                    for (var i = 0; i < uploadedImages.length; i++) {
                        // console.log(uploadedImages[i]);
                        db.run("INSERT INTO pages_photos VALUES (?, ?, ?)", null, uploadedImages[i], insertedID);
                        // photoStmt.run(null, uploadedImages[i], insertedID);
                    }
                    // stmt.finalize();
                    // photoStmt.finalize();
                    if (addType == "article") {
                        if (!!specifications) {
                            for (var i = 0; i < specifications.length; i++) {
                                db.run("INSERT INTO article_specifications VALUES (?, ?, ?, ?, ?)", null, specifications[i].name, specifications[i].value, specifications[i].category_id, insertedID);
                            }
                        }
                    }
                    // if type is article, continue insert specification

                    // test again if images has been inserted
                    // db.each("SELECT id,image, page_id FROM pages_photos",
					// function(err, row) {
                    // console.log(row.id + ": " + row.image + ": " +
					// row.page_id);
                    // });

                });
            } else if (addType == "image") {
                for (var i = 0; i < uploadedImages.length; i++) {
                    db.run("INSERT INTO pages VALUES (?, ?, ?, ?, ?, ?, ?, ?)", null, uploadedImages[i], '', '', '', 0, status[addType], edition_id, function() {
                       // callback here
                    });
                }
            }
            
            
            db.get("select * from editions where id = ?", edition_id, function(err, edition) {
                if (!!edition) {
                    var slug = require('slug');
                    // Send to S3
                    var AWS = require('aws-sdk'), 
                    fs = require('fs-extra');
                    
                    AWS.config.update({ accessKeyId: 'AKIAISZHITNJLFPZ3UTQ', secretAccessKey: '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' });
                    var s3 = new AWS.S3({params: {Bucket: 'nodejscms'}});
                    
                    
                    // Move image to edition dir
                    var editionFolder = slug(edition.name + ' ' + edition.edition);
                    console.log(editionFolder);
                    
                    // ensure directory exists
                    fs.ensureDir(uploadDir + '/' + editionFolder, function(err) {
                        if (err) return console.error(err)
                        console.log(editionFolder+ " existed");
                        
                        // move
                        for (var i = 0; i < uploadedImages.length; i++) {
                            _this.moveFile(editionFolder, uploadedImages[i], s3, fs);
                        }
                        
                    });
                    
                    
                    
                    
                }
            });
            
            
            // console.log(upload.options);
            // If type is article,

            this.db.close();
            res.json(200, this.req.body);
            // res.end();

        };

        PageModel.prototype.put = function () {
            var title = this.req.body.title;
            var subtitle = this.req.body.subtitle;
            var author = this.req.body.author;
            var text = this.req.body.text;
            var addType = this.req.body.addType;
            var edition_id = this.req.body.edition_id;
            var specifications = this.req.body.specifications;
            var id = this.req.params.id;

            // get uploaded images
            var uploadedImages = [];
            if (typeof this.req.body.uploadedImages != "undefined") {
                uploadedImages = this.req.body.uploadedImages;
            }

            // Save basic information if type is news or article

            if (addType == "news" || addType == "article") {
                db.run("UPDATE pages set title = ?, subtitle = ?, author = ?, text = ?, type = ?, edition_id = ? where id = ?", title, subtitle, author, text, status[addType], edition_id, id, function(err) {
                	console.log(err);
					console.log(id);
                    // insert uploaded images
                    // clean up old images
                    db.run("delete from pages_photos where page_id = ?", id, function(err) {
						for (var i = 0; i < uploadedImages.length; i++) {
	                        db.run("INSERT INTO pages_photos VALUES (?, ?, ?)", null, uploadedImages[i], id);
	                    }
                    });

                    if (addType == "article") {
                        if (!!specifications) {
                        	db.run("delete from article_specifications where page_id = ?", id, function(err) {
		                        for (var i = 0; i < specifications.length; i++) {
	                                db.run("INSERT INTO article_specifications VALUES (?, ?, ?, ?, ?)", null, specifications[i].name, specifications[i].value, specifications[i].category_id, id);
	                            }
		                    });
                        }
                    }
                });
            }

            // If type is article,

            this.db.close();
            res.json(200, this.req.body);
            // res.end();

        };

        PageModel.prototype.delete = function () {
            var id = this.req.params.id;
            var stmt = this.db.prepare("DELETE from pages where id = ?");
            stmt.run(id);
            stmt.finalize();

            this.db.close();

            res.json(200, {code: 200, message: "OK"});
        }

        PageModel.prototype.getPhotos = function(page, callback) {
            // get images
            db.all("SELECT id,image,page_id FROM pages_photos where page_id = ?", page.id , function(err, photos){
                // page.photos = photos;
                callback(page, err, photos);
            });
        }
        PageModel.prototype.getEdition = function(page, callback) {
            db.get("SELECT id,name,edition FROM editions where id = ?", page.edition_id , function(err, edition){
                if (!!edition) {
                    var slug = require('slug');
                    edition.slug = slug(edition.name + ' ' + edition.edition);
                    // page.photos = photos;
                    callback(page, err, edition);
                } else {
                    res.json(200, {code: 403, message: "Invalid edition information"});
                }
            });
        }

        PageModel.prototype.getSpecifications = function(page, callback) {
            db.all("SELECT id,name,value,category_id FROM article_specifications where page_id = ?", page.id , function(err, specs){
                if (!!specs && specs.length > 0) {
                    var totalSpecs = specs.length;
                    for (var i = 0; i < totalSpecs; i++) {
                        var cnt = 0;
                        var categoryID = specs[i].category_id;
                        db.get("SELECT id, title FROM page_categories where id = ?", categoryID, function(err, cat) {
                            specs[cnt].category = cat;

                            if (cnt == totalSpecs - 1) {
                                callback(page, err, specs);
                            }
                            cnt++;
                        });
                    }
                } else {
                    callback(page, err, []);
                }
            });
        }

        PageModel.prototype.detail = function () {
            var _this = this;
            var pageID = this.req.params.id;

            db.get("SELECT id,title,subtitle,author,text,status,type,edition_id FROM pages where id = ?", pageID , function(err, page){
                if (!!page) {
                    if (page.type == status['image']) {
                    	_this.getEdition(page, function(page, err, edition) {
                    		page.photos = [
                               {
                                   id: null,
                                   image: page.title
                               }
                            ];
                    		page.edition = edition;
                            _this.res.json({
                                page : page
                            });
                        });
                    } else {
                        page.photos = [];
                        _this.getPhotos(page, function(page, err, photos) {
                            _this.getEdition(page, function(page, err, edition) {

                                if (page.type == status['article']) {
                                    _this.getSpecifications(page, function(page, err, specs) {
                                        page.photos = !!photos ? photos : [];

                                        page.edition = !!edition ? edition : null;

                                        page.specifications = !!specs ? specs : [];

                                        _this.res.json({
                                            page : page
                                        });
                                    });
                                } else {
                                    page.photos = photos;

                                    page.edition = edition;
                                    page.specifications = [];
                                    _this.res.json({
                                        page : page
                                    });
                                }
                            });
                        });
                    }
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

            db.all("SELECT id,title,subtitle,text,author,status,type,edition_id FROM pages order by id desc", function(err, pages){
                var pageLength = pages.length;
                var cnt = 0;

                if (!!pages) {
                    for (var i = 0; i < pageLength; i++) {
                        pages[i].photos = [];
                        var page = pages[i];
                        var pageId = pages[i].id;
                        if (pages[i].type == status['image']) {


                            _this.getEdition(page, function(page, err, edition) {
                            	page.photos = [
                                   {
                                       id: null,
                                       image: page.title
                                   }
                                ];

                                page.edition = !!edition ? edition : null;

                                if (cnt == pageLength - 1) {
                                    _this.res.json({
                                        data : {
                                            items : pages
                                        }
                                    });
                                }
                                cnt++;
                            });
                            continue;
                        } else {
                            _this.getPhotos(page, function(page, err, photos) {
                                var editionID = page.edition_id;

                                _this.getEdition(page, function(page, err, edition) {
                                    page.photos = !!photos ? photos : [];

                                    page.edition = !!edition ? edition : null;

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
            // console.log('callback');
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
                if(!req.session.admin)
                {
                    res.redirect("/");
                }
                page.post();

                break;
            case 'PUT':
                if(!req.session.admin)
                {
                    res.redirect("/");
                }
                page.put();

                break;
            case 'DELETE':
                if(!req.session.admin)
                {
                    res.redirect("/");
                }
                page.delete();
                break;
            default:
                res.send(405);
        }
    }
}