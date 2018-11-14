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
	var clientId = req.query.clientId;
	console.log(clientId);
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

router.get('/lp', (req, res) => {
    var ts = 0;
    if (req.query.ts) {
        ts = +req.query.ts;
    }

    var loop = 0;
    var fn = () => {
        var adapter = new fileSync('./tripDB.json');
        var db = low(adapter);
        var trip = db.get('trip').filter(c => c.iat >= ts);
        var return_ts = moment().unix();
        if (trip.size() > 0) {
            res.json({
                return_ts,
                trip
            });
        } else {
            loop++;
            console.log(`loop: ${loop}`);
            if (loop < 4) {
                setTimeout(fn, 2500);
            } else {
                res.statusCode = 204;
                res.end('no data');
            }
        }
    }

    fn();
})

module.exports = router;