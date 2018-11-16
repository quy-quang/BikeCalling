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

const CLIENT_LOCATING = 0,
	CLIENT_LOCATED = 1,
	CLIENT_READY = 2,
	CLIENT_MOVING = 3,
	CLIENT_DONE = 4;

const LOOP_FIND_REQUEST = 4;

Number.prototype.toRad = function () {
    return this * Math.PI / 180;
}
// Hàm tính khoảng cách Haversine giữa 2 tọa độ trên map
function distanceHaversine(point1, point2) {
    x2 = point2.lng - point1.lng;
    x1 = point2.lat - point1.lat;
    R = 6371;
    dLongitude = x2.toRad();
    dLatitude = x1.toRad();
    var a = Math.sin(dLatitude / 2) * Math.sin(dLatitude / 2) +
        Math.cos(point1.lat.toRad()) * Math.cos(point2.lat.toRad()) *
        Math.sin(dLongitude / 2) * Math.sin(dLongitude / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return d;
}



var findNearestDriver = (clientObj, driverList) => {
	var clientLatlng = clientObj.latlngAddress;
	// console.log(clientObj);
	// console.log(clientLatlng)
	var nearestDriver = null;
	var minDistance = 9999999;
	for (var i = driverList.length - 1; i >= 0; i--) {
		var distance = distanceHaversine(clientLatlng, driverList[i].latlngAddress);
		if (minDistance > distance){
			nearestDriver = driverList[i].driverId;
			minDistance = distance
		}
	}
	return nearestDriver;
}

var findRequest = idDriver => {
	// console.log('abbc' + idDriver)
	var clientAdapter = new fileSync('./clientDB.json');
	var clientDB = low(clientAdapter);
	var client = clientDB.get('client').filter({"status": CLIENT_LOCATED}).filter({idDriver: undefined}).value();
	var driver = driverDB.get('driver').filter({"status": READY}).value();
	// console.log(client);
	// console.log(driver);

	for (var i = client.length - 1; i >= 0; i--) {
		//console.log(client[i]);
		nearestDriver = findNearestDriver(client[i], driver);
		if (nearestDriver == idDriver) return client[i];
	}
	return null;	
}



router.post('/declineRequest', (req, res) => {
	// {
	// 	"driverId":
	// 	"clientId"
	// }

	var clientAdapter = new fileSync('./clientDB.json');
	var clientDB = low(clientAdapter);

	var clientDecline = clientDB.get('client').find({"clientId": req.body.clientId}).value();
	
	clientDecline[req.body.driverId] = true;

	clientDB.get('client').find({"clientId": req.body.clientId}).update(x => clientDecline).write();

	res.statusCode = 204;
    res.end('no data');
})

router.post('/currentLocation', (req, res) => {
	// {
		// driverId:
	// 	latlngAddress:
	// 	address:
	// }
	var driverId  = req.body.driverId;
	var latlngAddress = req.body.latlngAddress;
	var address = req.body.address;
	driverDB.get('driver').find({"driverId": driverId}).update("address",
		x => address).update("latlngAddress",
		x => latlngAddress).write();
	res.statusCode = 204;
    res.end('no data');
})


router.post('/toReady', (req, res) => {
	var driverId = req.body.driverId;
	// console.log(req)
	driverDB.get('driver').find({"driverId": driverId}).update("status",
		x => READY).write();

	var loop = 0;
    var fn = () => {
    	var request = findRequest(driverId);
    	console.log(request);
    	res.statusCode = 200;
        if (request != null) {
            res.json({
                request
            });
        } else {
            loop++;
            console.log(`loop find client request: ${loop}`);
            if (loop < LOOP_FIND_REQUEST) {
                setTimeout(fn, 2500);
            } else {
                res.statusCode = 204;
                res.end('no data');
            }
        }
    }

    fn();
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
