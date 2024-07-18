function Bomsave() {
    function showMissingFieldAlert(fieldName, message) {
        alert(message);
    }

    if ($('#bomno-save').val() === '') {
        showMissingFieldAlert('BOMNO', 'BOMNO가 누락되었습니다');
        return;
    }
    if ($('#customer-save').val() === '') {
        showMissingFieldAlert('고객사', '고객사가 누락되었습니다');
        return;
    }
    if ($('#modelname-save').val() === '') {
        showMissingFieldAlert('모델명', '모델명이 누락되었습니다');
        return;
    }
    if ($('#itemname-save').val() === '') {
        showMissingFieldAlert('제품명', '제품명이 누락되었습니다');
        return;
    }
    if ($('#pcs-save').val() === '') {
        showMissingFieldAlert('PCS', 'PCS가 누락되었습니다');
        return;
    }
    if ($('#cavity-save').val() === '') {
        showMissingFieldAlert('cavity', 'cavity가 누락되었습니다');
        return;
    }
    if ($('#itemcode-save').val() === '') {
        showMissingFieldAlert('itemcode', '고객코드가 누락되었습니다');
        return;
    }
    if ($('#workpart-save').val() === '') {
        showMissingFieldAlert('공정구분', '공정구분이 누락되었습니다');
        return;
    }
    if ($('#working-save').val() === '') {
        showMissingFieldAlert('작업차수', '작업차수가 누락되었습니다');
        return;
    }
    if ($('#direction-save').val() === '') {
        showMissingFieldAlert('타발방향', '타발방향이 누락되었습니다');
        return;
    }
    if ($('#type-save').val() === '') {
        showMissingFieldAlert('type', 'type이 누락되었습니다');
        return;
    }

    let tableBody = document.getElementById('bomtableBody');
    if (tableBody) {
        let rowCount = tableBody.children.length;

        for (let i = 0; i < rowCount; i++) {
            var materialname = $('#bomtableBody tr:eq(' + i + ') #materialname-input').val();
            var materialwidth = $('#bomtableBody tr:eq(' + i + ') #materialwidth-input').val();
            var onepidding = $('#bomtableBody tr:eq(' + i + ') #onepidding-input').val();
            var twopidding = $('#bomtableBody tr:eq(' + i + ') #twopidding-input').val();
            var char = $('#bomtableBody tr:eq(' + i + ') #char-input').val();
            if (materialname === '' || materialwidth === '' || onepidding === '' || twopidding === '' || char === '') {
                alert(`${i + 1}번째 필수 입력 항목이 누락되었습니다.`);
                return;
            }
        }
    }

    if (tableBody) {
        let rowCount = tableBody.children.length;

        for (let i = 0; i < rowCount; i++) {
            var materialWidthValue = $('#bomtableBody tr:eq(' + i + ') #materialwidth-input').val();
            var useWidthValue = $('#bomtableBody tr:eq(' + i + ') #usewidth-input').val();

            if (parseFloat(materialWidthValue) > parseFloat(useWidthValue)) {
                alert(`${i + 1}번째 원단폭이 유효폭보다 클 수 없습니다.`);
                return;
            }
        }
    }

    if ($('#bomid-edit').val()) {
        var insertdate = new Date().toISOString().slice(0, 10);
        var confirmResult = confirm('BOM정보(양산) 데이터를 수정하시겠습니까?');
        if (confirmResult) {
            $.ajax({
                type: 'POST',
                url: server + '/api/updateiteminformation',
                dataType: 'json',
                async: false,
                contentType: 'application/json',
                data: JSON.stringify({
                    "bomno": $('#bomno-save').val(),
                    "modelname": $('#modelname-save').val(),
                    "itemname": $('#itemname-save').val(),
                    "customer": $('#customer-save').val(),
                    "itemcode": $('#itemcode-save').val(),
                    "pcs": $('#pcs-save').val(),
                    "cavity": $('#cavity-save').val(),
                    "direction": $('#direction-save').val(),
                    "workpart": $('#workpart-save').val(),
                    "additionalnotes": $('#additionalNote').val(),
                    "working": $('#working-save').val(),
                    "type": $('#type-save').val(),
                }),
                success: function (result) {
                    // Handle success
                }
            });

            $.ajax({
                type: 'POST',
                url: server + '/api/updatebomstatus',
                dataType: 'json',
                async: false,
                contentType: 'application/json',
                data: JSON.stringify({
                    "bomid": $('#bomid-edit').val(),
                    "status": 'false'
                }),
                success: function (result) {
                    // Handle success
                }
            });

            $('[id^="num-input"]').each(function (index) {
                var cavity = $('#cavity-save').val();
                var bomno = $('#bomno-save').val();
                var model = $('#modelname-save').val();
                var itemname = $('#itemname-save').val();
                var materialname = $('[id^="materialname-input"]').eq(index).val();
                var char = $('[id^="char-input"]').eq(index).val();
                var main = $('[id^="main-edit"]').eq(index).prop('checked') ? '메인자재' : '';
                var etc = $('[id^="etc-input"]').eq(index).val();
                var materialwidth = parseFloat($('[id^="materialwidth-input"]').eq(index).val()) || 0;
                var onepid = ($('[id^="onepidding-input"]').eq(index).val())
                var twopid = ($('[id^="twopidding-input"]').eq(index).val())
                var soyo = ($('[id^="soyo-input"]').eq(index).val())
                var ta = ($('[id^="ta-input"]').eq(index).val())
                var allta = ($('[id^="allta-input"]').eq(index).val())
                var talength = ($('[id^="talength-input"]').eq(index).val())
                var loss = ($('[id^="loss-input"]').eq(index).val())
                var num = ($('[id^="num-input"]').eq(index).val());
                var cavity = ($('[id^="cavity-input"]').eq(index).val());
                var codenumber = ($('[id^="codenumber-input"]').eq(index).val());
                var useable = ($('[id^="useable-input"]').eq(index).val());
                var bomid = $('#bomid-save').val();
                var costloss = ($('[id^="costloss-input"]').eq(index).val());
                var chk1 = $('[id^="chk1-input"]').eq(index).prop('checked') ? true : false;
                var chk2 = $('[id^="chk2-input"]').eq(index).prop('checked') ? true : false;
                var chk3 = $('[id^="chk3-input"]').eq(index).prop('checked') ? true : false;

                $.ajax({
                    type: 'POST',
                    url: server + '/api/bommasssavebommanagement',
                    dataType: 'json',
                    contentType: 'application/json',
                    data: JSON.stringify({
                        "savedate": insertdate,
                        "bomno": bomno,
                        "model": model,
                        "itemname": itemname,
                        "materialname": materialname,
                        "status": 'true',
                        "char": char,
                        "main": main,
                        "etc": etc,
                        "materialwidth": materialwidth,
                        "onepid": onepid,
                        "twopid": twopid,
                        "ta": ta,
                        "allta": allta,
                        "talength": talength,
                        "loss": loss,
                        "cavity": cavity,
                        "codenumber": codenumber,
                        "useable": useable,
                        "num": num,
                        "costloss": costloss,
                        "bomid": bomid,
                        "chk1": chk1,
                        "chk2": chk2,
                        "chk3": chk3
                    }),
                    success: function (result) {
                        // Handle success
                    },
                    error: function (error) {
                        // Handle error
                    },
                });
            });

            $('#overlay').fadeOut();
            $('#modal').fadeOut();
            alert('데이터가 성공적으로 수정 되었습니다.');
            load();
        }
    } else {
        $.ajax({
            type: 'POST',
            url: server + '/api/bommasssavebommanagement',
            dataType: 'json',
            contentType: 'application/json',
            data: JSON.stringify({
                "bomno": $('#bomno-save').val(),
                "modelname": $('#modelname-save').val(),
                "itemname": $('#itemname-save').val(),
                "customer": $('#customer-save').val(),
                "itemcode": $('#itemcode-save').val(),
                "pcs": $('#pcs-save').val(),
                "cavity": $('#cavity-save').val(),
                "direction": $('#direction-save').val(),
                "workpart": $('#workpart-save').val(),
                "additionalnotes": $('#additionalNote').val(),
                "working": $('#working-save').val(),
                "type": $('#type-save').val(),
            }),
            success: function (result) {
                // Handle success
            },
            error: function (error) {
                // Handle error
            },
        });

        $('[id^="num-input"]').each(function (index) {
            var cavity = $('#cavity-save').val();
            var bomno = $('#bomno-save').val();
            var model = $('#modelname-save').val();
            var itemname = $('#itemname-save').val();
            var materialname = $('[id^="materialname-input"]').eq(index).val();
            var char = $('[id^="char-input"]').eq(index).val();
            var main = $('[id^="main-edit"]').eq(index).prop('checked') ? '메인자재' : '';
            var etc = $('[id^="etc-input"]').eq(index).val();
            var materialwidth = parseFloat($('[id^="materialwidth-input"]').eq(index).val()) || 0;
            var onepid = ($('[id^="onepidding-input"]').eq(index).val())
            var twopid = ($('[id^="twopidding-input"]').eq(index).val())
            var soyo = ($('[id^="soyo-input"]').eq(index).val())
            var ta = ($('[id^="ta-input"]').eq(index).val())
            var allta = ($('[id^="allta-input"]').eq(index).val())
            var talength = ($('[id^="talength-input"]').eq(index).val())
            var loss = ($('[id^="loss-input"]').eq(index).val())
            var num = ($('[id^="num-input"]').eq(index).val());
            var cavity = ($('[id^="cavity-input"]').eq(index).val());
            var codenumber = ($('[id^="codenumber-input"]').eq(index).val());
            var useable = ($('[id^="useable-input"]').eq(index).val());
            var bomid = $('#bomid-save').val();
            var costloss = ($('[id^="costloss-input"]').eq(index).val());
            var chk1 = $('[id^="chk1-input"]').eq(index).prop('checked') ? true : false;
            var chk2 = $('[id^="chk2-input"]').eq(index).prop('checked') ? true : false;
            var chk3 = $('[id^="chk3-input"]').eq(index).prop('checked') ? true : false;

            $.ajax({
                type: 'POST',
                url: server + '/api/bommasssavebommanagement',
                dataType: 'json',
                contentType: 'application/json',
                data: JSON.stringify({
                    "savedate": insertdate,
                    "bomno": bomno,
                    "model": model,
                    "itemname": itemname,
                    "materialname": materialname,
                    "status": 'true',
                    "char": char,
                    "main": main,
                    "etc": etc,
                    "materialwidth": materialwidth,
                    "onepid": onepid,
                    "twopid": twopid,
                    "ta": ta,
                    "allta": allta,
                    "talength": talength,
                    "loss": loss,
                    "cavity": cavity,
                    "codenumber": codenumber,
                    "useable": useable,
                    "num": num,
                    "costloss": costloss,
                    "bomid": bomid,
                    "chk1": chk1,
                    "chk2": chk2,
                    "chk3": chk3
                }),
                success: function (result) {
                    // Handle success
                },
                error: function (error) {
                    // Handle error
                },
            });
        });

        $('#overlay').fadeOut();
        $('#modal').fadeOut();
        alert('데이터가 성공적으로 저장 되었습니다.');
        load();
    }
}
