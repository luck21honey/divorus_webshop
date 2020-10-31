try{
    var mysql_npm = require('./../../node_modules/mysql');
}catch(err){
    console.log("Cannot find `mysql` module. Is it installed ? Try `npm install mysql` or `npm install`.");
}

//- Connection configuration
var db_config;
db_config = {
	host         : 'localhost',
	user         : 'root',
	password     : '',
	database     : 'sokanew'
};


//- Create the connection variable
var connection = mysql_npm.createConnection(db_config);
module.exports = connection;
