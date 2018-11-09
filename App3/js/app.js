dataTest = [
    {
        name: 'Cao Ba Dong',
        address: '145C Binh Thoi, phuong 11, quan 11, Tp Ho Chi Minh',
        note: 'Nothing',
        status: 'LOCATING',
        isTrip: false,
        index: 1,
    },
    {
        name: 'Ta Viet Tien',
        address: '225 Nguyen Van Cu, quan 5, Tp Ho Chi Minh',
        note: 'nothing',
        status: 'READY',
        isTrip: true,
        index: 2
    }
]

ts = 0;
let currentMarkerLocation;
let currentLocationName = '';

window.onload = function () {
    loadCategories();
}

var loadCategories = function () {

    var instance = axios.create({
        baseURL: 'http://localhost:3000/requestReceiver',
        timeout: 15000
    });

    // instance.get('lp?ts=' + ts) 
    //     .then(function (res) {
    //         if (res.status === 200) {
    //             ts = res.data.return_ts;
    //             var source = document.getElementById('template').innerHTML;
    //             var template = Handlebars.compile(source);
    //             var html = template(res.data.categories);
    //             document.getElementById('list').innerHTML += html;
    //         }
    //     }).catch(function (err) {
    //         console.log(err);
    //     }).then(function () {
    //         loadCategories();
    //     })

    var source = document.getElementById('template').innerHTML;
    var template = Handlebars.compile(source);
    var html = template(dataTest);
    document.getElementById('list').innerHTML += html;
}


$('#myModal').on('show.bs.modal', function (e) {

    //get data-id attribute of the clicked element
    var index = $(e.relatedTarget).attr('name');
    var instance = axios.create({
        baseURL: 'http://localhost:3000/locationIdentifier',
        timeout: 15000
    })
    instance.post('', {
        id: index
    }).then(res => {
        if (res.status = 201) {
        }
    }).catch(err => {
        console.log(err)
    })
    console.log(index);
    var trip = {
        customerAddress: "225 Nguyễn Văn Cừ, quận 5, Tp Hồ Chí Minh",
        driverAddress: "145C Bình Thới, quận 11, Tp Hồ Chí Minh",
        driverName: "Nguyễn Phước Quý Quang"
    }
    initMap(trip.driverAddress, trip.customerAddress);
    // getDirection(trip.driverAddress, trip.customerAddress)
    //     .then(location => {
    //         initMap(location);
    //     })
    //     .catch(err => {
    //         console.log(err);
    //     });


    //console.log(latLng);
    //populate the textbox
    //   $(e.currentTarget).find('input[name="bookId"]').val(bookId);
});

// function getDirection(origin, destination) {
//     return new Promise((resolve, reject) => {
//         axios.get('https://maps.googleapis.com/maps/api/directions/json', {
//             params: {
//                 origin: origin,
//                 destination: destination,
//                 key: 'AIzaSyDkyzsGsAGK174yBa7KG3o5zrJDp_TpPGs'
//             }
//         }).then(function (res) {
//             console.log(res);
//             if (res.status == 200) {
//                 console.log(res);
//                 return res.data.results[0].geometry.location;
//             }
//         }).then(value => resolve(value))
//             .catch(err => reject(err));
//     })
// }

function initMap(origin, destination) {
    var directionsService = new google.maps.DirectionsService;
    var directionsDisplay = new google.maps.DirectionsRenderer;
    var location = {
        "lat": 33.3632256,
        "lng": -117.0874871
    }
    // console.log(origin);
    // if (origin === undefined){
    //     origin ='';
    // }
    // if (destination === undefined){
    //     destination ='';
    // }
    var map = new google.maps.Map(
        document.getElementById('map'),
        {
            zoom: 15,
            center: location
        });
    // currentMarkerLocation = location;
    directionsDisplay.setMap(map);

    directionsService.route({
        origin: origin,
        destination: destination,
        travelMode: 'DRIVING'
    }, function (response, status) {
        if (status === 'OK') {
            directionsDisplay.setDirections(response);
        } else {
            window.alert('Directions request failed due to ' + status);
        }
    });
    // google.maps.event.addListener(marker, "dragend", function () {
    //     var lat = marker.getPosition().lat();
    //     var lng = marker.getPosition().lng();
    //     currentMarkerLocation = {
    //         lat: lat,
    //         lng: lng
    //     }
    //     var geocoder = new google.maps.Geocoder;
    //     var infowindow = new google.maps.InfoWindow;
    //     geocoder.geocode({ 'location': currentMarkerLocation }, function (results, status) {
    //         if (status === 'OK') {
    //             if (results[0]) {
    //                 map.setZoom(15);
    //                 infowindow.setContent(results[0].formatted_address);
    //                 currentLocationName = results[0].formatted_address;
    //                 infowindow.open(map, marker);
    //             } else {
    //                 window.alert('No results found');
    //                 currentLocationName = '';
    //             }
    //         } else {
    //             window.alert('Geocoder failed due to: ' + status);
    //             currentLocationName = '';
    //         }
    //     });
    // });
}

$('.save').on("click", function () {
    console.log(currentMarkerLocation);
    console.log(currentLocationName);

    var instance = axios.create({
        baseURL: 'http://localhost:3000/locationIdentifier',
        timeout: 15000,
    });

    instance.post('', { newAddress: currentLocationName })
        .then(function (res) {
            if (res.status === 201) {
                // Do something
                $('.alert-success').css('display', 'inline');
            } else {
                //Do somgthing
                $('.alert-danger').css('display', 'block');
            }

            console.log(res);
        }).catch(function (err) {
            console.log(err);
            $('.alert-danger').css('display', 'block');
        })
});
