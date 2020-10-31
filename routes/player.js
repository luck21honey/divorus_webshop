const fs = require('fs');

module.exports = {
   
    getEmpresaProfile :(req, res) => {
		console.log(req);
		
        let playerId = req.params.id;
        let query = "SELECT * FROM `empresas` WHERE id = '" + playerId + "' ";
       
        db.query(query, (err, result_player) => {
           
            if (err) {
                return res.status(500).send(err);
            }
			
			db.query('SELECT SUM(rating) AS "total_add" FROM company_rating WHERE company_id='+playerId, (err, result) => {
				
				var sum = JSON.parse(JSON.stringify(result));
				
				var total_add = sum[0].total_add;
				
				db.query('SELECT count(*) AS "total_count" FROM company_rating WHERE company_id='+playerId, (err, result) => {
					
					var count = JSON.parse(JSON.stringify(result));
					
					var total_count = count[0].total_count;
					
					var rating = total_add / total_count;
                   

					db.query('SELECT * FROM company_rating INNER JOIN users ON users.id=company_rating.user_id where company_id="'+playerId+'" order by company_rating.created_at DESC', (err, reviews) => {	
                        let query5 = "SELECT * FROM `blog`  ORDER by RAND() limit 5";
                        db.query(query5, (err, sidenews) => {
						res.render('empresaProfile.ejs', {
							title: "Edit  Player"
							,player: result_player[0]
							,message: ''
							,rating:parseInt(rating)
                            ,reviews:reviews
                            ,sidenews:sidenews
						});
					
					});
					
				});
            })
        })
        });
    },
    
    
    
    deletePlayer: (req, res) => {
        let playerId = req.params.id;
        let getImageQuery = 'SELECT image from `empresas` WHERE id = "' + playerId + '"';
        let deleteUserQuery = 'DELETE FROM empresas WHERE id = "' + playerId + '"';

        db.query(getImageQuery, (err, result) => {
            if (err) {
                return res.status(500).send(err);
            }

            let image = result[0].image;

            fs.unlink(`public/assets/img/${image}`, (err) => {
                if (err) {
                    return res.status(500).send(err);
                }
                db.query(deleteUserQuery, (err, result) => {
                    if (err) {
                        return res.status(500).send(err);
                    }
                    res.redirect('/');
                });
            });
        });
    }
};
