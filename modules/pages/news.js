module.exports = function (options) {

    return function (req, res, next) {
        var sqlite3 = require('sqlite3').verbose();
        var db = new sqlite3.Database('db/mydb.db');
        var check;
        db.serialize(function() {
          //db.run("DROP TABLE if exists pages");
          db.run(" \
            CREATE TABLE if not exists pages ( \
            id INTEGER PRIMARY KEY AUTOINCREMENT, \
            title VARCHAR(256), \
            subtitle VARCHAR(256), \
            author VARCHAR(64), \
            `text` text, \
            status TINYINT, \
            type TINYINT \
          )");
          db.each("SELECT id,image, page_id FROM pages_photos", function(err, row) {
                    console.log(row.id + ": " + row.image + ": " + row.page_id);
                });
          db.run(" \
            CREATE TABLE if not exists pages_photos ( \
            id INTEGER PRIMARY KEY AUTOINCREMENT, \
            image VARCHAR(256), \
            page_id INTEGER, \
            FOREIGN KEY(page_id) REFERENCES pages(id) \
          )");

          // db.run("delete from pages_photos");
          // db.each("SELECT id,image FROM pages_photos", function(err, row) {
          //           console.log(row.image + ": " + row.page_id);
          //       });
          /*var stmt = db.prepare("INSERT INTO pages VALUES (?, ?, ?, ?, ?, ?, ?)");
          for (var i = 0; i < 10; i++) {
              stmt.run(null, "Title " + i, 'sub', '', 'text', 0, 1);
          }
          stmt.finalize();

          db.each("SELECT id,title FROM pages", function(err, row) {
              console.log(row.id + ": " + row.title);
          });*/
        });

        var NewsModel = function (req, res, db, callback) {
            this.req = req;
            this.res = res;
            this.callback = callback;
            this.db = db;
        };

        NewsModel.prototype.post = function () {
            var title = this.req.body.title;
            var subtitle = this.req.body.subtitle;
            var author = this.req.body.author;
            var text = this.req.body.text;

            // get uploaded images
            var uploadedImages = [];
            if (typeof this.req.body.uploadedImages != "undefined") {
                uploadedImages = this.req.body.uploadedImages;
            }

            var insertedID = null;
            var photoStmt = this.db.prepare("INSERT INTO pages_photos VALUES (?, ?, ?)");
            db.run("INSERT INTO pages VALUES (?, ?, ?, ?, ?, ?, ?)", null, title, subtitle, author, text, 0, 1, function() {
                console.log(this);
                insertedID = this.lastID;

                // insert uploaded images
                
                for (var i = 0; i < uploadedImages.length; i++) {
                    //console.log(uploadedImages[i] + ':' + insertedID);
                    photoStmt.run(null, uploadedImages[i], insertedID);
                }
                //stmt.finalize();
                photoStmt.finalize();

                // test again if images has been inserted
                db.each("SELECT id,image, page_id FROM pages_photos", function(err, row) {
                    console.log(row.id + ": " + row.image + ": " + row.page_id);
                });

            });

            db.close();
            res.json(200, this.req.body);
            //res.end();

        };

        NewsModel.prototype.delete = function () {
            var id = this.req.params.id;
            var stmt = this.db.prepare("DELETE from pages where id = ?");
            stmt.run(id);
            stmt.finalize();

            this.db.close();

            res.json(200, {code: 200, message: "OK"});
        }
        NewsModel.prototype.get = function () {
            if (typeof this.req.params.id != "undefined") {
                var _this = this;
                db.get("SELECT id,title,subtitle,text,status,type FROM pages where id = ?", this.req.params.id , function(err, row){
                    // get all photos
                    //console.log(this.req.params);
                    if (typeof row != "undefined") {
                        row.photos = [];

                        db.all("SELECT id,image,page_id FROM pages_photos where page_id = ?", row.id , function(err, rows){
                            console.log(rows);
                            row.photos = rows;

                            _this.res.json({
                                data : {
                                    items : row
                                }
                            });
                        });
                    }
                });

            } else {
                var _this = this;
                db.all("SELECT id,title,subtitle,text,status,type FROM pages order by id desc", function(err, rows){
                    _this.res.json({
                        data : {
                            items : rows
                        }
                    });
                });
            }
            
        }
        var news = new NewsModel(req, res, db, function (result, redirect) {
            //console.log('callback');
            // callback
        });

        switch (req.method) {
            case 'OPTIONS':
                res.end();
                break;
            case 'HEAD':
            case 'GET':
                news.get();
                break;
            case 'POST':
                news.post();

                break;
            case 'DELETE':
                news.delete();
                break;
            default:
                res.send(405);
        }
    }
}