$(function () {

    //Lấy thông tin trong cookie về Refresh Token và Access Token
    let refreshToken = getCookie('refreshToken');
    let accessToken = getCookie('accessToken');
    console.log(refreshToken);
    if (refreshToken == '') {
        $('.login-page').css('display', 'block');
    } else {
        $('.home-page').css('display', 'block');
    }

    //Event nhấn button đăng nhập. Nếu kết quả trả về là ok thì chuyển qua trang người dùng. Nếu Err thì tiếp tục ở trang đăng nhập
    $('.login-btn').click(function (e) {
        e.preventDefault();
        let username = $('.username').val();
        let password = $('.password').val();

        var instance = axios.create({
            baseURL: 'http://localhost:3000/driverLogin',
            timeout: 15000
        });

        instance.post('/login', {
            username: username,
            password: password
        })
            .then(res => {
                console.log(res);
                if (res.data.auth == true) {
                    $('.login-page').css('display', 'none');
                    $('.home-page').css('display', 'block');
                    setCookie('accessToken', res.data.access_token, 10);
                    setCookie('refreshToken', res.data.refresh_token, 10800);
                    setCookie('driverId', res.data.user.driverId, 10800);
                    setCookie('driverName', res.data.user.name, 10800);
                    $('.driverName').html(getCookie('driverName'));

                } else {
                    alert('Dang nhap that bai');
                }
            })
            .catch(err => {
                console.log(err);
            })
    });

    $('.driverName').html(getCookie('driverName'));

    $('.change-status').change(function () {
        if (this.checked == true) {
            checkDriverAddress(toReady);
            $('.status-display').html('READY');
        }
        else {
            toStandby();
            $('.status-display').html('STAND BY');
        }
    })

    function toStandby() {
        var instance = axios.create({
            baseURL: 'http://localhost:3000/driver',
            timeout: 15000,
        });

        instance.post('/toStandby',
            {
                driverId: getCookie('driverId'),
            }, {
                headers: {
                    'x-access-token': getCookie('accessToken')
                }
            })
            .then(function (res) {
                console.log(res);
                if (res.status === 200) {
                    console.log('huy find')
                }
            })
            .catch(err => {
                getAccessToken(toStandby);
            })
    }

    var checkBTN = false;
    function toReady() {
        checkBTN = false;
        var instance = axios.create({
            baseURL: 'http://localhost:3000/driver',
            timeout: 15000,
        });

        instance.post('/toReady',
            {
                driverId: getCookie('driverId'),
            }, {
                headers: {
                    'x-access-token': getCookie('accessToken')
                }
            })
            .then(function (res) {
                console.log(res);
                if (res.status === 200) {
                    findTrip();
                }
            })
            .catch(err => {
                getAccessToken(toReady);
            })
    }

    
    //Xử lý sự kiện nhấn button Accept
    $('.btn-accept').click(function (e) {
        acceptTrip();
        function acceptTrip() {
            $('#modalYesNo').modal('hide');
            var instance = axios.create({
                baseURL: 'http://localhost:3000/driver',
                timeout: 15000,
            });
            instance.post('/tripCreating',
                {
                    driverId: getCookie('driverId'),
                    clientId: getCookie('clientId'),
                }, {
                    headers: {
                        'x-access-token': getCookie('accessToken')
                    }
                })
                .then(function (res) {
                    console.log(res);
                    if (res.status == 201) {
                        setCookie('tripId', res.data.tripId);
                        $('.btn-start').css('display', 'block');
                        alert('Tao chuyen di thanh cong');
                        // Ve ban do
                        var map1 = new google.maps.Map(
                            document.getElementById('directionMap'),
                            {
                                zoom: 15,
                                center: location
                            });
                        var directionsService = new google.maps.DirectionsService;
                        var directionsDisplay = new google.maps.DirectionsRenderer;
                        directionsDisplay.setMap(map1);

                        directionsService.route({
                            origin: getCookie('driverAddress'),
                            destination: getCookie('clientAddress'),
                            travelMode: 'DRIVING'
                        }, function (response, status) {
                            if (status === 'OK') {
                                directionsDisplay.setDirections(response);
                            } else {
                                window.alert('Directions request failed due to ' + status);
                            }
                        });
                    }
                })
                .catch(function (err) {
                    getAccessToken(acceptTrip)
                })
        }
    });
    // Sự kiện nhấn button Cancel
    $('.btn-reject').click(function (e) {
        checkBTN = true;
        rejectTrip();
        function rejectTrip() {
            $('#modalYesNo').modal('hide')
            var instance = axios.create({
                baseURL: 'http://localhost:3000/driver',
                timeout: 15000,
            });
            instance.post('/declineRequest',
                {
                    driverId: getCookie('driverId'),
                    clientId: getCookie('clientId'),
                }, {
                    headers: {
                        'x-access-token': getCookie('accessToken')
                    }
                })
                .then(function (res) {
                    console.log(res);
                    console.log('Tu choi chuyen di');
                    setTimeout(() => {
                        findTrip();
                    }, 10000);
                    
                })
                .catch(function (err) {
                    getAccessToken(rejectTrip);
                })
        }
    });

    $('.btn-start').click(function (e) {
        startTrip();
        function startTrip() {
            var instance = axios.create({
                baseURL: 'http://localhost:3000/driver',
                timeout: 15000,
            });
            instance.post('/tripStarting',
                {
                    tripId: getCookie('tripId')
                }, {
                    headers: {
                        'x-access-token': getCookie('accessToken')
                    }
                })
                .then(function (res) {
                    console.log(res);
                    if (res.status == 200) {
                        alert('Bat dau chuyen di');
                        $('.btn-start').css('display', 'none');
                        $('.btn-finish').css('display', 'block');
                    }
                })
                .catch(function (err) {
                    getAccessToken(startTrip);
                })
        }
    });

    $('.btn-finish').click(function (e) {
        finishTrip();
        function finishTrip() {
            var instance = axios.create({
                baseURL: 'http://localhost:3000/driver',
                timeout: 15000,
            });
            instance.post('/tripFinishing',
                {
                    tripId: getCookie('tripId')
                }, {
                    headers: {
                        'x-access-token': getCookie('accessToken')
                    }
                })
                .then(function (res) {
                    console.log(res);
                    if (res.status == 200) {
                        alert('Ket thuc chuyen di');
                        //   $('.btn-start').css('display','none');
                        $('.btn-finish').css('display', 'none');
                        $('.change-status').prop('checked', false);
                    }
                })
                .catch(function (err) {
                    getAccessToken(finishTrip);
                })
        }
    });

    // Function find trip
    function findTrip() {
        var instance = axios.create({
            baseURL: 'http://localhost:3000/driver',
            timeout: 15000,
        });

        instance.post('/findTrip',
            {
                driverId: getCookie('driverId'),
            }, {
                headers: {
                    'x-access-token': getCookie('accessToken')
                }
            })
            .then(function (res) {
                console.log(res);
                if (res.status === 200) {
                    setCookie('name', res.data.request.name, 10800);
                    setCookie('clientId', res.data.request.clientId, 10800);
                    setCookie('clientAddress', res.data.request.newAddress, 10800);
                    setCookie('phone', res.data.request.phoneNumber, 10800);
                    setCookie('lat', res.data.request.latlngAddress.lat, 10800);
                    setCookie('long', res.data.request.latlngAddress.lng, 10800);
                    $('.customer-name').html('  ' + getCookie('name'));
                    $('.customer-address').html('  ' + res.data.request.orderAddress);
                    $('#modalYesNo').modal('show');
                    progress(10, 10, $('#progressBar'));
                    setTimeout(function () {
                        console.log(checkBTN)
                        if(checkBTN == false){
                            toStandby();
                            $('.change-status').prop('checked', false);
                        } else {
                            checkBTN = false;
                        }
                        $('#modalYesNo').modal('hide')
                    }, 10000);
                }
                if (res.status === 204) {
                    findTrip()
                }
            })
            .catch(err => {
                getAccessToken(findTrip);
            })
    }
})
function checkDriverAddress(callback) {
    if (getCookie('driverAddress') == '') {
        $('#modalUpdate').modal('show');
        $('.change-status').prop('checked', false);
    }

    if (getCookie('driverAddress') != '') {
        callback();
    }
}


var currentMarkerLocation;
var currentLocationName;

// Tạo 2 map. map ở home và map trong modal thay đổi vị trí hiện tại 
function initMap() {
    var location = {
        "lat": 33.3632256,
        "lng": -117.0874871
    }
    var infowindow = new google.maps.InfoWindow;
    var geocoder = new google.maps.Geocoder;
    //Tạo map 1
    var map1 = new google.maps.Map(
        document.getElementById('directionMap'),
        {
            zoom: 15,
            center: location
        });
    // Tạo map 2
    var map2 = new google.maps.Map(
        document.getElementById('map'),
        {
            zoom: 17,
            center: location
        });

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            var pos = {
                'lat': position.coords.latitude,
                'lng': position.coords.longitude
            };
            currentMarkerLocation = {
                'lat': pos.lat,
                'lng': pos.lng
            }
            map2.setCenter(pos);
            map1.setCenter(pos);
            // tạo marker tại vị trí hiện tại
            var marker = new google.maps.Marker(
                {
                    position: pos,
                    map: map2,
                    draggable: true
                });
            // Event drag  marker
            var marker1 = new google.maps.Marker(
                {
                    position: pos,
                    map: map1,
                });
            // Tạo thông tin địa điểm hiện tại
            geocoder.geocode({ 'location': pos }, function (results, status) {
                if (status === 'OK') {
                    if (results[0]) {
                        infowindow.close();
                        infowindow.setContent(results[0].formatted_address);
                        currentLocationName = results[0].formatted_address;
                        infowindow.open(map2, marker);
                    } else {
                        window.alert('No results found');
                        currentLocationName = '';
                    }
                } else {
                    window.alert('Geocoder failed due to: ' + status);
                    currentLocationName = '';
                }
            });
            // Thông tin địa điểm sau khi drag marker
            google.maps.event.addListener(marker, "dragend", function () {
                var lat = marker.getPosition().lat();
                var lng = marker.getPosition().lng();
                currentMarkerLocation = {
                    'lat': lat,
                    'lng': lng
                }
                // Tính khoản cách từ vị trí hiện tại tới vi trí drag.
                if (distanceHaversine(pos, currentMarkerLocation) <= 0.1) {
                    geocoder.geocode({ 'location': currentMarkerLocation }, function (results, status) {
                        if (status === 'OK') {
                            if (results[0]) {
                                infowindow.close();
                                infowindow.setContent(results[0].formatted_address);
                                currentLocationName = results[0].formatted_address;
                                infowindow.open(map2, marker);
                            } else {
                                window.alert('No results found');
                                currentLocationName = '';
                            }
                        } else {
                            window.alert('Geocoder failed due to: ' + status);
                            currentLocationName = '';
                        }
                    });
                } else {
                    alert('Vị trí lựa chọn quá xa vị trí hiện tại');
                    marker.setPosition(pos);
                }
            });
        }, function () {
            handleLocationError(true, infoWindow, map2.getCenter());
        });
    } else {
        // Browser doesn't support Geolocation
        handleLocationError(false, infoWindow, map2.getCenter());
    }
}

$('.save').on("click", function () {
    console.log(currentMarkerLocation);
    console.log(currentLocationName);
    setCookie('driverAddress', currentLocationName);
    UpdateCurrentLocation();
    function UpdateCurrentLocation() {
        var instance = axios.create({
            baseURL: 'http://localhost:3000/driver',
            timeout: 15000,
        });

        instance.post('/currentLocation',
            {
                driverId: getCookie('driverId'),
                latlngAddress: currentMarkerLocation,
                address: currentLocationName
            }, {
                headers: {
                    'x-access-token': getCookie('accessToken')
                }
            })
            .then(function (res) {
                if (res.status === 204) {
                    // Do something
                    alert('Cập nhật thành công')
                }
                console.log(res);
            }).catch(function (err) {
                // console.log(err);
                getAccessToken(UpdateCurrentLocation);
            })
    }
});

function getAccessToken(callback) {
    var instance = axios.create({
        baseURL: 'http://localhost:3000/driverLogin',
        timeout: 15000
    });

    instance.post('/getAccessTokenFromRefreshToken', {
        refreshToken: getCookie('refreshToken')
    })
        .then(res => {
            console.log(res);
            if (res.status = 200) {
                setCookie('accessToken', res.data.access_token, 10);
                callback();
            }
        })
        .catch(err => {
            alert('TOKEN ERROR')
        })
}

// Ham lấy dữ liệu từ trong cookie
function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

Number.prototype.toRad = function () {
    return this * Math.PI / 180;
}
// Hàm tính khoảng cách Haversine giữa 2 tọa độ trên map
function distanceHaversine(point1, point2) {
    x2 = point2.lng - point1.lng;
    x1 = point2.lat - point1.lat;
    R = 6371;
    dLongitude = x2.toRad();
    dLatitude = x1.toRad();
    var a = Math.sin(dLatitude / 2) * Math.sin(dLatitude / 2) +
        Math.cos(point1.lat.toRad()) * Math.cos(point2.lat.toRad()) *
        Math.sin(dLongitude / 2) * Math.sin(dLongitude / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return d;
}


function setCookie(cname, cvalue, exseconds) {
    var d = new Date();
    d.setTime(d.getTime() + (exseconds * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function progress(timeleft, timetotal, $element) {
    //var progressBarWidth = timeleft * $element.width() / timetotal;
    // $element.find('div').animate({ width: progressBarWidth }, 500).html(Math.floor(timeleft/60) + ":"+ timeleft%60);
    $element.attr('aria-valuenow', timeleft * 10);
    $element.css('width', timeleft * 10 + '%');
    $element.html(timeleft + 's');
    if (timeleft >= 0) {
        setTimeout(function () {
            progress(timeleft - 1, timetotal, $element);
        }, 1000);
    }
};
