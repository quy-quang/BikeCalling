var db = require('../fn/mysql-db.js');

exports.loadAll = ()=>{
	var sql = "select * from products"
	return db.load(sql);
}