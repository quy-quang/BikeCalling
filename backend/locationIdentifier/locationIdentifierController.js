var low = require('lowdb'),
	fileSync = require('lowdb/adapters/FileSync'),
    moment = require('moment'),
	express = require('express');
const shortid = require('shortid');

var adapter = new fileSync('./clientDB.json');

var router = express.Router();

const LOCATING = 0,
    LOCATED = 1,
    READY = 2,
    MOVING = 3,
    DONE = 4;

router.get('/', (req, res) => {
    var db = low(adapter);
	var client = db.get('client');
	// console.log(JSON.stringify(client))
	res.statusCode = 200;
	res.json({
		client
	})
})

router.get('/lp', (req, res) => {
    var db = low(adapter);
    var ts = 0;
    if (req.query.ts) {
        ts = +req.query.ts;
    }

    var loop = 0;
    var fn = () => {
    //	console.log(db.get('client').value())
        var client = db.get('client').filter(c => c.iat >= ts);
        if(client.size() > 0){
            client = db.get('client');
        }
        var return_ts = moment().unix();
        if (client.size() > 0) {
        //	console.log('co gia tri cua client'+client.size())
            res.json({
                return_ts,
                client
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



router.post('/', (req, res) => {
    // {
    //  "clientId":...,
    //  "newAddress":...
    // }
    var newClient = req.body;
    var findObject = (db.get('client').find(obj => obj["clientId"] == newClient["clientId"])).update("newAddress",
        x => newClient["newAddress"]).write();

    res.statusCode = 200;
    res.json({findObject});
})

module.exports = router;