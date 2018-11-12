var express = require('express');

var md5 = require('crypto-js/md5')
var low = require('lowdb'),
	fileSync = require('lowdb/adapters/FileSync'),
	moment = require('moment');

var driverAdapter = new fileSync('./driverDB.json');
var driverDB = low(driverAdapter);
const 	OFFILINE = 0,
		STANDBY = 1,
		READY	= 2;

exports.add = (userEntity) => {
	var md5_pwd = md5(userEntity.Password);
	var time_request = moment().unix();

	userEntity["status"] = OFFILINE;
	userEntity["driverId"] = shortid.generate();
	userEntity["password"] = md5_pwd;
	userEntity["currentLocation"] = "";
	driverDB.get('driver').push(userEntity).write();

	res.statusCode = 201;
	res.json({
		msg: 'received request'
	})
}

exports.login = loginEntity => {
	// loginEntity = {
	// 	user: 'nndkhoa',
	// 	pwd: 'nndkhoa'
	// }

    var md5_pwd = md5(loginEntity.pwd);
	var row = driverDB.get('driver').find({"user": loginEntity.user, "pwd": md5_pwd}).value();

	return row;
}


