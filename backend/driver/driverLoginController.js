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

const 	OFFILINE = 0,
		STANDBY = 1,
		READY	= 2;

//add vao database
router.post('/', (req, res) => {
	var userEntity = req.body;
	console.log(userEntity.password);
	console.log(typeof userEntity.password);

	var md5_pwd = md5(userEntity.password);
	console.log(JSON.stringify(md5_pwd))

	userEntity["status"] = OFFILINE;
	userEntity["driverId"] = shortid.generate();
	userEntity["password"] = md5_pwd;
	userEntity["currentLocation"] = "";
	driverDB.get('driver').push(userEntity).write();

	res.statusCode = 201;
	res.json({
		msg: 'received request'
	})
})

//dang nhap
router.post('/login', (req, res) => {
	var loginEntity = req.body;
	var md5_pwd = md5(loginEntity.password);
	console.log(md5_pwd)
	var userEntity = driverDB.get('driver').find({"username": loginEntity.username, "password": md5_pwd}).value();
	if (userEntity != undefined){
		var acToken = authRepo.generationAccessToken(userEntity);
		res.json({
			auth: true,
			user: userEntity,
			access_token : acToken
		})
	}
	else{
		res.json({
			auth: false
		})
	}
})

module.exports = router;
