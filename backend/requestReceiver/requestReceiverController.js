const LOCATING = 0,
	LOCATED = 1,
	READY = 2,
	MOVING = 3,
	DONE = 4;

var low = require('lowdb'),
	fileSync = require('lowdb/adapters/FileSync'),
	express = require('express'),
	moment = require('moment');
const shortid = require('shortid');

var adapter = new fileSync('./clientDB.json');
var clientDB = low(adapter);
var router = express.Router();

router.post('/', (req, res) => {
	var client = req.body;
	var time_request = moment().unix();
	client["timeRequest"] = time_request;
	client["status"] = LOCATING;
	client["newAddress"] = "";
	client["clientId"] = shortid.generate();
	clientDB.get('client').push(client).write();

	res.statusCode = 201;
	res.json({
		msg: 'received request'
	})
})

module.exports = router;
