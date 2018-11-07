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

function initMap() {
    var location = {
        lat: -25.344,
        lng: 131.036
    }
    var map = new google.maps.Map(
        document.getElementById('map'), { zoom: 4, center: location });

    var marker = new google.maps.Marker({ position: location, map: map });
    console.log("Tao map");
}