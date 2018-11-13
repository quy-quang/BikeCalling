var express = require('express')

var router = express.Router();
var authRepo = require('./Repo/authRepo')
var md5 = require('md5')
var low = require('lowdb'),
	fileSync = require('lowdb/adapters/FileSync'),
	moment = require('moment');
const shortid = require('shortid');


var driverAdapter = new fileSync('./driverDB.json');
var driverDB = low(driverAdapter);

var tripAdapter = new fileSync('./tripDB.json');
var tripDB = low(tripAdapter);
const 	OFFILINE = 0,
		STANDBY = 1,
		READY	= 2;

const	WAITING	= 0,
		MOVING	= 1,
		DONE	= 2;


router.post('/currentLocation', (req, res) => {
	var driverId  = req.body.driverId;
	var currentLocation = {
		lat : req.body.lat,
		lng : req.body.lng
	}
	driverDB.get('driver').find({"driverId": driverId}).update("currentLocation",
		x => currentLocation).write();
	res.statusCode = 204;
    res.end('no data');
})

router.post('/toReady', (req, res) => {
	var driverId = req.body.driverId;
	driverDB.get('driver').find({"driverId": driverId}).update("status",
		x => READY).write();
	res.statusCode = 204;
	res.end('no data');
})

router.post('/logout', (req, res) => {
	var driverId = req.body.driverId;
	driverDB.get('driver').find({"driverId": driverId}).update("status",
		x => OFFILINE).write();
	driverDB.get('driver').find({"driverId": driverId}).update("access_token",
		x => "").write();
	res.statusCode = 204;
	res.end('no data');	
})

router.post('/tripCreating', (req, res) => {
	// {
	// 	"driverId":...,
	// 	"clientId":...
	// }
	var tripEntity = req.body;
	var time_request = moment().unix();

	tripEntity["iat"] = time_request;

	tripEntity["status"] = WAITING;
	tripEntity["tripId"] = shortid.generate();
	tripDB.get('trip').push(tripEntity).write();

	res.statusCode = 201;
	res.json({
		idTrip: tripEntity["idTrip"]
	})
})


router.post('/tripStarting', (req, res) => {
	tripDB.get('trip').find({"tripId": req.body.tripId}).update("status",
		x => MOVING).write();
	res.statusCode = 200;
	res.json({
		msg:"trip started"
	})
})

router.post('/tripFinishing', (req, res) => {
	tripDB.get('trip').find({"tripId": req.body.tripId}).update("status",
		x => DONE).write();
	res.statusCode = 200;
	res.json({
		msg:"trip done"
	})
})

module.exports = router;
