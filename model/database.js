var databaseURL = ("mongodb://localhost/eaerevista");
var mongoose = require("mongoose");
mongoose.connect(databaseURL);
Schema = mongoose.Schema;

///Cria a tabela de administrador

var TABLE_REVISTA = "Revista";
var TABLE_ADMIN = "Administradore";
var TABLE_DEVICE = "Device"

var enumRevista = ["EAEMAQUINAS", "EAEAGRICOLA","OUTROS","COLHEITA"];

var AdminSchema = new Schema({
	usuario: {type:String,required:true,unique: true},
	senha: {type:String,required:true}
});

var DeviceSchema = new Schema({
	udid: {type: String, required:true,unique: true},
	device: {type:String, required:true},
	version:{type:String, required:true}
});

var RevistaSchema = new Schema({
	titulo: {type:String,required:true},
	descricao: {type:String,required:true},
	circulacao: {type:String,required:true},
	arquivo: {type:String,required:true},
	link: {type:String},
	capa: {type:String,required:true},
	data: {type: Date,default: Date.now,unique: true},
	push: {type:Boolean,default:false},
	revista: {type: String, required: true, enum: enumRevista}
});

console.log("schema:"+RevistaSchema);
mongoose.model(TABLE_ADMIN, AdminSchema);
exports.Admin = mongoose.model(TABLE_ADMIN);

mongoose.model(TABLE_REVISTA, RevistaSchema);
exports.Revista = mongoose.model(TABLE_REVISTA);

mongoose.model(TABLE_DEVICE, DeviceSchema);
exports.Device = mongoose.model(TABLE_DEVICE);
