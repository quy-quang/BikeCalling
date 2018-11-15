$(function () {

    //Lấy thông tin trong cookie về Refresh Token và Access Token
    let refreshToken = getCookie('refreshToken');
    let accessToken = getCookie('accessToken');
    console.log(refreshToken);
    if (refreshToken == '') {
        $('.login-page').css('display', 'block');
    }

    //Event nhấn button đăng nhập. Nếu kết quả trả về là ok thì chuyển qua trang người dùng. Nếu Err thì tiếp tục ở trang đăng nhập
    $('.login-btn').click(function (e) {
        e.preventDefault();
        let username = $('.username').val();
        let password = $('.password').val();

        var instance = axios.create({
            baseURL: 'http://localhost:3000/????',
            timeout: 15000
        });

        instance.post('/login', {
            username: username,
            password: password
        })
            .then(res => {

            })
            .catch(err => {

            })
        let data = {
            driverName: 'Cao Ba Dong',
            driverId: 'ABCXYZ'
        }
        $('.driverName').html(data.driverName);
        $('.login-page').css('display', 'none');
        $('.home-page').css('display', 'block');

    });

    // Event thay đổi button chuyển đổi trạng thái
    $('.btn-toggle').click(function () {
        //Dao active
        //Lay trạng thai truoc
        if ($(this).find('.active').html() == 'Nghỉ ngơi') {
            // gui request tìm kiếm và đổi trạng thái

            //request trả về Ok thi` hiện lên Modal Yes or No
            // Yes thi` send request accept chuyến đi
            // No thì send request từ chối chuyến đi
            $('#modalYesNo').modal('show')
        } else {
            //gui request đổi trạng thái và cancel tìm kiếm
        }

        $(this).find('.btn').toggleClass('active');
        if ($(this).find('.btn-danger').length > 0) {
            $(this).find('.btn').toggleClass('btn-danger');
        }
        if ($(this).find('.btn-success').length > 0) {
            $(this).find('.btn').toggleClass('btn-success');
        }
    });
})
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
    // console.log(driverId);

    var instance = axios.create({
        baseURL: 'http://localhost:3000/????',
        timeout: 15000,
    });

    instance.post('',
        {
            driverId: '??????/',
            newAddress: currentLocationName
        })
        .then(function (res) {
            if (res.status === 200) {
                // Do something
                alert('Cập nhật thành công')
            } else {
                //Do somgthing
                alert('Cập nhật thất bại')
            }

            console.log(res);
        }).catch(function (err) {
            console.log(err);
            alert('Cập nhật thất bại')
        })
});

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




