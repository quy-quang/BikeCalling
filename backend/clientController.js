var low = require('lowdb'),
	fileSync = require('lowdb/adapters/FileSync'),
	express = require('express'),
	moment = require('moment');

var adapter = new fileSync('./db.json');
var db = low(adapter);

var router = express.Router();

var NodeGeocoder = require('node-geocoder');

const CHUA_DUOC_DINH_VI = 0,
		DA_DINH_VI_XONG = 1,
		DA_CO_XE_NHAN = 2,
		DANG_DI_CHUYEN = 3,
		DA_HOAN_THANH = 4;

 
var options = {
  provider: 'google',
 
  // Optional depending on the providers
  httpAdapter: 'https', // Default
  // apiKey: 'AIzaSyCXHpG4JVCiVc3DAkaWFxZtsv7oUHt_0L4', // for Mapquest, OpenCage, Google Premier
  // apiKey: 'AIzaSyAvHrxPICeRX4UAEayfpK-ZvHL_knS0GkQ', // for Mapquest, OpenCage, Google Premier

  // apiKey: 'AIzaSyB7gN3ZznA0wmf91BJd57BZ5kpmL-BIIQg', // for Mapquest, OpenCage, Google Premier
  // AIzaSyDisnfgvymOh3jXH-e_G-lMQPcm-tPjWi8
  apiKey: 'AIzaSyDisnfgvymOh3jXH-e_G-lMQPcm-tPjWi8', // for Mapquest, OpenCage, Google Premier

  formatter: null         // 'gpx', 'string', ...
};
 
var geocoder = NodeGeocoder(options);

const googleMapsClient = require('@google/maps').createClient({
  // key: 'AIzaSyAvHrxPICeRX4UAEayfpK-ZvHL_knS0GkQ',
  key: 'AIzaSyCXHpG4JVCiVc3DAkaWFxZtsv7oUHt_0L4', // for Mapquest, OpenCage, Google Premier
  // apiKey: 'AIzaSyCXHpG4JVCiVc3DAkaWFxZtsv7oUHt_0L4', // for Mapquest, OpenCage, Google Premier
  
  Promise: Promise
});



router.post('/', (req, res) => {
	var client = req.body;
	var time_request = moment().unix();
	client["timeRequest"]= time_request;
	client["status"]= CHUA_DUOC_DINH_VI;

	db.get('client').push(client).write();

	res.statusCode = 201;
	res.json({
		msg: 'received request'
	})
})

router.get('/', (req, res) => {
	var client = db.get('client');
	// console.log(JSON.stringify(client))
	res.json({
		client
	})
})

router.get('/geocoding', (req, res) => {
	// googleMapsClient.geocode({address: 'Dai hoc khoa hoc tu nhien (hcmus)'})
	//   .asPromise()
	//   .then((response) => {
	//   	var latlong = response//.json.result.geometry.location;
	//   	console.log(latlong)
	//   	res.json({
	//   		latlong
	//   	})
	//   })
	//   .catch((err) => {
	//     console.log(err);
	//   });
	var nameOfLocation = req.query.location;
	geocoder.geocode(nameOfLocation)
    .then((response) => {
    	console.log(response)
	  	res.json({
	  		lat: response[0].latitude,
	  		lon: response[0].longitude
	  	})
	  })
	
  .catch(function(err) {
    console.log(err);
  });
})

router.get('/reverse_geocoding', (req, res) => {
	// {
	// 	lat,
	// 	lon
	// }
	var latlon = {
		lat:req.query.lat,
		lon:req.query.lon
	}
	geocoder.reverse(latlon)
	.then((response) => {
		console.log(response)
		res.json({
			location: response[0].formattedAddress
		})
	})
})


module.exports = router;