function planinsert() {
    var plandate = $('#plandate-save').val();
    var bomno = $('#bomno-save').val();
    var modelname = $('#modelname-save').val();
    var itemname = $('#itemname-save').val();
    var lotno = $('#lotno-save').val();
    var pono = $('#pono-save').val();
    var equipmentname = $('#equipment-select').val();

    $.ajax({
        type: 'POST',
        url: server + '/api/searchequipmentcodenumber',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify({
            "equipmentname": equipmentname
        }),
        success: function (data) {
            $.ajax({
                type: 'POST',
                url: server + '/api/planinsert',
                dataType: 'json',
                contentType: 'application/json',
                data: JSON.stringify({
                    "plandate": plandate,
                    "bomno": bomno,
                    "modelname": modelname,
                    "itemname": itemname,
                    "lotno": lotno,
                    "pono": pono,
                    "equipmentname": data[0].codenumber

                }),
                success: function (result) {
                },
                error: function (error) {
                }
            });
        },
        error: function (error) {
        }
    });

    $('#popupOverlay').fadeOut();

    load()
    planload()

}
