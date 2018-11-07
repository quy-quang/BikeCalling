$('#submitBtn').on('click', function (e) {
    e.preventDefault();
    let name = $('#inputName').val();
    let phoneNumber = $('#inputPhoneNumber').val();
    let address = $('#inputAddress').val();
    let note = $('#inputNote').val();

    let data = {
        name: name,
        phoneNumber: phoneNumber,
        address: address,
        note: note
    }
    console.log(data);

    var instance = axios.create({
        baseURL: 'http://localhost:3000/requestReceiver',
        timeout: 15000,
        data: data,
    });

    instance.post('')
        .then(function (res) {
            if(res.data !== null){
                // Do something
            } else {
                //Do somgthing
            }
            $('.alert-success').css('display','inline');
        }).catch(function(err) {
            console.log(err);
            $('.alert-danger').css('display','block');
        })
});