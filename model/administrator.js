var database = require("./database.js");

var DbAdmin = database.Admin;



exports.findAll = function(req,res,next){
	
	var params = req.params;
	
	var retJson =req.query.json; 
	
	DbAdmin.find().sort({name : 1}).exec(function (err, listAllAdmin) {
        
		
		
        if (listAllAdmin && listAllAdmin.length > 0 && retJson) 
        	res.json(listAllAdmin);
        else 
        {
        	if(req.session.admin)
        	{
        		res.render('listAdmin',{layout: 'home',qryAdmin:listAllAdmin,title:"Editora Taboca",username:req.session.admin.usuario,code:err});
        		
        	}
        	else
        	{
        		req.session.erro = {code:400,message:"Sem acesso"};
        		res.redirect("/");
        		
        	}
        	
        }
        
        
    });
	
};
