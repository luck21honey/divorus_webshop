module.exports = {
    getHomePage: (req, res) => {
		
		var distrito = req.query.distrito;
        var actividade = req.query.actividade;
		var from = req.query.from;
        var to = req.query.to;
        
        var search_param = [];
        if(distrito){
            var innerObj = 'distrito_nome='+distrito;
            search_param.push(innerObj)
        }
        
        if(actividade){
            var innerObj = 'categoria='+actividade;
            search_param.push(innerObj);
        }
		
		if(from){
            var innerObj = 'origin='+distrito;
            search_param.push(innerObj)
        }
        
        if(to){
            var innerObj = 'destination='+actividade;
            search_param.push(innerObj);
        }
        
       
        
        var search_certi = '';
        if(search_param.length > 0){
            var arr_len = search_param.length;
            search_param.forEach(function(entry,index) {	
                var check = parseInt(index) + 1;
				
                if(check==arr_len){
                    search_certi += entry; 
                }else{
                    search_certi += entry+' AND '; 	
                }
              
            });
        }
        
        var query = '';
		
		console.log(search_certi,'search_certi');
		
		
		if(from && to){
			if(search_certi==''){
				query = 'Select empresas.id as id,rating,empresas.nome_empresa,empresas.email,empresas.pais,empresas.rua,empresas.codpos, empresas.telefone, empresas.image, empresas.descricao, empresas.descricao2, empresas.descricao3, distritos.distrito as distrito_name,actividades.actividade as categoria_name from empresas LEFT JOIN distritos ON distritos.id = empresas.distrito_nome LEFT JOIN actividades ON actividades.id = empresas.categoria order by rating DESC  ';
			}else{
				
				query = "Select empresas.id as id,rating,empresas.nome_empresa,empresas.email,empresas.pais,empresas.rua,empresas.codpos, empresas.telefone, empresas.image, empresas.descricao, empresas.descricao2, empresas.descricao3,distritos.distrito as distrito_name,actividades.actividade as categoria_name  from empresas LEFT JOIN distritos ON distritos.id = empresas.distrito_nome LEFT JOIN actividades ON actividades.id = empresas.categoria where origin LIKE '%"+from+"%' and destination LIKE '%"+to+"%' order by rating DESC";
				
				console.log(query,'query');
			}
		} else {
			if(search_certi==''){
				
				query = 'Select empresas.id as id,rating,empresas.nome_empresa,empresas.email,empresas.pais,empresas.rua,empresas.codpos, empresas.telefone, empresas.image,  empresas.descricao, empresas.descricao2, empresas.descricao3, distritos.distrito as distrito_name,actividades.actividade as categoria_name from empresas LEFT JOIN distritos ON distritos.id = empresas.distrito_nome LEFT JOIN actividades ON actividades.id = empresas.categoria order by rating DESC  ';
			}else{
				
				if(distrito!=0 && actividade!=0){
					query = 'Select empresas.id as id,rating,empresas.nome_empresa,empresas.email,empresas.pais,empresas.rua,empresas.codpos, empresas.telefone, empresas.image, empresas.descricao, empresas.descricao2, empresas.descricao3,distritos.distrito as distrito_name,actividades.actividade as categoria_name  from empresas LEFT JOIN distritos ON distritos.id = empresas.distrito_nome LEFT JOIN actividades ON actividades.id = empresas.categoria where '+search_certi+' order by rating DESC';
				}else if(distrito!=0 && actividade==0){
					query = 'Select empresas.id as id,rating,empresas.nome_empresa,empresas.email,empresas.pais,empresas.rua,empresas.codpos, empresas.telefone, empresas.image,  empresas.descricao, empresas.descricao2, empresas.descricao3,distritos.distrito as distrito_name,actividades.actividade as categoria_name from empresas LEFT JOIN distritos ON distritos.id = empresas.distrito_nome LEFT JOIN actividades ON actividades.id = empresas.categoria where distrito_nome='+distrito+' order by rating DESC';
				}else if(distrito==0 && actividade!=0){
					query = 'Select empresas.id as id,rating,empresas.nome_empresa,empresas.email,empresas.pais,empresas.rua,empresas.codpos, empresas.telefone, empresas.image, empresas.descricao, empresas.descricao2, empresas.descricao3,distritos.distrito as distrito_name,actividades.actividade as categoria_name  from empresas LEFT JOIN distritos ON distritos.id = empresas.distrito_nome LEFT JOIN actividades ON actividades.id = empresas.categoria where categoria='+actividade+' order by rating DESC';
				}else{
					query = 'Select empresas.id as id,rating,empresas.nome_empresa,empresas.email,empresas.pais,empresas.rua,empresas.codpos, empresas.telefone, empresas.image,  empresas.descricao, empresas.descricao2, empresas.descricao3,distritos.distrito as distrito_name,actividades.actividade as categoria_name  from empresas LEFT JOIN distritos ON distritos.id = empresas.distrito_nome LEFT JOIN actividades ON actividades.id = empresas.categoria order by rating DESC';
				}
				
				console.log(query);
			}
		}
      
        db.query(query, function(err,result) {
          console.log(err,'err')	
        
             db.query('Select * from distritos', function(err,distrito_res) {
                db.query('Select * from actividades', function(err,actividade_res) {  
                    db.query('SELECT * FROM `blog`  ORDER by RAND() limit 4', function(err,sidenews) {  
                 
                    res.render('frontend/index.ejs', {
                        
                        players: result,
                        distrito:distrito_res,
                        actividade:actividade_res,
                        req:req,
                        sidenews:sidenews
                    });
                  
                });
                });
              });
            });
        
    
        // execute query
      

   
        },
        gettransportespage: (req, res) => {
		
            var distrito = req.query.distrito;
            var actividade = req.query.actividade;
            var from = req.query.from;
            var to = req.query.to;
            
            var search_param = [];
            if(distrito){
                var innerObj = 'distrito_nome='+distrito;
                search_param.push(innerObj)
            }
            
            if(actividade){
                var innerObj = 'categoria='+actividade;
                search_param.push(innerObj);
            }
            
            if(from){
                var innerObj = 'origin='+distrito;
                search_param.push(innerObj)
            }
            
            if(to){
                var innerObj = 'destination='+actividade;
                search_param.push(innerObj);
            }
            
           
            
            var search_certi = '';
            if(search_param.length > 0){
                var arr_len = search_param.length;
                search_param.forEach(function(entry,index) {	
                    var check = parseInt(index) + 1;
                    
                    if(check==arr_len){
                        search_certi += entry; 
                    }else{
                        search_certi += entry+' AND '; 	
                    }
                  
                });
            }
            
            var query = '';
            
            console.log(search_certi,'search_certi');
            
            
            if(from && to){
                if(search_certi==''){
                    query = 'Select empresas.id as id,rating,empresas.nome_empresa,empresas.email,empresas.pais,empresas.rua,empresas.codpos, empresas.telefone, empresas.image, empresas.slogan, empresas.descricao, empresas.descricao2, empresas.descricao3, distritos.distrito as distrito_name,actividades.actividade as categoria_name from empresas LEFT JOIN distritos ON distritos.id = empresas.distrito_nome LEFT JOIN actividades ON actividades.id = empresas.categoria order by rating DESC  ';
                }else{
                    
                    query = "Select empresas.id as id,rating,empresas.nome_empresa,empresas.email,empresas.pais,empresas.rua,empresas.codpos, empresas.telefone, empresas.image, empresas.slogan, empresas.descricao, empresas.descricao2, empresas.descricao3,distritos.distrito as distrito_name,actividades.actividade as categoria_name  from empresas LEFT JOIN distritos ON distritos.id = empresas.distrito_nome LEFT JOIN actividades ON actividades.id = empresas.categoria where origin LIKE '%"+from+"%' and destination LIKE '%"+to+"%' order by rating DESC";
                    
                    console.log(query,'query');
                }
            } else {
                if(search_certi==''){
                    
                    query = 'Select empresas.id as id,rating,empresas.nome_empresa,empresas.email,empresas.pais,empresas.rua,empresas.codpos, empresas.telefone, empresas.image, empresas.slogan, empresas.descricao, empresas.descricao2, empresas.descricao3, distritos.distrito as distrito_name,actividades.actividade as categoria_name from empresas LEFT JOIN distritos ON distritos.id = empresas.distrito_nome LEFT JOIN actividades ON actividades.id = empresas.categoria order by rating DESC  ';
                }else{
                    
                    if(distrito!=0 && actividade!=0){
                        query = 'Select empresas.id as id,rating,empresas.nome_empresa,empresas.email,empresas.pais,empresas.rua,empresas.codpos, empresas.telefone, empresas.image, empresas.slogan, empresas.descricao, empresas.descricao2, empresas.descricao3,distritos.distrito as distrito_name,actividades.actividade as categoria_name  from empresas LEFT JOIN distritos ON distritos.id = empresas.distrito_nome LEFT JOIN actividades ON actividades.id = empresas.categoria where '+search_certi+' order by rating DESC';
                    }else if(distrito!=0 && actividade==0){
                        query = 'Select empresas.id as id,rating,empresas.nome_empresa,empresas.email,empresas.pais,empresas.rua,empresas.codpos, empresas.telefone, empresas.image, empresas.slogan, empresas.descricao, empresas.descricao2, empresas.descricao3,distritos.distrito as distrito_name,actividades.actividade as categoria_name from empresas LEFT JOIN distritos ON distritos.id = empresas.distrito_nome LEFT JOIN actividades ON actividades.id = empresas.categoria where distrito_nome='+distrito+' order by rating DESC';
                    }else if(distrito==0 && actividade!=0){
                        query = 'Select empresas.id as id,rating,empresas.nome_empresa,empresas.email,empresas.pais,empresas.rua,empresas.codpos, empresas.telefone, empresas.image, empresas.slogan, empresas.descricao, empresas.descricao2, empresas.descricao3,distritos.distrito as distrito_name,actividades.actividade as categoria_name  from empresas LEFT JOIN distritos ON distritos.id = empresas.distrito_nome LEFT JOIN actividades ON actividades.id = empresas.categoria where categoria='+actividade+' order by rating DESC';
                    }else{
                        query = 'Select empresas.id as id,rating,empresas.nome_empresa,empresas.email,empresas.pais,empresas.rua,empresas.codpos, empresas.telefone, empresas.image, empresas.slogan, empresas.descricao, empresas.descricao2, empresas.descricao3,distritos.distrito as distrito_name,actividades.actividade as categoria_name  from empresas LEFT JOIN distritos ON distritos.id = empresas.distrito_nome LEFT JOIN actividades ON actividades.id = empresas.categoria order by rating DESC';
                    }
                    
                    console.log(query);
                }
            }
          
            db.query(query, function(err,result) {
              console.log(err,'err')	
            
                 db.query('Select * from distritos', function(err,distrito_res) {
                    db.query('Select * from actividades', function(err,actividade_res) {  
                        db.query('SELECT * FROM `blog`  ORDER by RAND() limit 4', function(err,sidenews) {  
                     
                        res.render('transportes.ejs', {
                            
                            players: result,
                            distrito:distrito_res,
                            actividade:actividade_res,
                            req:req,
                            sidenews:sidenews
                        });
                      
                    });
                    });
                  });
                });
            
        
            // execute query
          
    
       
            }
        
};