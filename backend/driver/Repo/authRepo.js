var jwt = require('jsonwebtoken');
var rndToken = require('rand-token');
var moment = require('moment');


const SECRET = 'ABCDEF';
const AC_LIFETIME = 600; // seconds

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
