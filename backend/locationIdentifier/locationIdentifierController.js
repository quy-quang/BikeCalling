var low = require('lowdb'),
	fileSync = require('lowdb/adapters/FileSync'),
	express = require('express');

var adapter = new fileSync('./clientDB.json');
var db = low(adapter);

var router = express.Router();

router.get('/', (req, res) => {
	var client = db.get('client');
	// console.log(JSON.stringify(client))
	res.statusCode = 200;
	res.json({
		client
	})
})

router.post('/', (req, res) => {
	// {
	// 	"clientId":...,
	// 	"newAddress":...
	// }
	var newClient = req.body;
	var findObject = (db.get('client').find(obj => obj["clientId"] == newClient["clientId"])).update("newAddress",
		x => newClient["newAddress"]).write();

	res.statusCode = 200;
	res.json({findObject});
})

module.exports = router;