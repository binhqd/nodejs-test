var database = require("../../model/database.js");
var DbAdmin = database.Admin;

var sqlite3 = require('sqlite3').verbose(),
    db = new sqlite3.Database('db/mydb.db'),
    slug = require('slug'),
    EasyZip = require('easy-zip').EasyZip,
    fs = require('fs-extra'),
    des;
var sourceDir = (__dirname + '/../../');
var uploadDir = (sourceDir + 'public/uploads/');
            
var exportFilename = 'db.sqlite';
var magazine_id = 199;

exports.pack = function(editionID, callback) {
    
    db.get("SELECT id,name,edition FROM editions where id = ?", editionID, function(err, edition) {
        if (!!err) {
            console.log(err);
        }
        else {
            
            var folderName = slug(edition.name + ' ' + edition.edition);
            
            exports.createSQLFile(uploadDir + folderName, function() {
                var sqlFile = uploadDir + folderName + '/' + exportFilename;
                
                exports.importSQLData(edition, sqlFile, function() {
                    exports.createZip(uploadDir + folderName, sourceDir + 'public/exports/' + folderName + ".zip", function(err) {
                        //console.log('doing something');
                        
                        var ret = {
                            filename : folderName + ".zip"
                        };
                        
                        var exportDate = new Date().toISOString();
                        db.run("UPDATE editions set last_export = ? where id = ?", exportDate, edition.id, function(err) {
                            if (!!err) {
                                console.log(err);
                            }
                        });
                        
                        db.get("select * from edition_exports where edition_id = ?", edition.id, function(err, editionExport) {
                            console.log(editionExport);
                            if (!!err) {
                                console.log(err);
                            } else {
                                if (!!editionExport) {
                                    db.run("UPDATE edition_exports set created = ?, zip_name = ? where id = ?", exportDate, folderName + ".zip",
                                        editionExport.id, function(err) {
                                        if (!!err) {
                                            console.log(err);
                                        }
                                    });
                                } else {
                                    db.run("INSERT into edition_exports (id, edition_id, zip_name, created) values (?, ?, ?, ?)", 
                                        null, 
                                        edition.id, 
                                        folderName + ".zip",
                                        exportDate, function(err) {
                                        
                                        if (!!err) {
                                            console.log(err);
                                        }
                                    });
                                }
                            }
                        });
                        
                        callback(ret);
                    });
                });

            });
            // 
        }
    });

    // DbAdmin.findOne({
    // usuario : username,
    // senha : password
    // }, function(err, retDatabase) {
    // if (retDatabase) {
    // callback(retDatabase);
    // }
    // else {
    // throw new Error("Usu&aacute;rio ou senha inv&aacute;lidos");
    // }
    // });
};
var internals = {};
internals.importPhotos = function(page, callback) {
    db.each("SELECT * from pages_photos where page_id = ?", page.id, function(err, row) {
        des.run('INSERT into galeria_fotos (id,foto,legenda,id_materia) \
            values (?, ?, ?, ?)',
            row.id,
            row.image,
            '',
            page.id
        );
        
        // import photos for each pages
        callback();
    });
}
internals.importCategories = function(page, callback) {
    db.each("SELECT * from page_categories", function(err, row) {
        des.run('INSERT into tipo_ficha (id_tipo, id_materia, titulo) \
            values (?, ?, ?)',
            row.id,
            0,
            row.title
        );
        
        // import photos for each pages
        //internals.importPhotos(row, function() {});
    });
    callback();
}
internals.importSpecifications = function(page, callback) {
    db.each("SELECT * from article_specifications where page_id = ?", page.id, function(err, row) {
        des.run('INSERT into ficha_tecnica (id,id_tipo,tipo,valor) \
            values (?, ?, ?, ?)',
            row.id,
            row.category_id,
            row.name,
            row.value
        );
        
        // import photos for each pages
        callback();
    });
}

exports.importSQLData = function(edition, sqlFile, callback) {
    des = new sqlite3.Database(sqlFile);
    
    internals.importCategories({}, function() {});
    
    db.each("SELECT * from pages where edition_id = ?", edition.id, function(err, row) {
        des.run('INSERT into materia (id,imagem,titulo,materia,autor,data,tipo,id_revista,ordenacao) \
            values (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            row.id,
            '',
            row.title,
            row.subtitle,
            row.author,
            row.text,
            row.type,
            magazine_id,
            0
        );
        
        // import photos for each pages
        internals.importPhotos(row, function() {});
        
        internals.importSpecifications(row, function() {});
        //internals.importCategories(row, function() {});
    });
    
    
    callback();
};

exports.removeExport = function(info, callback) {
    // clean last_export from editions
    db.run("UPDATE editions set last_export = ? where id = ?", null, info.edition_id, function(err) {
        if (!!err) {
            console.log(err);
        } else {
            // TODO: Remove zip files
            fs.remove(sourceDir + 'public/exports/' + info.zip_name, function(err) {
                if (!!err) {
                    console.log(err);
                } else {
                    callback();
                }
            });
        }
    });
};

exports.createSQLFile = function(destPath, callback) {
    
    fs.ensureDir(destPath, function(err) {
        if (err) 
            return console.error(err);

        // copy template
        fs.copySync(__dirname + '/../../db/template.sqlite', destPath + '/' + exportFilename);
        
        // var exportDB = new sqlite3.Database(uploadDir + '/' + folderName + '/db.sqlite');
        
        callback();
    });
};

exports.createZip = function(folder, zipname, callback) {
    var zip = new EasyZip();
    zip.zipFolder(folder, function(err, obj) {
        zip.writeToFile(zipname, function(err) {
            callback(err);
        });
    });
}