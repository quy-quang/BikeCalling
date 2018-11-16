dataTest = [
    {
        name: 'Cao Ba Dong',
        address: '145C Binh Thoi, phuong 11, quan 11, Tp Ho Chi Minh',
        note: 'Nothing',
        index: 1,
    },
    {
        name: 'Ta Viet Tien',
        address: '225 Nguyen Van Cu, quan 5, Tp Ho Chi Minh',
        note: 'nothing',
        index: 2
    }
]

ts = 0;
let currentMarkerLocation;
let currentLocationName = '';
let currentId = '';

window.onload = function () {
    loadCategories();
}

var loadCategories = function () {

    var instance = axios.create({
        baseURL: 'http://localhost:3000/locationIdentifier',
        timeout: 15000
    });

    instance.get('/lp?ts=' + ts)
        .then(function (res) {
            if (res.status === 200) {
                console.log(res);
                ts = res.data.return_ts;
                var source = document.getElementById('template').innerHTML;
                var template = Handlebars.compile(source);
                var html = template(res.data.client);
                document.getElementById('list').innerHTML =
                    '<thead class="thead-light">' +
                    '<tr>' +
                    '<th scope="col">ID</th>' +
                    '<th scope="col">Tên Khách Hàng</th>' +
                    '<th scope="col">Địa chỉ</th>' +
                    '<th scope="col">Số điện thoại</th>' +
                    '<th scope="col">Note</th>' +
                    '<th scope="col">Thao tác</th>' +
                    '</tr>' +
                    '</thead>';
                document.getElementById('list').innerHTML += html;
            }
        }).catch(function (err) {
            console.log(err);
        })
    .then(function () {
        loadCategories();
    })
}


$('#myModal').on('show.bs.modal', function (e) {

    //get data-id attribute of the clicked element
    var address = $(e.relatedTarget).attr('orderAddress');
    var Id = $(e.relatedTarget).attr('clientId');
    currentId = Id;
    console.log(address);
    getGeoCoding(address)
        .then(location => {
            initMap(location);
        })
        .catch(err => {
            console.log(err);
        });
    //console.log(latLng);
    //populate the textbox
    //   $(e.currentTarget).find('input[name="bookId"]').val(bookId);
});

function getGeoCoding(address) {
    return new Promise((resolve, reject) => {
        axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
            params: {
                address: address,
                key: 'AIzaSyDkyzsGsAGK174yBa7KG3o5zrJDp_TpPGs'
            }
        }).then(function (res) {
            if (res.status == 200) {
                return res.data.results[0].geometry.location;
            }
        }).then(value => resolve(value))
            .catch(err => reject(err));
    })
}

function initMap(location) {
    var map = new google.maps.Map(
        document.getElementById('map'), { zoom: 15, center: location });
    currentMarkerLocation = location;
    var marker = new google.maps.Marker(
        {
            position: location,
            map: map,
            draggable: true
        });

    google.maps.event.addListener(marker, "dragend", function () {
        var lat = marker.getPosition().lat();
        var lng = marker.getPosition().lng();
        currentMarkerLocation = {
            lat: lat,
            lng: lng
        }
        var geocoder = new google.maps.Geocoder;
        var infowindow = new google.maps.InfoWindow;
        geocoder.geocode({ 'location': currentMarkerLocation }, function (results, status) {
            if (status === 'OK') {
                if (results[0]) {
                    map.setZoom(15);
                    infowindow.setContent(results[0].formatted_address);
                    currentLocationName = results[0].formatted_address;
                    infowindow.open(map, marker);
                } else {
                    window.alert('No results found');
                    currentLocationName = '';
                }
            } else {
                window.alert('Geocoder failed due to: ' + status);
                currentLocationName = '';
            }
        });
    });
}

$('.save').on("click", function () {
    console.log(currentMarkerLocation);
    console.log(currentLocationName);
    console.log(currentId);

    var instance = axios.create({
        baseURL: 'http://localhost:3000/locationIdentifier',
        timeout: 15000,
    });

    instance.post('',
        {
            clientId: currentId,
            newAddress: currentLocationName,
            latlngAddress: currentMarkerLocation,
        })
        .then(function (res) {
            if (res.status === 200) {
                // Do something
                alert('OK')
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
