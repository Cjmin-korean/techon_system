

$(document).ready(function () {
    let loadData = [];
    let planSearchData = [];
    let loadTdData = [];
    let loadTdData2 = [];

    let oldPlanSearchData = [];

    var flattenedData = [];
    if (window.location.hostname == 'localhost') {
        server = 'http://localhost:8080';
    } else {
        server = 'http://techonmes.co.kr';
    }
    $('#popupCloseBtn-save-close').click(function () {
        $('#popupOverlay').fadeOut();
    });
    load()

    // setTimeout(plansearch(), 500);
    var today = new Date();

    // 년, 월, 일을 추출
    var year = today.getFullYear();
    var month = (today.getMonth() + 1).toString().padStart(2, '0'); // 월은 0부터 시작하므로 1을 더하고 2자리로 표시
    var day = today.getDate().toString().padStart(2, '0'); // 일도 2자리로 표시

    // "plandate" 엘리먼트를 가져와서 내용을 업데이트
    var plandateElement = document.getElementById("plandate");
    if (plandateElement) {
        plandateElement.textContent = year + "-" + month + "-" + day;
    }


    const selectElement1 = document.getElementById("equipment-select");
    if (selectElement1) {
        $.ajax({
            type: 'POST',
            url: server + '/api/equipmentname',
            dataType: 'json',
            contentType: 'application/json',
            success: function (result) {
                for (let i = 0; i < result.length; i++) {
                    const option = document.createElement("option");
                    option.text = result[i].equipmentname;
                    option.value = result[i].equipmentname;
                    selectElement1.add(option);
                }
            },
        });
    }
    planload()

    $(document).on("click", ".savebutton", function () {
        var str = "";
        var tdArr = new Array();// 배열 선언            
        var checkBtn = $(this);

        var tr = checkBtn.parent().parent();
        var td = tr.children();

        var plandate = $('#plandate').text()
        var bomno = td.eq(0).text();
        var modelname = td.eq(2).text();
        var itemname = td.eq(3).text();
        var lotno = td.eq(4).text();
        var quantity = td.eq(5).text();


        $('#plandate-save').val(plandate)
        $('#bomno-save').val(bomno)
        $('#modelname-save').val(modelname)
        $('#itemname-save').val(itemname)
        $('#lotno-save').val(lotno)
        $('#quantity-save').val(quantity)
        $('#popupOverlay').fadeIn();
        updateDaysLeftLabel();

    });




    function planload() {
        $('#Datatbody').empty();
        $.ajax({
            type: 'POST',
            url: server + '/api/equipmentname',
            dataType: 'json',
            success: function (data) {
                var tableBody = $('#Datatbody');
                if (data.length === 0) {
                } else {
                    loadTdData = {};

                    for (var i = 0; i < data.length; i++) {
                        loadTdData[data[i].codenumber] = {};
                        var numRows = 8;
                        for (var j = 0; j < numRows; j++) {
                            loadTdData[data[i].codenumber][j] = {
                                num: '',
                                bomno: '',
                                customer: '',
                                modelname: '',
                                itemname: '',
                                part: '',
                                linepart: '',
                                lotno: '',
                                pono: '',
                                accumulate: '',
                                remaining: '',
                                planone: '',
                                siljokone: '',
                                plantwo: '',
                                siljoktwo: '',
                            }

                            tableBody.append(
                                '<tr draggable="true"  >' +
                                (j === 0 ? '<td style="text-align:center; width:8%; font-size: 20px; border: 1px solid rgb(231, 228, 228); background-color:white; font-weight:bold;" rowspan="' + numRows + '" id="' + data[i].codenumber + '">' + data[i].equipmentname + '<br>' + data[i].part + '<br>' + data[i].size + '</td>' : '') +
                                '<td  ondblclick="openmodal(this)" style="width: auto; font-size: 15px; border: 1px solid rgb(231, 228, 228); border-bottom-color: ' + (j >= 7 ? '#3d3838' : 'rgb(231, 228, 228)') + ';" id="' + j + 'bomno' + data[i].codenumber + '"></td>' +
                                '<td  ondblclick="openmodal(this)" style="width: auto; font-size: 15px; border: 1px solid rgb(231, 228, 228); border-bottom-color: ' + (j >= 7 ? '#3d3838' : 'rgb(231, 228, 228)') + ';" id="' + j + 'customer' + data[i].codenumber + '"></td>' +
                                '<td  ondblclick="openmodal(this)" style="width: auto; font-size: 15px; border: 1px solid rgb(231, 228, 228); border-bottom-color: ' + (j >= 7 ? '#3d3838' : 'rgb(231, 228, 228)') + ';" id="' + j + 'modelname' + data[i].codenumber + '" ></td > ' +
                                '<td  ondblclick="openmodal(this)" style="width: auto; font-size: 15px; border: 1px solid rgb(231, 228, 228); border-bottom-color: ' + (j >= 7 ? '#3d3838' : 'rgb(231, 228, 228)') + ';" id="' + j + 'itemname' + data[i].codenumber + '" ></td > ' +
                                '<td  ondblclick="openmodal(this)" style="width: auto; font-size: 15px; border: 1px solid rgb(231, 228, 228); border-bottom-color: ' + (j >= 7 ? '#3d3838' : 'rgb(231, 228, 228)') + ';" id="' + j + 'part' + data[i].codenumber + '" ></td > ' +
                                '<td  ondblclick="openmodal(this)" style="width: auto; font-size: 15px; border: 1px solid rgb(231, 228, 228); border-bottom-color: ' + (j >= 7 ? '#3d3838' : 'rgb(231, 228, 228)') + ';" id="' + j + 'linepart' + data[i].codenumber + '" ></td > ' +
                                '<td  ondblclick="openmodal(this)" style="width: auto; font-size: 15px; border: 1px solid rgb(231, 228, 228); border-bottom-color: ' + (j >= 7 ? '#3d3838' : 'rgb(231, 228, 228)') + ';" id="' + j + 'lotno' + data[i].codenumber + '" ></td > ' +
                                '<td  ondblclick="openmodal(this)" style="width: auto; font-size: 15px; border: 1px solid rgb(231, 228, 228); border-bottom-color: ' + (j >= 7 ? '#3d3838' : 'rgb(231, 228, 228)') + ';" id="' + j + 'pono' + data[i].codenumber + '" ></td > ' +
                                '<td  ondblclick="openmodal(this)" style="width: auto; font-size: 15px; border: 1px solid rgb(231, 228, 228); border-bottom-color: ' + (j >= 7 ? '#3d3838' : 'rgb(231, 228, 228)') + ';" id="' + j + 'accumulate' + data[i].codenumber + '" ></td > ' +
                                '<td  ondblclick="openmodal(this)" style="width: auto; font-size: 15px; border: 1px solid rgb(231, 228, 228); border-bottom-color: ' + (j >= 7 ? '#3d3838' : 'rgb(231, 228, 228)') + ';" id="' + j + 'remaining' + data[i].codenumber + '" ></td > ' +
                                '<td  ondblclick="openmodal(this)" style="width: auto; font-size: 15px; border: 1px solid rgb(231, 228, 228); border-bottom-color: ' + (j >= 7 ? '#3d3838' : 'rgb(231, 228, 228)') + ';" id="' + j + 'planone' + data[i].codenumber + '" ></td > ' +
                                '<td  ondblclick="openmodal(this)" style="width: auto; font-size: 15px; border: 1px solid rgb(231, 228, 228); border-bottom-color: ' + (j >= 7 ? '#3d3838' : 'rgb(231, 228, 228)') + ';" id="' + j + 'siljokone' + data[i].codenumber + '" ></td > ' +
                                '<td  ondblclick="openmodal(this)" style="width: auto; font-size: 15px; border: 1px solid rgb(231, 228, 228); border-bottom-color: ' + (j >= 7 ? '#3d3838' : 'rgb(231, 228, 228)') + ';" id="' + j + 'plantwo' + data[i].codenumber + '" ></td > ' +
                                '<td  ondblclick="openmodal(this)" style="width: auto; font-size: 15px; border: 1px solid rgb(231, 228, 228); border-bottom-color: ' + (j >= 7 ? '#3d3838' : 'rgb(231, 228, 228)') + ';" id="' + j + 'siljoktwo' + data[i].codenumber + '" ></td > ' +
                                '<td ondblclick="openmodal(this)" style="display: none; width: auto; font-size: 15px; border: 1px solid rgb(231, 228, 228); border-bottom-color: ' + (j >= 7 ? '#3d3838' : 'rgb(231, 228, 228)') + '; " id="' + j + '">' + j + '</td>' +
                                '<td style="display: none;  text-align:center; width:8%; font-size: 20px; border: 1px solid rgb(231, 228, 228); background-color:white; font-weight:bold;"  id="' + data[i].codenumber + '">' + data[i].equipmentname + '<br>' + data[i].part + '<br>' + data[i].size + '</td>' +
                                '<td style="display: none;  text-align:center; width:8%; font-size: 20px; border: 1px solid rgb(231, 228, 228); background-color:white; font-weight:bold;"  >' + data[i].codenumber + '</td>' +
                                '</tr>'
                            );
                            $('#1bomno' + data[i].equipmentname).val('123');

                        }
                    }



                    $.ajax({
                        type: 'POST',
                        url: server + '/api/plansearchAll',
                        dataType: 'json',
                        contentType: 'application/json',
                        data: JSON.stringify({
                            "plandate": $('#plandate').text()
                        }),
                        success: function (result) {
                            // Initialize loadTdData outside the loop
                            var loadTdData = {};

                            for (var i = 0; i < result.length; i++) {
                                var equipmentname = result[i].equipmentname;

                                // Check if loadTdData[equipmentname] is initialized
                                if (!loadTdData[equipmentname]) {
                                    loadTdData[equipmentname] = {};
                                }

                                for (var j = 0; j < 8; j++) {
                                    // Check if the property 'bomno' exists for the current result item and index
                                    if (result[i][j] && result[i][j].hasOwnProperty('bomno')) {
                                        // Use j as the index to access the corresponding result item
                                        var bomno = result[i][j].bomno;

                                        // Update the text with the correct value from the result
                                    }
                                }
                            }
                        }
                    });


                    // $.ajax({
                    //     type: 'POST',
                    //     url: server + '/api/selectequipment',
                    //     dataType: 'json',
                    //     success: function (data) {
                    //         for (var i = 0; i < data.length; i++) {

                    //             var equipmentname = data[i].size;
                    //             var selectElement = $('#equipment' + i);
                    //             selectElement.empty();

                    //             var emptyOption = '<option value=""></option>';
                    //             selectElement.append(emptyOption);
                    //             for (var j = 0; j < equipmentname.length + 1; j++) {

                    //                 var option = '<option value="' + data[j].size + data[j].customer + '">' + data[j].size + data[j].customer + '</option>';
                    //                 selectElement.append(option);
                    //             }
                    //         }
                    //     }
                    // });

                }
            }
        });
    }







    // "남은 일수"를 계산하여 라벨에 추가하는 함수
    function updateDaysLeftLabel() {
        var plandateSaveValue = $("#plandate-save").val();
        var currentDate = new Date();
        var plandateDate = new Date(plandateSaveValue);
        var timeDiff = plandateDate - currentDate;
        var daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

        var labelElement = $("#days-left-label");



        // 남은 일수가 1일인 경우 스타일을 변경할 수 있습니다.
        if (daysRemaining === 0) {
            labelElement.css("color", "blue"); // 남은 일수가 1일인 경우 빨간색으로 변경
            labelElement.text("금일생산 예정입니다.");
        } else {
            labelElement.text(daysRemaining + "일 뒤에 생산예정입니다.");
            labelElement.css("color", "red"); // 그 외의 경우 기본 색상으로 변경
        }
        if (daysRemaining < 0) {
            labelElement.text("생산 계획을 내릴수 없습니다");
            labelElement.css("color", "red"); // 그 외의 경우 기본 색상으로 변경
        }
    }




    // 계획변경
    function updateGrid() {
        let filteredData = [];
        let differenceUpdate = [];
        let differenceInsert = [];
        $.ajax({
            type: 'POST',
            url: server + '/api/plansearchAll',
            dataType: 'json',
            contentType: 'application/json',
            data: JSON.stringify({
                "plandate": $('#plandate').text()
            }),
            success: function (data) {
                flattenedData
                oldPlanSearchData = data;

                filteredData = _.filter(flattenedData, item => item.num !== '');

                differenceUpdate = _.differenceWith(filteredData, oldPlanSearchData, _.isEqual);
                differenceInsert = _.differenceWith(filteredData, oldPlanSearchData, (item1, item2) => item1.id === item2.id);

                for (let i = 0; i < differenceUpdate.length; i++) {
                    if (differenceUpdate[i].num) {
                        $.ajax({
                            type: 'POST',
                            url: server + '/api/planupdate',
                            dataType: 'json',
                            data: {
                                "id": differenceUpdate[i].id,
                                "plandate": differenceUpdate[i].plandate,
                                "bomno": differenceUpdate[i].bomno,
                                "modelname": differenceUpdate[i].modelname,
                                "itemname": differenceUpdate[i].itemname,
                                "lotno": differenceUpdate[i].lotno,
                                "pono": differenceUpdate[i].pono,
                                "equipmentname": differenceUpdate[i].equipmentname,
                                "num": differenceUpdate[i].num
                            },
                            success: function (data) {
                                console.log('update ok', data)
                            }
                        });
                    }

                }
                // 계획신규등록
                for (let i = 0; i < differenceInsert.length; i++) {
                    var str = "";
                    var tdArr = new Array(); // 배열 선언
                    var checkBtn = $(this);

                    var tr = checkBtn.parent().parent();
                    var td = tr.children();

                    var plandate = $('#plandate').text()
                    var bomno = differenceInsert[i].bomno
                    var modelname = differenceInsert[i].modelname
                    var itemname = differenceInsert[i].itemname
                    var lotno = differenceInsert[i].lotno

                    $('#plandate-save').val(plandate)
                    $('#bomno-save').val(bomno)
                    $('#modelname-save').val(modelname)
                    $('#itemname-save').val(itemname)
                    $('#lotno-save').val(lotno)
                    $('#quantity-save').val('')
                    $('#popupOverlay').fadeIn();
                    $('#quantity-save').focus()


                }


            }
        });

    }

    function settingTdData() {
        // //console.log('flattenedData', flattenedData);
        // //console.log('####1', loadTdData2);
        // //console.log('####2', loadTdData);

        var loadTdDataKeys = Object.keys(loadTdData);

        // for()
        for (let i = 0; i < flattenedData.length; i += 8) {
            const start = i;
            const end = i + 7;
            for (let j = start; j <= end; j++) {

                // //console.log(col, j);
                // if (flattenedData[j].num !== '' || flattenedData[j].num) {

                if (j > 7) {
                    const row = Math.floor(j / 8); // 행 인덱스 계산
                    const col = j % 8; // 열 인덱스 계산
                    // //console.log('flattenedData[j]', flattenedData[j]);
                    loadTdData[loadTdDataKeys[row]][col] = flattenedData[j];
                } else {
                    const row = Math.floor(j / 8); // 행 인덱스 계산
                    // const col = j % 8; // 열 인덱스 계산
                    // //console.log(row,j);
                    loadTdData[loadTdDataKeys[row]][j] = flattenedData[j];
                }
                //
                // }
            }
        }
        //console.log('####$$$loadTdData', loadTdData);
    }

    // row를 끌어서 내려놓았을떄
    function dropData(dragIndex, dropIndex) {
        //console.log('Index', dragIndex, dropIndex);

        const dragData = flattenedData[dragIndex];
        const dropData = flattenedData[dropIndex];

        //console.log('dragData', dragData);
        //console.log('dropData', dropData);

        if (dropData.num === '' || dropData.num === "" || dropData.num === null) {
            // 끌어 놓는 곳이 데이터가 없을 때
            //console.log('끌어 놓는 곳이 데이터가 없을 때');

            // 위치 변경
            flattenedData[dragIndex] = dropData;
            flattenedData[dropIndex] = dragData;

            if (dropIndex >= 0 && dropIndex < 8) {
                //console.log('name change');
                // 직접 원래 배열 요소에 접근하여 값을 변경
                flattenedData[dropIndex].equipmentname = '0001';
            }
        } else {
            // 끌어 놓는 곳에 데이터가 있을 때
            //console.log('끌어 놓는 곳에 데이터가 있을 때');
            //console.log('dragData', dragData);

            var noneDataRowIndex = -1;

            if (dragIndex < dropIndex) {
                //제일 가까운 빈칸 데이터
                for (let i = dropIndex; i < flattenedData.length - 1; i++) {
                    if (flattenedData[i].num === '' || flattenedData[i].num === '') {
                        noneDataRowIndex = i
                        break;
                    }
                }

                if (noneDataRowIndex !== -1) {
                    //console.log('noneDataRowIndex', noneDataRowIndex, dropIndex);
                    //console.log('dragData', dragData);
                    // 데이터를 한 칸씩 아래로 밀기
                    for (let i = noneDataRowIndex; i > dropIndex; i--) {
                        flattenedData[i] = flattenedData[i - 1];
                    }
                    // dragData를 dropIndex 위치에 삽입
                    flattenedData[dropIndex] = dragData;
                }
                emptyData(dragIndex)
            } else if (dragIndex > dropIndex) {

                const removedElement = flattenedData.splice(dragIndex, 1)[0];

                // dropIndex에 dragData를 삽입
                flattenedData.splice(dropIndex, 0, dragData);

            }


        }
        //console.log('### 재정비되어진 data', flattenedData);

        equipmentNameSetting();
        if (dropIndex >= 0 && dropIndex < 8) {
            //console.log('name change');
            // 직접 원래 배열 요소에 접근하여 값을 변경
            flattenedData[dropIndex].equipmentname = '0001';
        }

        // console.log('11재정비되어진 data', flattenedData);
    }

    function dropPlanData(dragIndex, dropIndex) {
        //console.log('Index', dragIndex, dropIndex);
        //console.log('loadData', loadData);

        const dragData = loadData[dragIndex];
        const dropData = flattenedData[dropIndex];

        //console.log('dragData', dragData);
        //console.log('dropData', dropData);

        if (dropData.num === '' || dropData.num === "" || dropData.num === null) {
            // 끌어 놓는 곳이 데이터가 없을 때
            //console.log('끌어 놓는 곳이 데이터가 없을 때');

            // 위치 변경
            // flattenedData[dragIndex] = dropData;
            const returnData = setNewPlanData(dragData, dropIndex);
            //console.log('re', returnData);
            // dragData = returnData
            flattenedData[dropIndex] = returnData;

            //console.log('flattenedData', flattenedData);

            if (dropIndex >= 0 && dropIndex < 8) {
                //console.log('name change');
                // 직접 원래 배열 요소에 접근하여 값을 변경
                flattenedData[dropIndex].equipmentname = '0001';
            }
        } else {
            // 끌어 놓는 곳에 데이터가 있을 때
            //console.log('끌어 놓는 곳에 데이터가 있을 때');
            //console.log('dragData', dragData);

            var noneDataRowIndex = -1;

            //제일 가까운 빈칸 데이터
            for (let i = dropIndex; i < flattenedData.length - 1; i++) {
                if (flattenedData[i].num === '' || flattenedData[i].num === '') {
                    noneDataRowIndex = i
                    break;
                }
            }

            const returnData = setNewPlanData(dragData, dropIndex);
            if (noneDataRowIndex !== -1) {
                //console.log('noneDataRowIndex', noneDataRowIndex, dropIndex);
                //console.log('dragData', dragData);
                // 데이터를 한 칸씩 아래로 밀기
                for (let i = noneDataRowIndex; i > dropIndex; i--) {
                    flattenedData[i] = flattenedData[i - 1];
                }
                // dragData를 dropIndex 위치에 삽입
                flattenedData[dropIndex] = returnData;
                //console.log('flattenedData[dropIndex]', flattenedData[dropIndex]);
            }
            // emptyData(dragIndex)


        }
        //console.log('### 재정비되어진 data', flattenedData);

        equipmentNameSetting();
        if (dropIndex >= 0 && dropIndex < 8) {
            //console.log('name change');
            // 직접 원래 배열 요소에 접근하여 값을 변경
            flattenedData[dropIndex].equipmentname = '0001';
        }

        //console.log('### 재정비되어진 data', flattenedData);
    }

    function equipmentNameSetting() {
        var loadTdDataKeys = Object.keys(loadTdData);

        for (let i = 0; i < flattenedData.length; i += 8) {
            for (let j = i; j < i + 8; j++) {
                if (flattenedData[j].num !== '' && flattenedData[j].num !== null) {
                    if (j > 7) {
                        flattenedData[j].equipmentname = loadTdDataKeys[i / 8];
                    }
                }
            }
        }
    }

    function numberSetting() {
        for (let i = 0; i < flattenedData.length; i++) {
            // i를 8로 나눈 몫에 1을 더하여 번호를 매깁니다.
            const number = Math.floor(i / 8) + 1;
            if (flattenedData[i].num !== '' || flattenedData[i].num !== "") {
                flattenedData[i].num = (i % 8) + 1;
            }
        }

        //console.log('flattenedData', flattenedData);
    }

    function emptyData(index) {
        const emptyData = {
            num: '',
            bomno: '',
            customer: '',
            modelname: '',
            itemname: '',
            part: '',
            linepart: '',
            lotno: '',
            pono: '',
            accumulate: '',
            remaining: '',
            planone: '',
            siljokone: '',
            plantwo: '',
            siljoktwo: ''
        }
        flattenedData[index] = emptyData
    }

    function setNewPlanData(newData, dropIndex) {
        var today = new Date();
        var formattedDate = today.getFullYear() + '-' + (today.getMonth() + 1).toString().padStart(2, '0') + '-' + today.getDate().toString().padStart(2, '0');

        //console.log('new Data', newData);
        var returnData = {
            num: dropIndex < 8 ? dropIndex + 1 : (dropIndex + 1) % 8,
            bomno: newData.bomno === undefined ? null : newData.bomno,
            customer: '',//##
            modelname: newData.modelname === undefined ? null : newData.modelname,
            itemname: newData.itemname === undefined ? null : newData.itemname,
            part: '',//##
            linepart: '',//##
            lotno: newData.lotno === undefined ? null : newData.lotno,
            pono: newData.pono === undefined ? null : newData.pono,
            accumulate: newData.accumulate === undefined ? null : newData.accumulate,
            remaining: newData.remaining === undefined ? null : newData.remaining,
            planone: newData.planone === undefined ? null : newData.planone,
            siljokone: newData.siljokone === undefined ? null : newData.siljokone,
            plantwo: newData.plantwo === undefined ? null : newData.plantwo,
            siljoktwo: newData.siljoktwo === undefined ? null : newData.siljoktwo,
            plandate: formattedDate
        }

        return returnData
    }

    function planload2() {
        // $('#Datatbody').empty();
        // $.ajax({
        //     type: 'POST',
        //     url: server + '/api/equipmentname',
        //     dataType: 'json',
        //     success: function (data) {
        //         var tableBody = $('#Datatbody');
        //         if (data.length === 0) {
        //         } else {
        loadTdData2 = {};

        for (var i = 0; i < loadData.length; i++) {


            // loadTdData 배열에 객체 추가
            loadTdData2[loadData[i].codenumber] = {};
            var numRows = 8; // 각 설비당 행 수 지정
            for (var j = 0; j < numRows; j++) {


                loadTdData2[loadData[i].codenumber][j] = {
                    num: '',
                    bomno: '',
                    customer: '',
                    modelname: '',
                    itemname: '',
                    part: '',
                    linepart: '',
                    lotno: '',
                    pono: '',
                    accumulate: '',
                    remaining: '',
                    planone: '', // 중복된 'planone' 제거
                    siljokone: '',
                    plantwo: '',
                    siljoktwo: '',
                }
            }
        }

        //             //console.log('#####loadTdData2', loadTdData2)
        //         }
        settingTdData();
        //     }
        // });
    }

    function relaodLeftGrid() {
        $("#datatable td").each(function () {

            // 현재 <td> 요소의 rowspan 속성을 가져옵니다.
            var rowspan = $(this).attr("rowspan");

            // rowspan이 없는 경우에만 텍스트를 지웁니다.
            if (typeof rowspan === "undefined" || rowspan === false) {
                $(this).text("");
            }
        });
        // rowspan이 없는 경우에만 텍스트를 지웁니다.
        // if (typeof rowspan === "undefined" || rowspan === false) {
        //     $('#datatable td').text("");
        // }
        var loadTdDataKeys = Object.keys(loadTdData);
        //console.log('loadTdData3', loadTdData);
        var numKeys = loadTdDataKeys.length;
        // //console.log(numKeys);
        for (var i = 0; i < numKeys; i++) {

            for (var j = 0; j < 8; j++) {

                var bomno = 'bomno' + loadTdData[loadTdDataKeys[i]][j].equipmentname;
                var customer = 'customer' + loadTdData[loadTdDataKeys[i]][j].equipmentname;
                var modelname = 'modelname' + loadTdData[loadTdDataKeys[i]][j].equipmentname;
                var itemname = 'itemname' + loadTdData[loadTdDataKeys[i]][j].equipmentname;
                var part = 'part' + loadTdData[loadTdDataKeys[i]][j].equipmentname;
                var linepart = 'linepart' + loadTdData[loadTdDataKeys[i]][j].equipmentname;
                var lotno = 'lotno' + loadTdData[loadTdDataKeys[i]][j].equipmentname;
                var pono = 'pono' + loadTdData[loadTdDataKeys[i]][j].equipmentname;
                var accumulate = 'accumulate' + loadTdData[loadTdDataKeys[i]][j].equipmentname;
                var remaining = 'remaining' + loadTdData[loadTdDataKeys[i]][j].equipmentname;
                var planone = 'planone' + loadTdData[loadTdDataKeys[i]][j].equipmentname;
                var siljokone = 'siljokone' + loadTdData[loadTdDataKeys[i]][j].equipmentname;
                var plantwo = 'plantwo' + loadTdData[loadTdDataKeys[i]][j].equipmentname;
                var siljoktwo = 'siljoktwo' + loadTdData[loadTdDataKeys[i]][j].equipmentname;

                $('#' + j + bomno + '').text(loadTdData[loadTdDataKeys[i]][j].bomno);
                $('#' + j + customer + '').text(loadTdData[loadTdDataKeys[i]][j].customer);
                $('#' + j + modelname + '').text(loadTdData[loadTdDataKeys[i]][j].modelname);
                $('#' + j + itemname + '').text(loadTdData[loadTdDataKeys[i]][j].itemname);
                $('#' + j + part + '').text(loadTdData[loadTdDataKeys[i]][j].part);
                $('#' + j + linepart + '').text(loadTdData[loadTdDataKeys[i]][j].linepart);
                $('#' + j + lotno + '').text(loadTdData[loadTdDataKeys[i]][j].lotno);
                $('#' + j + pono + '').text(loadTdData[loadTdDataKeys[i]][j].pono);
                $('#' + j + accumulate + '').text(loadTdData[loadTdDataKeys[i]][j].accumulate);
                $('#' + j + remaining + '').text(loadTdData[loadTdDataKeys[i]][j].remaining);
                $('#' + j + planone + '').text(loadTdData[loadTdDataKeys[i]][j].planone);
                $('#' + j + siljokone + '').text(loadTdData[loadTdDataKeys[i]][j].siljokone);
                $('#' + j + plantwo + '').text(loadTdData[loadTdDataKeys[i]][j].plantwo);
                $('#' + j + siljoktwo + '').text(loadTdData[loadTdDataKeys[i]][j].siljoktwo);

            }

        }
    }

    const tables = document.querySelectorAll('.droppable');
    const table1 = document.querySelector('#datatable');

    const table2 = document.querySelector('#planstauts');
    let draggedRowIndex; // 드래그하는 행의 인덱스를 저장할 변수

    tables.forEach(function (table) {
        console.log(table1)
        table.addEventListener('dragstart', function (e) {
            e.dataTransfer.setData('text/html', e.target.innerHTML);
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('draggedTableId', table.id);
            const draggedRow = e.target.closest('tr');

            if (draggedRow) {
                draggedRowIndex = Array.from(table1.tBodies[0].rows).indexOf(draggedRow);
                e.dataTransfer.setData('text/html', draggedRow.outerHTML);
            }
        });

        table1.addEventListener('dragover', function (e) {
            e.preventDefault();
            const targetRow = e.target.closest('tr');
            if (targetRow) {
                targetRow.classList.add('drag-over-row');
            }

        });

        table1.addEventListener('dragleave', function (e) {
            const targetRow = e.target.closest('tr');
            if (targetRow) {
                targetRow.classList.remove('drag-over-row');
            }
            //console.log('dragleave');
        });

        table1.addEventListener('drop', function (e) {
            e.preventDefault();
            const targetRow = e.target.closest('tr');
            if (targetRow) {
                targetRow.classList.remove('drag-over-row');
            }
            const data = e.dataTransfer.getData('text/html');
            const draggedTableId = e.dataTransfer.getData('draggedTableId');
            //console.log('draggedTableId', draggedTableId);
            if (table === table1 && draggedTableId === 'planstauts') {
                const newRow = document.createElement('tr');
                newRow.setAttribute('draggable', 'true');

                const parentTable = targetRow.closest('table');
                const targetRowIndex = Array.from(parentTable.tBodies[0].rows).indexOf(targetRow);
                //console.log('draggedRowIndex', draggedRowIndex+1);
                //console.log('targetRowIndex', targetRowIndex);

                dropPlanData(draggedRowIndex + 1, targetRowIndex)
                numberSetting()
                planload2();
                relaodLeftGrid();
                console.log('flattenedData', flattenedData);
                updateGrid()

            } else if (table === table1 && draggedTableId === 'datatable') {

                const parentTable = targetRow.closest('table');
                const targetRowIndex = Array.from(parentTable.tBodies[0].rows).indexOf(targetRow);

                dropData(draggedRowIndex, targetRowIndex)
                numberSetting()
                planload2();
                relaodLeftGrid();
                console.log('flattenedData', flattenedData);
                updateGrid()
            } else if (table === table2) {
                // Handle table2 logic if needed
            }

        });
    });

});

