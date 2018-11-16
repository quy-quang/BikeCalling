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
		var rfToken = authRepo.generateRefreshToken();
		authRepo.updateRefreshToken(userEntity.driverId, rfToken)
		res.json({
			auth: true,
			user: userEntity,
			access_token : acToken,
			refresh_token : rfToken
		})
	}
	else{
		res.json({
			auth: false
		})
	}
})

router.post('/getAccessTokenFromRefreshToken', (req, res) => {
	var refreshTokenAdapter = new fileSync('./refreshTokenDB.json');
    var refreshTokenDB = low(refreshTokenAdapter);
	var refreshToken = req.body.refreshToken;
	// console.log(refreshToken);
	var driverId = refreshTokenDB.get('refreshTokenList').find({"refreshToken":refreshToken}).value().driverId;
	// console.log(driverId);

	if (driverId == undefined){
		res.statusCode = 200;
		res.json({
			msg: "uncorrect refreshToken"
		})
	}
	else{
		var userEntity = driverDB.get('driver').find({"driverId": driverId}).value();
		if (userEntity != undefined){
			res.statusCode = 200;
			var acToken = authRepo.generationAccessToken(userEntity);
			res.json({
				user: userEntity,
				access_token : acToken,
			})
		}
	}
	
})

module.exports = router;
