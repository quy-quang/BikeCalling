var jwt = require('jsonwebtoken');
var rndToken = require('rand-token');
var moment = require('moment');


const SECRET = 'ABCDEF';
const AC_LIFETIME = 600; // seconds

var low = require('lowdb'),
    fileSync = require('lowdb/adapters/FileSync');

exports.generationAccessToken = userEntity => {
    var payload = {
        user: userEntity,
        info: 'more info'
    }

    var token = jwt.sign(payload, SECRET, {
        expiresIn: AC_LIFETIME
    });

    return token;
}

exports.verifyAccessToken = (req, res, next) => {
    var token = req.headers['x-access-token'];
    console.log(token);

    if (token) {
        jwt.verify(token, SECRET, (err, payload) => {
            if (err) {
                res.statusCode = 401;
                res.json({
                    msg: 'INVALID TOKEN',
                    error: err
                })
            } else {
                req.token_payload = payload;
                next();
            }
        });
    } else {
        res.statusCode = 403;
        res.json({
            msg: 'NO_TOKEN'
        })
    }
}

exports.generateRefreshToken = () => {
    const SIZE = 80;
    return rndToken.generate(SIZE);
}

exports.updateRefreshToken = (userId, rfToken) => {
    var refreshTokenAdapter = new fileSync('./refreshTokenDB.json');
    var refreshTokenDB = low(refreshTokenAdapter);
    var refreshTokenObject = refreshTokenDB.get('refreshTokenList').find({"driverId":userId}).value();
    console.log(refreshTokenDB.get('refreshTokenList').value())
    if (refreshTokenObject != undefined) {
        refreshTokenDB.get('refreshTokenList').find({"driverId":userId}).update("refreshToken",
        x => rfToken).write()
        console.log('vao refreshToken')
    }
        
    else{
        var obj  = {"driverId": userId, "refreshToken":rfToken}
        console.log(obj);
      refreshTokenDB.get('refreshTokenList').push(obj).write();
      console.log('ko co ')  
    } 
}