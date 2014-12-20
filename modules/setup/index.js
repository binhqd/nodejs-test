module.exports = function(){
	var express = require('express');
	var app = express();

	// app.get('/', function(req, res){
	// 	res.render('pages/blank', {
	// 		pagetype : "page",
	// 		layout: 'layouts/backend-main',
	// 		title:"Pages"

	// 	});
	// });
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
      type TINYINT, \
      edition_id INTEGER \
    )");
    // db.each("SELECT id,image, page_id FROM pages_photos", function(err, row) {
    //           console.log(row.id + ": " + row.image + ": " + row.page_id);
    //       });
  	db.run(" \
      CREATE TABLE if not exists editions ( \
      id INTEGER PRIMARY KEY AUTOINCREMENT, \
      name VARCHAR(64), \
      edition INTEGER \
    )");

  	//db.run("DROP TABLE if exists pages_photos");
    db.run(" \
      CREATE TABLE if not exists pages_photos ( \
      id INTEGER PRIMARY KEY AUTOINCREMENT, \
      image VARCHAR(256), \
      page_id INTEGER, \
      FOREIGN KEY(page_id) REFERENCES pages(id) \
    )");

    db.run(" \
      CREATE TABLE if not exists page_categories ( \
      id INTEGER PRIMARY KEY AUTOINCREMENT, \
      title VARCHAR(256) \
    )");

    //db.run("DROP TABLE if exists article_specifications");

    db.run(" \
      CREATE TABLE if not exists article_specifications ( \
      id INTEGER PRIMARY KEY AUTOINCREMENT, \
      name VARCHAR(256), \
      value VARCHAR(256), \
      category_id INTEGER, \
      page_id INTEGER, \
      FOREIGN KEY(page_id) REFERENCES pages(id), \
      FOREIGN KEY(category_id) REFERENCES page_categories(id) \
    )");

    db.each("SELECT id,title FROM pages", function(err, row) {
        console.log(row.id + ": " + row.title);
    });
  });

	app.get('/', function(req, res, next) {
		console.log('setup');
		res.end();
	});


	return app;
}();