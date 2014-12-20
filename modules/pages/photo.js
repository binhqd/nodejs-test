module.exports = function (options) {

    return function (req, res, next) {
        var sqlite3 = require('sqlite3').verbose();
        var db = new sqlite3.Database('db/mydb.db');
        var check;
        
        var PageCategoryModel = function (req, res, db, callback) {
            this.req = req;
            this.res = res;
            this.callback = callback;
            this.db = db;
        };

        PagePhoto.prototype.post = function () {
            // var title = this.req.body.title;
            // var row = this.req.body;
            // var _this = this;
            // var insertedID = null;
            // var stmt = this.db.prepare("INSERT INTO page_categories VALUES (?, ?)");
            // stmt.run(null, title, function() {
            //     row.id = this.lastID;

            //     _this.res.json(200, row);

            // });
            // stmt.finalize();
                
            // this.db.close();
            //res.end();
        };

        PagePhoto.prototype.delete = function () {
            // var id = this.req.params.id;
            // var stmt = this.db.prepare("DELETE from pages where id = ?");
            // stmt.run(id);
            // stmt.finalize();

            // this.db.close();

            // res.json(200, {code: 200, message: "OK"});
        }
        
        PagePhoto.prototype.get = function () {
            var _this = this;
            db.all("SELECT id,title FROM page_categories order by id desc", function(err, rows){
                _this.res.json({
                    data : {
                        items : rows
                    }
                });
            });
        }
        var photo = new PagePhoto(req, res, db, function (result, redirect) {
            //console.log('callback');
            // callback
        });

        switch (req.method) {
            case 'OPTIONS':
                res.end();
                break;
            case 'HEAD':
            case 'GET':
                photo.get();
                break;
            case 'POST':
                photo.post();

                break;
            case 'DELETE':
                photo.delete();
                break;
            default:
                res.send(405);
        }
    }
}