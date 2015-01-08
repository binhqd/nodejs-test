module.exports = function (options) {

    return function (req, res, next, path) {
        var sqlite3 = require('sqlite3').verbose();
        var db = new sqlite3.Database('db/mydb.db');
        var check;
        
        var EditionExport = function (req, res, db, callback) {
            this.req = req;
            this.res = res;
            this.callback = callback;
            this.db = db;
        };

        EditionExport.prototype.post = function () {
            var name = this.req.body.name;
            var edition = this.req.body.edition;

            var insertedID = null;
            var stmt = this.db.prepare("INSERT INTO editions VALUES (?, ?, ?)");
            stmt.run(null, name, edition);
            stmt.finalize();
            this.db.close();
            res.json(200, this.req.body);
            // res.end();

        };
        
        EditionExport.prototype.getEdition = function(page, callback) {
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
        
        EditionExport.prototype.search = function () {
            var _this = this;
            db.all("SELECT * FROM edition_exports order by created desc,id desc", function(err, rows){
                var pageLength = rows.length;
                var cnt = 0;

                if (!!rows && pageLength > 0) {
                    for (var i = 0; i < pageLength; i++) {
                        var page = rows[i];
                        
                        _this.getEdition(page, function(page, err, edition) {
                            page.edition = !!edition ? edition : null;
                            
                            if (cnt == pageLength - 1) {
                                _this.res.json({
                                    data : {
                                        items : rows
                                    }
                                });
                            }
                            cnt++;
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

        EditionExport.prototype.detail = function () {
            var _this = this;
            db.get("SELECT * FROM edition_exports where id = ?", this.req.params.id , function(err, row){
                if (!!row) {
                    _this.getEdition(row, function(row, err, edition) {
                        row.edition = !!edition ? edition : null;
                        
                        _this.res.json({
                            editionExports : row
                        });
                    });
                } else {
                    _this.res.json({
                        editionExports : []
                    });
                }
            });
        };

        EditionExport.prototype.delete = function () {
            var id = this.req.params.id;
            db.get("SELECT * from edition_exports where id = ?", id, function(err, info) {
                if (!!err) return console.log(err);
                if (!!info) {
                    db.run("DELETE from edition_exports where id = ?", id, function() {
                        db.close();
                        next(info);
                    });
                    //res.json({code: 200, message: "OK"});
                }
            });
            
            
        };

        var editionExport = new EditionExport(req, res, db, function (result, redirect) {
            // console.log('callback');
            // callback
        });


        switch (req.method) {
            case 'OPTIONS':
                res.end();
                break;
            case 'HEAD':
            case 'GET':
                if (path == "/search")
                    editionExport.search();
                else if (path == "/detail")
                    editionExport.detail();
                break;
            case 'POST':
                editionExport.post();

                break;
            case 'PUT':
                editionExport.put();
                break;
            case 'DELETE':
                editionExport.delete();
                break;
            default:
                res.send(405);
        }
    }
}