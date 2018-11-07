$('#submitBtn').on('click', function (e) {
    e.preventDefault();
    let name = $('#inputName').val();
    let phoneNumber = $('#inputPhoneNumber').val();
    let address = $('#inputAddress').val();
    let note = $('#inputNote').val();

    let data = {
        name: name,
        phoneNumber: phoneNumber,
        orderAddress: address,
        note: note
    }
    console.log(data);

    var instance = axios.create({
        baseURL: 'http://localhost:3000/requestReceiver',
        timeout: 15000,
    });

    instance.post('',data)
        .then(function (res) {
            if(res.status === 201){
                // Do something
                $('.alert-success').css('display','inline');
            } else {
                //Do somgthing
                $('.alert-danger').css('display','block');
            }

            console.log(res);
        }).catch(function(err) {
            console.log(err);
            $('.alert-danger').css('display','block');
        })
});