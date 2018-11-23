var express = require('express')

var router = express.Router();
var authRepo = require('./Repo/authRepo')
var md5 = require('md5')
var low = require('lowdb'),
	fileSync = require('lowdb/adapters/FileSync'),
	moment = require('moment');
const shortid = require('shortid');


var driverAdapter = new fileSync('./driverDB.json');
var tripAdapter = new fileSync('./tripDB.json');
var clientAdapter = new fileSync('./clientDB.json');

// Trạng thái của Driver
const OFFILINE = 0,
	STANDBY = 1,
	READY = 2,
	CANCEL = 3;

// Trạng thái của chuyến đi
const WAITING = 0,
	MOVING = 1,
	DONE = 2;

// Trạng thái của Khách hàng
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

// Tìm Driver gần Customer nhất
var findNearestDriver = (clientObj, driverList) => {
	var clientLatlng = clientObj.latlngAddress;
	var nearestDriver = null;
	var minDistance = 9999999;
	for (var i = driverList.length - 1; i >= 0; i--) {
		if (clientObj[driverList[i].driverId] != true) {
			var distance = distanceHaversine(clientLatlng, driverList[i].latlngAddress);
			console.log(distance);
			if (minDistance > distance) {
				nearestDriver = driverList[i].driverId;
				minDistance = distance
			}
		}
	}
	return nearestDriver;
}

// Hàm tìm kiếm Driver
var findRequest = idDriver => {
	console.log(idDriver)
	var a = 'status'
	var clientDB = low(clientAdapter);
	var driverDB = low(driverAdapter);

	var client = clientDB.get('client').filter({ [a]: CLIENT_LOCATED }).reject({ [idDriver]: true }).value();
	var driver = driverDB.get('driver').filter({ [a]: READY }).value();
	console.log(client);
	console.log(driver);

	for (var i = 0; i < client.length; i++) {
		//console.log(client[i]);
		nearestDriver = findNearestDriver(client[i], driver);
		if (nearestDriver == idDriver) return client[i];
	}
	return null;
}


// Từ chối request
router.post('/declineRequest', (req, res) => {
	// {
	// 	"driverId":
	// 	"clientId"
	// }
	var driverId = req.body.driverId;
	var clientId = req.body.clientId;
	var clientDB = low(clientAdapter);

	var clientDecline = clientDB.get('client').find({ "clientId": clientId }).value();

	clientDecline[driverId] = true;

	console.log(clientDecline);

	//clientDB.get('client').find({"clientId": clientId}).update(x => clientDecline).write();
	clientDB.get('client').find({ "clientId": clientId }).assign({ [driverId]: true }).write();

	res.statusCode = 204;
	res.end('no data');
})

// Cập nhật vị trí hiện tai của driver
router.post('/currentLocation', (req, res) => {
	// {
	// driverId:
	// 	latlngAddress:
	// 	address:
	// }
	var driverDB = low(driverAdapter);
	var driverId = req.body.driverId;
	var latlngAddress = req.body.latlngAddress;
	var address = req.body.address;

	driverDB.get('driver').find({ "driverId": driverId })
		.update("address", x => address)
		.update("latlngAddress", x => latlngAddress)
		.write();

	res.statusCode = 204;
	res.end('no data');
})


router.post('/toReady', (req, res) => {
	var driverDB = low(driverAdapter);
	var driverId = req.body.driverId;

	// Chuyển trạng thái của driver
	driverDB.get('driver').find({ "driverId": driverId })
		.update("status", x => READY)
		.write();
	res.statusCode = 200;
	res.end('Success');


})

router.post('/toStandby', (req, res) => {
	var driverDB = low(driverAdapter);
	var driverId = req.body.driverId;

	// Chuyển trạng thái của driver
	driverDB.get('driver').find({ "driverId": driverId })
		.update("status", x => STANDBY)
		.write();
	res.statusCode = 200;
	res.end('Success');
})

router.post('/findTrip', (req, res) => {
	var driverDB = low(driverAdapter);
	var driverId = req.body.driverId;

	// Chuyển trạng thái của driver
	driverEntry = driverDB.get('driver').find({ "driverId": driverId }).value();

	if (driverEntry.status == 1) {
		res.statusCode = 205;
		res.end('Cancel');
	} else {
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
	}
})

// Hàm đăng xuất
router.post('/logout', (req, res) => {

	var driverDB = low(driverAdapter);
	var driverId = req.body.driverId;

	//Chuyển về trạng thái OFFLINE
	driverDB.get('driver').find({ "driverId": driverId })
		.update("status", x => OFFILINE)
		.write();
	driverDB.get('driver').find({ "driverId": driverId })
		.update("access_token", x => "")
		.write();

	res.statusCode = 204;
	res.end('no data');
})

//Hàm tạo chuyến đi mới
router.post('/tripCreating', (req, res) => {
	// {
	// 	"driverId":...,
	// 	"clientId":...
	// }
	var clientDB = low(clientAdapter);
	var driverDB = low(driverAdapter);
	var tripDB = low(tripAdapter);

	var tripEntity = req.body;
	var driverId = req.body.driverId;
	var clientId = req.body.clientId;

	//Chuyển trạng thái của Driver về Stand By
	driverDB.get('driver').find({ "driverId": driverId })
		.update("status", x => STANDBY)
		.write();

	// Chuyển trạng thái Customer thành READY
	clientDB.get('client').find({ "clientId": clientId })
		.update("status", x => CLIENT_READY)
		.write();

	var time_request = moment().unix();

	clientDB.get('client').find({ "clientId": clientId })
		.update("iat", x => time_request)
		.write();
	// Tạo chuyến đi
	tripEntity["iat"] = time_request;
	tripEntity["status"] = WAITING;
	tripEntity["tripId"] = shortid.generate();
	tripDB.get('trip').push(tripEntity).write();

	res.statusCode = 201;
	res.json({
		tripId: tripEntity["tripId"]
	})
})

// Bắt đầu chuyến đi
router.post('/tripStarting', (req, res) => {
	var tripDB = low(tripAdapter);
	var clientDB = low(clientAdapter);
	var driverDB = low(driverAdapter);

	var entryTrip = tripDB.get('trip').find({ "tripId": req.body.tripId })
		.value();

	var time_request = moment().unix();

	tripDB.get('trip').find({ "tripId": req.body.tripId })
		.update("status", x => MOVING)
		.write();
	tripDB.get('trip').find({ "tripId": req.body.tripId })
		.update("iat", x => time_request)
		.write();

	var driverId = entryTrip.driverId;
	var clientId = entryTrip.clientId;

	clientDB.get('client').find({ "clientId": clientId })
		.update("status", x => CLIENT_MOVING)
		.write();
	clientDB.get('client').find({ "clientId": clientId })
		.update("iat", x => time_request)
		.write();

	driverDB.get('driver').find({ "driverId": driverId })
		.update("status", x => STANDBY)
		.write();
	res.statusCode = 200;
	res.json({
		msg: "trip started"
	})
})

router.post('/tripFinishing', (req, res) => {
	var tripDB = low(tripAdapter);
	var clientDB = low(clientAdapter);
	var driverDB = low(driverAdapter);

	var entryTrip = tripDB.get('trip').find({ "tripId": req.body.tripId }).value();

	var time_request = moment().unix();

	tripDB.get('trip').find({ "tripId": req.body.tripId })
		.update("status", x => DONE)
		.write();

	tripDB.get('trip').find({ "tripId": req.body.tripId })
		.update("iat", x => time_request)
		.write();

	var driverId = entryTrip.driverId;
	var clientId = entryTrip.clientId;

	clientDB.get('client').find({ "clientId": clientId })
		.update("status", x => CLIENT_DONE)
		.write();

	clientDB.get('client').find({ "clientId": clientId })
		.update("iat", x => time_request)
		.write();
		
	driverDB.get('driver').find({ "driverId": driverId })
		.update("status", x => STANDBY)
		.write();

	res.statusCode = 200;
	res.json({
		msg: "trip done"
	})
})

module.exports = router;
