var LocalStrategy = require("passport-local").Strategy;

var mysql = require('mysql');
var bcrypt = require('bcrypt-nodejs');
var dbconfig = require('./database');
var connection = mysql.createConnection(dbconfig.connection);

connection.query('USE ' + dbconfig.database);

module.exports = function(passport) {
 passport.serializeUser(function(user, done){
  done(null, user.id);
 });

 passport.deserializeUser(function(id, done){
  connection.query("SELECT * FROM users WHERE id = ? ", [id],
   function(err, rows){
    done(err, rows[0]);
   });
 });

 passport.use(
  'local-signup',
  new LocalStrategy({
   usernameField : 'email',
   passwordField: 'password',
   passReqToCallback: true
  },
  function  (req, email, password, done){
    
   connection.query("SELECT * FROM users WHERE email = ? ", 
   [email], function(err, rows){
    if(err)
     return done(err);
    if(rows.length){
     return done(null, false, req.flash('signupMessage', 'Esse email já existe, tenta outro!'));
    }else{
      
    

      
    
     var newUserMysql = {
       email: email,
       fullname: req.body.fullname,
       data: req.body.data,
       sexo: req.body.sexo,
      username: req.body.username,
      password: bcrypt.hashSync(password, null, null),
      
     };
     if(req.files.images){
      let sampleFile = req.files.images;
      let uni = new Date().getTime();
      var file_name = uni+'_'+req.files.images.name.replace(/ /g,"_");
      sampleFile.mv('public/imguser/'+file_name,function(res){
         console.log(res,'test');
      }); 
    }else{
      var file_name = "";
    }
     var insertQuery = "INSERT INTO users (username, password, email, fullname, data, sexo, imagem) values (?, ?, ?, ?, ?, ?, ?)";

     connection.query(insertQuery, [newUserMysql.username, newUserMysql.password, newUserMysql.email, newUserMysql.fullname, newUserMysql.data, newUserMysql.sexo, file_name],
      function(err, rows){
       newUserMysql.id = rows.insertId;

       return done(null, newUserMysql);
      });
    }
   });
  })
 );

 passport.use(
  'local-login',
  new LocalStrategy({
   emailField : 'email',
   passwordField: 'password',
   passReqToCallback: true
  },
  function(req, email, password, done){
   connection.query("SELECT * FROM users WHERE email = ? ", [email],
   function(err, rows){
    if(err)
     return done(err);
    if(!rows.length){
     return done(null, false, req.flash('loginMessage', 'Usuário não encontrado'));
    }
    if(!bcrypt.compareSync(password, rows[0].password))
     return done(null, false, req.flash('loginMessage', 'Password incorrecta'));

    return done(null, rows[0]);
   });
  })
 );



 
};