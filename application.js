var express = require('express')
  , partials = require('express-partials')
  , upload = require('jquery-file-upload-middleware')
  , app = express();

var request = require('needle');
var database = require("./model/database.js");
var fs = require('fs');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
var mime = require('mime');

var datejs = require('safe_datejs');
var DbRevista = database.Revista;

var DbDevice = database.Device;

var revistaModule = require("./model/backend.js");

var mongoose = require("mongoose");


var adminModule = require("./model/administrator.js");

var DbAdmin = database.Admin;



upload.configure({
        uploadDir: __dirname + '/public/uploads',
        uploadUrl: '/uploads',
        imageVersions: {
            thumbnail: {
                width: 80,
                height: 80
            }
        }
    });


app.configure(function(){
	app.set("views","views");
	app.use(partials());
	app.use(express.favicon());
	app.use(express.logger());
	app.use(express.cookieParser());
	

	//app.use(express.bodyParser());
	app.use(express.json());
	app.use(express.urlencoded());
	app.use(express.methodOverride());
	app.use('/', express.static(__dirname + '/public'));
	app.use(express.session({secret: 'sessionLoginHomeEae'}));
	
	app.engine('.html', require('ejs').renderFile);
	app.set("view engine","html");
	app.set("view options",{
		layout: 'home'
	});
	
});

app.use('/editions', require('./modules/editions'));
app.use('/pages', require('./modules/pages'));
app.use('/setup', require('./modules/setup'));





// This need to be put before express.bodyParser();

app.post('/upload', function (req, res, next) {
	try {
	upload.fileHandler()(req, res, function(results) {
		//console.log(results);
	});
	} catch (err) {
		console.log(err);
	}
});

app.delete('/upload/:filename', function (req, res, next) {
	upload.fileHandler()(req, res, function(results) {
		//console.log(results);
	});
});

app.get('/list', function (req, res, next) {
	upload.fileHandler({
	        //tmpDir: dirs.temp,
	        uploadDir: __dirname + '/public/uploads/',
	        uploadUrl: '/uploads'
	    })(req, res, next);
    /*upload.fileManager().getFiles(function (files) {
        //  {
        //      "00001.MTS": {
        //          "path": "/home/.../public/uploads/ekE6k4j9PyrGtcg+SA6a5za3/00001.MTS"
        //      },
        //      "DSC00030.JPG": {
        //          "path": "/home/.../public/uploads/ekE6k4j9PyrGtcg+SA6a5za3/DSC00030.JPG",
        //          "thumbnail": "/home/.../public/uploads/ekE6k4j9PyrGtcg+SA6a5za3/thumbnail/DSC00030.JPG"
        //      }
        //  }
        res.json(files);
    });*/
});

// bind event
upload.on('end', function (fileInfo) {
    // insert file info
    console.log("files upload complete");
    console.log(fileInfo);
});

upload.on('delete', function (fileName) {
    // remove file info
    console.log("files remove complete");
    console.log(fileName);
});

upload.on('error', function (e) {
    console.log(e.message);
});

app.get("/",function(req,res,next){
	if(req.session.admin)
	{
		res.redirect("/home");
	}
	else
	{
		res.render('index',{layout: 'login',title:"Editora Taboca",erro:req.session.erro,code:""});
		req.session.destroy();
		
	}
	
	
});
app.get("/userNew/:nome/:senha",function(req,res,next){
	
	console.log(req.params);
	request.post("http://localhost:8080/createAdmin",{login:req.params.nome,senha:req.params.senha},function(error, response, body){
		console.log(error);
		//console.log(response);
		console.log(body);
	});
	res.end();
});

app.post("/",function(req,res,next){
	DbAdmin.findOne({usuario : req.body.login,senha:req.body.senha}, function(err, retDatabase) {
        if (retDatabase) 
        {
			console.log(retDatabase);
			
			req.session.admin = retDatabase;
			
			res.redirect("/home");
        }	
        else
        {
        	req.session.erro = {code:500,message:"Usu&aacute;rio ou senha inv&aacute;lidos"};
        	res.redirect("/");
        }
    });
});


app.get("/logout",function(req,res,next){
	req.session.destroy();
	res.redirect("/");
});

app.get("/admin/form",function(req,res,next){
	
//	if(!req.session.admin)
//	{	
//		req.session.erro = {code:400,message:"Sem acesso"};
//		res.redirect("/");
//		return;
//	}
	console.log(req.query);
	
	if(req.query.p1)
	{
		DbAdmin.findOne({_id:req.query.p1},function(err,ret){
			res.render('formAdmin',{layout: 'home',param:ret,title:"Editora Taboca",username:req.session.admin.usuario,code:err});
		});
	}
	else
	{
		res.render('formAdmin',{layout: 'home',title:"Editora Taboca",username:req.session.admin.usuario,code:err});
	}
	
	
});


app.get("/admin/list",adminModule.findAll);

//app.get("/admin/install", function(req,res,next) {
//    var admin = new DbAdmin();
//    admin.usuario = 'binhqd';
//    admin.senha = '123binhqd!@#';
//    admin.save(function(err, saveAdmin){
//        console.log(err);
//        console.log(saveAdmin);
//        if(!err)
//        {
//            req.session.erro = {code:666,message:"Usuário alterado com sucesso!"};
//            res.redirect("/home");
//        }
//        else
//        {
//            req.session.erro = {code:666,message:err.message};
//            res.redirect("/home");
//        }
//        
//    });
//});
app.post("/createAdmin",function(req,res,next){
	if(!req.session.admin)
	{	
		req.session.erro = {code:400,message:"Sem acesso"};
		res.redirect("/");
		return;
	}
	
	if(req.body.identificador)
	{
		DbAdmin.findOne({_id:req.body.identificador},function(err,ret){
			ret.usuario = req.body.login;
			ret.senha = req.body.senha;
			ret.save(function(err,saveAdmin){
				console.log(err);
				console.log(saveAdmin);
				if(!err)
				{
					req.session.erro = {code:666,message:"Usuário alterado com sucesso!"};
					res.redirect("/home");
				}
				else
				{
					req.session.erro = {code:666,message:err.message};
					res.redirect("/home");
				}
				
			});
		});
		
	}
	else
	{
		var admin = new DbAdmin();
		admin.usuario = req.body.login;
		admin.senha = req.body.senha;
		
		admin.save(function(err,saveAdmin){
			console.log(err);
			if(!err)
			{
				req.session.erro = {code:666,message:"Usuário incluído com sucesso!"};
				res.redirect("/home");
			}
			else
			{
				req.session.erro = {code:666,message:err.message};
				res.redirect("/home");
			}
		});
	}
});
app.get("/home",function(req,res,next){
	console.log(req.session.admin);
	
	if(req.session.admin)
	{
		console.log(req.session.admin);
		err = "";
	
		res.render('index',{layout: 'home',title:"Eae Editora",erro:req.session.erro});
	}
	else
	{
		req.session.erro = {code:400,message:"Sem acesso"};
		res.redirect("/");
	}
});
app.get("/revista/new",function(req,res,next){
	
	if(!req.session.admin)
	{
		req.session.erro = {code:400,message:"Sem acesso"};
		res.redirect("/");
	}
	
	
	if(req.query.p1)
	{
		DbRevista.findOne({_id:req.query.p1},function(err,ret){
			res.render('form',{layout: 'home',param:ret,title:"Eae Editora"});
		});
	}
	else
	{
		res.render('form',{layout: 'home',title:"Eae Editora"});
	}
	
	
});

app.get("/revista/new/:id",function(req,res,next){
	
	if(!req.session.admin)
	{
		req.session.erro = {code:400,message:"Sem acesso"};
		res.redirect("/");
	}
	
	res.render('form',{layout: 'home',title:"Eae Editora"});
});
app.get("/revista/list",revistaModule.findAll);


app.post("/registerDevice",function(req,res,next){
	if(!req.session.admin)
	{
		req.session.erro = {code:400,message:"Sem acesso"};
		res.redirect("/");
	}
	
	if(req.body.udid)
	{
		exists = false;
		DbDevice.findOne({udid:{$ne : req.body.udid}},function(error,retorno)
		{
			device = new DbDevice();
			device.udid = req.body.udid;
			device.device = req.body.device;
			device.version = req.body.ios;

			device.save(function(err,saveRevista){
				
				if(!err)
				{
					res.json(saveRevista);
				}
				else
				{
					res.json(err);
				}
			});
		});
		
		///Caso não tenha nenhum device;
		device = new DbDevice();
		device.udid = req.body.udid;
		device.device = req.body.device;
		device.version = req.body.ios;

		device.save(function(err,saveRevista){
			
			if(!err)
			{
				res.json(saveRevista);
			}
			else
			{
				res.json(err);
			}
		});
		
				
	}
	else
	{
		erro.code = 666;
		erro.message = "Todos os campos são obrigatórios.";
		res.json(erro);
	}
	
});


app.get("/sendpush",function(req,res,next){
//	
//	
//	var id = req.query.p1;
//	
//	
//	DbRevista.findOne({_id:id},function(err,retRev){
//		console.log(retRev);
//		
//		DbDevice.find().exec(function(error,retorno){
//			console.log("DbDevice = "+retorno);
//			for (i = 0;i< retorno.length;i++)
//			{
//				console.log("retorno titulo = "+retorno[i].udid);
//				var 
//				  cert_and_key = require('fs').readFileSync('./apns-dev.pem')
//				  notifier = require('node_apns').services.Notifier({ cert: cert_and_key, key: cert_and_key }, true /* development = true, production = false */)
//
//
//				 /* 
//				   Now you may send notifications!
//				 */
//
//				 var Notification = require('node_apns').Notification;
//
//				 notifier.notify(Notification("55c62665bad08c74a91a5208667e7ea89acaf69e747209699dc9ce0d3fccb831", { aps: { alert:"Nova Edição: "+p1, sound: "default" }}), 
//				   function (err) { 
//					 if (!err)
//						{
//							console.log("Sent", this);
//							res.json(this);
//						}  
//						else 
//						{
//							console.log('Error', err, 'on', this);
//							res.json(err);
//						}
//				   }
//				 );
//
//				
//			}
//			
//			
//			
//		});
//				
//	});
//	
	
	
});

//POST Dos Dados
app.post("/createRevista",multipartMiddleware, function(req,res,next){
	
	if(!req.session.admin)
	{
		req.session.erro = {code:400,message:"Sem acesso"};
		res.redirect("/");
	}
	if(req.body.identificador)
	{
		DbRevista.findOne({_id:req.body.identificador},function(err,ret){
//			SQLITEZIP
			require('crypto').randomBytes(32, function(ex, buf) {
				var token = buf.toString('hex');
			    var spt = req.files.zip.name.split(".");
				var imageName = token +"."+spt[spt.length-1]; 
				
				fs.readFile(req.files.zip.path, function (err, data) {
				  // ...
				  var newPath = __dirname + "/public/sqlite/"+imageName;
				  
				  fs.writeFile(newPath, data, function (err) {
					  var sqlite = imageName;
					  console.log(sqlite);
//						CAPA
						require('crypto').randomBytes(32, function(ex, buf) {
							var token = buf.toString('hex');
						    var spt = req.files.capa.name.split(".");
							var imageNameCapa = token +"."+spt[spt.length-1]; 
							
							fs.readFile(req.files.capa.path, function (err, data) {
							  // ...
							  var newPath = __dirname + "/public/images/"+imageNameCapa;
							  
							  fs.writeFile(newPath, data, function (err) {
								  var capa = imageNameCapa;
								  console.log("capa"+capa);
								  
									ret.titulo = req.body.titulo;
									ret.descricao = req.body.descricao;
									ret.circulacao = req.body.circulacao;
								  
								  ret.capa = capa;
								  ret.arquivo = sqlite;
								  ret.push = req.body.push;
								  ret.link = req.body.link;
								  var today = new Date();
								  var unsafeToday = today.AsDateJs(); 

								  ret.data = unsafeToday;
									ret.save(function(err,saveRevista){
										console.log(err);
										console.log(saveRevista);
										
										
										
										if(!err)
										{
											req.session.erro = {code:666,message:"Revista incluída com sucesso!"};
											
											if(req.body.push)
											{
												DbDevice.find().exec(function(error,retorno){
													console.log("DbDevice = "+retorno);
													for (i = 0;i< retorno.length;i++)
													{
														console.log("retorno titulo = "+retorno[i].udid);
														var 
														  cert_and_key = require('fs').readFileSync('./apns-dev.pem')
														  notifier = require('node_apns').services.Notifier({ cert: cert_and_key, key: cert_and_key }, false /* development = true, production = false */)


														 /* 
														   Now you may send notifications!
														 */
														  
														 var celular = retorno[i].udid; 
														  
														 var Notification = require('node_apns').Notification;

														 notifier.notify(Notification(celular, { aps: { alert:"Edição Atualizada: "+ret.titulo, sound: "default" }}), 
														   function (err) { 
															 if (!err)
																{
																	console.log("Sent", this);
																	res.json(this);
																}  
																else 
																{
																	console.log('Error', err, 'on', this);
																	res.json(err);
																}
														   }
														 );

														
													}
													
													
													
												});
											}
											
											res.redirect("/");
										}
										else
										{
											req.session.erro = {code:666,message:err.message};
											res.redirect("/");
										}
									});
							 });
							  
							});
						
						});
				 });
				  
				});
			
			});
		});
	}
	else
	{
		
		
	
		
//		SQLITEZIP
		require('crypto').randomBytes(32, function(ex, buf) {
			var token = buf.toString('hex');
		    var spt = req.files.zip.name.split(".");
			var imageName = token +"."+spt[spt.length-1]; 
			
			fs.readFile(req.files.zip.path, function (err, data) {
			  // ...
			  var newPath = __dirname + "/public/sqlite/"+imageName;
			  
			  fs.writeFile(newPath, data, function (err) {
				  var sqlite = imageName;
				  console.log(sqlite);
//					CAPA
					require('crypto').randomBytes(32, function(ex, buf) {
						var token = buf.toString('hex');
					    var spt = req.files.capa.name.split(".");
						var imageNameCapa = token +"."+spt[spt.length-1]; 
						
						fs.readFile(req.files.capa.path, function (err, data) {
						  // ...
						  var newPath = __dirname + "/public/images/"+imageNameCapa;
						  
						  fs.writeFile(newPath, data, function (err) {
							  var capa = imageNameCapa;
							  console.log("capa"+capa);
							  var ret = new DbRevista();
								ret.titulo = req.body.titulo;
								ret.descricao = req.body.descricao;
								ret.circulacao = req.body.circulacao;
								ret.revista = req.body.revista;
								ret.link = req.body.link;
							  ret.capa = capa;
							  ret.arquivo = sqlite;
							  ret.push = req.body.push;
							  
							  var today = new Date();
							  var unsafeToday = today.AsDateJs(); 

							  ret.data = unsafeToday;
								ret.save(function(err,saveRevista){
									console.log(err);
									console.log(saveRevista);
									if(!err)
									{
										req.session.erro = {code:666,message:"Revista incluída com sucesso!"};
										if(req.body.push)
										{
											DbDevice.find().exec(function(error,retorno){
												console.log("DbDevice = "+retorno);
												for (i = 0;i< retorno.length;i++)
												{
													console.log("retorno titulo = "+retorno[i].udid);
													var 
													  cert_and_key = require('fs').readFileSync('./apns-dev.pem')
													  notifier = require('node_apns').services.Notifier({ cert: cert_and_key, key: cert_and_key }, false /* development = true, production = false */)


													 /* 
													   Now you may send notifications!
													 */
													  
													  var celular = retorno[i].udid; 

													 var Notification = require('node_apns').Notification;

													 notifier.notify(Notification(celular, { aps: { alert:"Nova Edição: "+ret.titulo, sound: "default" }}), 
													   function (err) { 
														 if (!err)
															{
																console.log("Sent", this);
																res.json(this);
															}  
															else 
															{
																console.log('Error', err, 'on', this);
																res.json(err);
															}
													   }
													 );

													
												}
												
												
												
											});
										}
										res.redirect("/");
									}
									else
									{
										req.session.erro = {code:666,message:err.message};
										res.redirect("/");
									}
								});
						 });
						  
						});
					
					});
			 });
			  
			});
		
		});
		

		
		
	}
});


app.post("/removeRevista",function(req,res,next){
	if(!req.session.admin)
	{
		req.session.erro = {code:400,message:"Sem acesso"};
		res.redirect("/");
	}
	if(req.body.id)
	{
		DbRevista.remove( {"_id": req.body.id},function(err,ret){
			if(!err)
			{
				req.session.erro = {code:001,message:"Revista removida com sucesso!"};
			}
			else
			{
				req.session.erro = err;
			}
			res.end();
		});
		
		
	}
});

app.get("/images/upload",function(req,res,next){
	res.render('images/form',{layout: 'images/upload',title:"Editora Taboca",erro:req.session.erro,code:""});
	req.session.destroy();
});

app.configure("development",function(){
	app.use(express.errorHandler({dumpExceptions:true,showStack:true}));
	app.set("db-uri","mongodb://localhost/eaerevista");
	
});

app.configure("production",function(){
	app.use(express.errorHandler());
	app.set("db-uri","mongodb://localhost/eaerevista");
});

app.db = mongoose.createConnection(app.set("db-uri"));

//var evilDns = require('evil-dns');
//
//evilDns.add('www.edtaboca.com.br', '54.207.15.229');
//
//evilDns.add('edtaboca.com.br', '54.207.15.229');

app.listen(1080);
