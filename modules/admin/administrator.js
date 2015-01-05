var database = require("../../model/database.js");
var DbAdmin = database.Admin;

exports.login = function(username, password, callback) {
    DbAdmin.findOne({
        usuario : username,
        senha : password
    }, function(err, retDatabase) {
        if (retDatabase) {
            callback(retDatabase);
        }
        else {
            throw new Error("Usu&aacute;rio ou senha inv&aacute;lidos");
        }
    });
};

exports.search = function(callback) {
    DbAdmin.find().sort({
        name : 1
    }).exec(function(err, listAllAdmin) {
        callback(err, listAllAdmin);
    });
}

exports.getAdmin = function(id, callback) {
    DbAdmin.findOne({
        _id : id
    }, function(err, ret) {
        if (err) {
            console.log(err);
        } else {
            callback(ret);
        }
    });
}

exports.saveAdmin = function(current, username, password, callback) {
    current.usuario = username;
    current.senha = password;
    current.save(function(err, saveAdmin) {
        callback(err, saveAdmin);
    });
}

exports.create = function(username, password, callback) {
    var admin = new DbAdmin();
    admin.usuario = username;
    admin.senha = password;
    admin.save(function(err, savedAdmin){
        callback(err, savedAdmin);
    });
}

exports.remove = function(id, callback) {
    exports.getAdmin(id, function(ret) {
        ret.remove(function(err) {
            if (!!err) {
                console.log(err);
            } else {
                callback();
            }
        });
    })
}