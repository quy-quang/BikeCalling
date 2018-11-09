var low = require('lowdb'),
	fileSync = require('lowdb/adapters/FileSync'),
	express = require('express'),
	moment = require('moment');

var tripAdapter = new fileSync('./tripDB.json');
var tripDB = low(tripAdapter);

var driverAdapter = new fileSync('./driverDB.json');
var driverDB = low(driverAdapter);

var clientAdapter = new fileSync('./clientDB.json');
var clientDB = low(clientAdapter);

var router = express.Router();

const 	WAITING = 0,
		MOVING = 1,
		DONE = 2

router.get('/trip', (req, res) => {
	var clientId = 0;
	if (req.query.clientId) {
		clientId += parseInt(req.query.clientId, 10);
	}
	var tripObject = tripDB.get('trip').find({"clientId": clientId}).value();
	console.log(tripObject["driverId"])
	var driverObject = driverDB.get('driver').find({"driverId":tripObject["driverId"]}).value();
	console.log(driverObject)
	var clientObject = clientDB.get('client').find({"clientId":tripObject["clientId"]}).value();
	var mapAndDriverInfo = {
		"clientAddress": clientObject["newAddress"],
		"driverAddress": driverObject["currentLocation"],
		"nameOfDriver": driverObject["name"]
	}

	res.statusCode = 201;
	res.json({
		mapAndDriverInfo
	})
})

module.exports = router;