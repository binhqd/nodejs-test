module.exports = function (options) {

    return function (req, res, next, path) {
        var sqlite3 = require('sqlite3').verbose();
        var db = new sqlite3.Database('db/mydb.db');
        var check;
        
        var Edition = function (req, res, db, callback) {
            this.req = req;
            this.res = res;
            this.callback = callback;
            this.db = db;
        };

        Edition.prototype.post = function () {
            var name = this.req.body.name;
            var edition = this.req.body.edition;

            var insertedID = null;
            var stmt = this.db.prepare("INSERT INTO editions VALUES (?, ?, ?)");
            stmt.run(null, name, edition);
            stmt.finalize();
            this.db.close();
            res.json(200, this.req.body);
            //res.end();

        };

        Edition.prototype.put = function () {
            var name = this.req.body.name;
            var edition = this.req.body.edition;
            var id = this.req.body.id;

            var _this = this;
            db.run("UPDATE editions set name=?, edition=? where id = ?", name, edition, id, function(err) {
                if (!err) {
                    _this.res.json({
                        meta : {
                            code : 200,
                            message : "Edition has been updated successful"
                        }
                    });
                } else {
                    _this.res.json({
                        meta : {
                            code : 500,
                            message : "Can't update edition. Please contact administrator"
                        }
                    });
                }
            });
            // stmt.run(null, name, edition);
            // stmt.finalize();
            // this.db.close();
            // res.json(200, this.req.body);
            //res.end();

        };

        Edition.prototype.search = function () {
            var _this = this;
            db.all("SELECT id,name,edition FROM editions order by id", function(err, rows){
                _this.res.json({
                    data : {
                        items : rows
                    }
                });
            });
        }

        Edition.prototype.detail = function () {
            var _this = this;
            db.get("SELECT id,name,edition FROM editions where id = ?", this.req.params.id , function(err, row){
                _this.res.json({
                    editions : row
                });
            });
        };

        Edition.prototype.delete = function () {
            var id = this.req.params.id;
            var stmt = this.db.prepare("DELETE from editions where id = ?");
            stmt.run(id);
            stmt.finalize();

            this.db.close();

            res.json(200, {code: 200, message: "OK"});
        };

        var edition = new Edition(req, res, db, function (result, redirect) {
            //console.log('callback');
            // callback
        });


        switch (req.method) {
            case 'OPTIONS':
                res.end();
                break;
            case 'HEAD':
            case 'GET':
                if (path == "/search")
                    edition.search();
                else if (path == "/detail")
                    edition.detail();
                break;
            case 'POST':
                edition.post();

                break;
            case 'PUT':
                edition.put();
                break;
            case 'DELETE':
                edition.delete();
                break;
            default:
                res.send(405);
        }
    }
}