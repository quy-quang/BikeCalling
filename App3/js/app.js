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
        baseURL: 'http://localhost:3000/locationIdentifier',
        timeout: 15000
    });

    instance.get('lp?ts=' + ts)
        .then(function (res) {
            if (res.status === 200) {
                console.log(res);
                ts = res.data.return_ts;
                var source = document.getElementById('template').innerHTML;
                var template = Handlebars.compile(source);
                var currentData = res.data.client;
                for (var i = 0; i < currentData.length; i++) {
                    if (currentData[i].status == 0 || currentData[i].status == 1) {
                        currentData[i].isTrip = false;
                    } else {
                        currentData[i].isTrip = true;
                    }
                    if (currentData[i].status == 0) currentData[i].status = "Đang định vị";
                    if (currentData[i].status == 1) currentData[i].status = "Đã định vị";
                    if (currentData[i].status == 2) currentData[i].status = "Đã sẵn sàng";
                    if (currentData[i].status == 3) currentData[i].status = "Đang chạy";
                    if (currentData[i].status == 4) currentData[i].status = "Hoàn thành";
                }
                console.log(currentData);

                var html = template(res.data.client);
                document.getElementById('list').innerHTML =
                    '<thead class="thead-light">' +
                    '<tr>' +
                    '<th scope="col">ID</th>' +
                    '<th scope="col">Tên Khách Hàng</th>' +
                    '<th scope="col">Địa chỉ</th>' +
                    '<th scope="col">Trạng thái</th>' +
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
    var clientId = $(e.relatedTarget).attr('clientId');
    var instance = axios.create({
        baseURL: 'http://localhost:3000/requestManagment',
        timeout: 15000
    })
    instance.get('/trip', {
        params: {
            clientId: clientId
        }
    }).then(res => {
        console.log(res);
        if (res.status = 201) {
            var driverAddress = res.data.mapAndDriverInfo.driverAddress;
            var customerAddress = res.data.mapAndDriverInfo.clientAddress;
            $('.driverName').html(res.data.mapAndDriverInfo.nameOfDriver);
            $(selector).html(htmlString);
            initMap(driverAddress, customerAddress);

        }
    }).catch(err => {
        console.log(err)
    })
});

function initMap(origin, destination) {
    var directionsService = new google.maps.DirectionsService;
    var directionsDisplay = new google.maps.DirectionsRenderer;
    var location = {
        "lat": 33.3632256,
        "lng": -117.0874871
    }
    var map = new google.maps.Map(
        document.getElementById('map'),
        {
            zoom: 15,
            center: location
        });
    // currentMarkerLocation = location;
    map.setZoom(15);
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
}