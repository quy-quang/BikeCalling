var express = require('express');
var cors = require('cors');
var bodyParser = require('body-parser');
var morgan = require('morgan');

var app = express();

var requestReceiverCtrl = require('./requestReceiver/requestReceiverController')
var locationIdentifierCtrl = require('./locationIdentifier/locationIdentifierController')
var requestManagmentCtrl = require('./requestManagment/requestManagmentController')
var driverCtrl = require('./driver/driverController')
var driverLoginCtrl = require('./driver/driverLoginController')

var verifyAccessToken = require('./driver/Repo/authRepo').verifyAccessToken;
	

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(cors());

app.use('/requestReceiver',requestReceiverCtrl);
app.use('/locationIdentifier',locationIdentifierCtrl);
app.use('/requestManagment',requestManagmentCtrl);
app.use('/driver', verifyAccessToken, driverCtrl);
app.use('/driverLogin', driverLoginCtrl);



var port = 3000;
app.listen(port, () => console.log(`App is running on port ${port}`));
