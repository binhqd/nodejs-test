var database = require("./database.js");

var DbRevista = database.Revista;



exports.findAll = function(req,res,next){
	
	var params = req.params;
	
	var retJson = req.query.json; 
	if(!req.session.admin && !retJson)
	{
		req.session.erro = {code:400,message:"Sem acesso"};
		res.redirect("/");
	}
	
	
	var tipoRevista = req.query.tipo;
	
	console.log(tipoRevista);
	
	if(tipoRevista)
	{
		DbRevista.find({revista : tipoRevista}).sort({titulo:-1}).exec(function (err, listAllRevista) {
	        
	        if (listAllRevista && listAllRevista.length > 0 && retJson) 
	        	res.json(listAllRevista);
	        else if(retJson)
	        	res.json(listAllRevista);
	        else 
	        {
	        	res.render('listRevista',{layout: 'home',qryRevista:listAllRevista,title:"Eae Editora",code:err});
	        }
	        
	        
	    });
		
	}
	else
	{
		DbRevista.find().sort({data:1}).exec(function (err, listAllRevista) {
	        
			
			
	        if (listAllRevista && listAllRevista.length > 0 && retJson) 
	        	res.json(listAllRevista);
	        else if(retJson)
	        	res.json(listAllRevista);
	        else 
	        {
	        	res.render('listRevista',{layout: 'home',qryRevista:listAllRevista,title:"Eae Editora",code:err});
	        }
	        
	        
	    });
		
	}
	
};
