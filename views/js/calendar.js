
$(document).ready(function () {
    const monthYearElement = document.getElementById('month-year');
    const datesContainer = document.querySelector('.dates');
    const prevMonthButton = document.querySelector('.prev-month');
    const nextMonthButton = document.querySelector('.next-month');
    // 이전에 선택한 날짜 정보를 저장하고 불러오기 위한 키
    const selectedDateKey = 'selectedDate';

    let currentMonth = new Date().getMonth(); // 현재 월
    let currentYear = new Date().getFullYear(); // 현재 연도
    let selectedDate = null; // 선택한 날짜를 저장할 변수

    // 이전에 선택한 날짜 정보 가져오기
    function getSelectedDate() {
        const selectedDateStr = localStorage.getItem(selectedDateKey);
        if (selectedDateStr) {
            return new Date(selectedDateStr);
        }
        return null; // 저장된 정보가 없을 경우
    }

    // 선택한 날짜 정보 저장하기
    function setSelectedDate(date) {
        localStorage.setItem(selectedDateKey, date.toISOString());
    }


    // 이전에 선택한 날짜 정보 가져오기
    selectedDate = getSelectedDate();
    // console.log(selectedDate)
    // 만약 저장된 날짜 정보가 없을 경우 현재 날짜를 기본으로 선택
    // if (!selectedDate) {
    selectedDate = new Date(currentYear, currentMonth, new Date().getDate());
    setSelectedDate(selectedDate); // 선택한 날짜 정보 저장
    // }

    // 초기 로드 시 오늘 날짜 가져오기
    const today = new Date();
    const todayYear = today.getFullYear();
    const todayMonth = today.getMonth();
    const todayDate = today.getDate();

    // 이전에 선택한 날짜 정보를 기반으로 선택된 버튼 설정
    function selectDateButton() {
        const buttons = datesContainer.querySelectorAll('button');
        buttons.forEach(button => {
            const day = parseInt(button.querySelector('span').textContent, 10);
            const date = new Date(currentYear, currentMonth, day);

            // 저장된 날짜와 같다면 선택 상태 설정
            if (selectedDate && isSameDate(selectedDate, date)) {
                button.classList.add('selected');
                scrollToSelectedButton(button); // 선택된 버튼을 중앙으로 스크롤
            }
        });
    }

    // 날짜가 같은지 확인하는 함수
    function isSameDate(date1, date2) {
        return (
            date1.getFullYear() === date2.getFullYear() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getDate() === date2.getDate()
        );
    }

    // 달력 업데이트 함수
    function updateCalendar() {
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

        // 이전에 생성된 버튼을 모두 제거
        datesContainer.innerHTML = '';

        // 월과 연도 업데이트
        monthYearElement.textContent = `${currentYear}년 ${currentMonth + 1}월`;

        // 각 날짜와 요일을 버튼에 추가
        for (let day = 1; day <= daysInMonth; day++) {
            const dateButton = document.createElement('button');
            const dayOfWeek = new Date(currentYear, currentMonth, day).getDay();
            const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
            dateButton.textContent = weekdays[dayOfWeek];

            const dateSpan = document.createElement('span'); // span 요소 생성
            dateSpan.textContent = day; // 일자를 span 요소에 추가
            dateButton.appendChild(dateSpan); // span을 버튼에 추가

            // 각 날짜 버튼에 클릭 이벤트 리스너 추가
            dateButton.addEventListener('click', () => {
                const clickedDate = new Date(currentYear, currentMonth, day);
                const formattedDate = formatDate(clickedDate); // yyyy-mm-dd 형식으로 날짜를 포맷


                const plandateElement = document.getElementById('plandate');
                if (plandateElement) {
                    plandateElement.textContent = formattedDate;
                    plansearching()
                  

                }

                // 이미 선택된 날짜와 같다면 선택 취소
                if (selectedDate && isSameDate(selectedDate, clickedDate)) {
                    selectedDate = null;
                    plansearching()
                } else {
                    selectedDate = clickedDate;
                    planload()
                    console.log('121212')
                    updateCalendar();
                    setSelectedDate(selectedDate);
                    plansearching()

                }

            });
            datesContainer.appendChild(dateButton);
        }

        const selectedButton = datesContainer.querySelector('.selected');
        if (selectedButton) {
            selectedButton.classList.remove('selected');
        }

        selectDateButton();

    }
    // function planload() {
    //     $('#Datatbody').empty();
    //     $.ajax({
    //         type: 'POST',
    //         url: server + '/api/equipmentname',
    //         dataType: 'json',
    //         success: function (data) {
    //             var tableBody = $('#Datatbody');
    //             if (data.length === 0) {
    //             } else {
    //                 loadTdData = {};

    //                 for (var i = 0; i < data.length; i++) {
    //                     loadTdData[data[i].codenumber] = {};
    //                     var numRows = 8;
    //                     for (var j = 0; j < numRows; j++) {
    //                         loadTdData[data[i].codenumber][j] = {
    //                             num: '',
    //                             bomno: '',
    //                             customer: '',
    //                             modelname: '',
    //                             itemname: '',
    //                             part: '',
    //                             linepart: '',
    //                             lotno: '',
    //                             pono: '',
    //                             accumulate: '',
    //                             remaining: '',
    //                             planone: '',
    //                             siljokone: '',
    //                             plantwo: '',
    //                             siljoktwo: '',
    //                         }

    //                         tableBody.append(
    //                             '<tr draggable="true"  >' +
    //                             (j === 0 ? '<td style="text-align:center; width:8%; font-size: 20px; border: 1px solid rgb(231, 228, 228); background-color:white; font-weight:bold;" rowspan="' + numRows + '" id="' + data[i].codenumber + '">' + data[i].equipmentname + '<br>' + data[i].part + '<br>' + data[i].size + '</td>' : '') +
    //                             '<td  ondblclick="openmodal(this)" style="width: auto; font-size: 15px; border: 1px solid rgb(231, 228, 228); border-bottom-color: ' + (j >= 7 ? '#3d3838' : 'rgb(231, 228, 228)') + ';" id="' + j + 'bomno' + data[i].codenumber + '"></td>' +
    //                             '<td  ondblclick="openmodal(this)" style="width: auto; font-size: 15px; border: 1px solid rgb(231, 228, 228); border-bottom-color: ' + (j >= 7 ? '#3d3838' : 'rgb(231, 228, 228)') + ';" id="' + j + 'customer' + data[i].codenumber + '"></td>' +
    //                             '<td  ondblclick="openmodal(this)" style="width: auto; font-size: 15px; border: 1px solid rgb(231, 228, 228); border-bottom-color: ' + (j >= 7 ? '#3d3838' : 'rgb(231, 228, 228)') + ';" id="' + j + 'modelname' + data[i].codenumber + '" ></td > ' +
    //                             '<td  ondblclick="openmodal(this)" style="width: auto; font-size: 15px; border: 1px solid rgb(231, 228, 228); border-bottom-color: ' + (j >= 7 ? '#3d3838' : 'rgb(231, 228, 228)') + ';" id="' + j + 'itemname' + data[i].codenumber + '" ></td > ' +
    //                             '<td  ondblclick="openmodal(this)" style="width: auto; font-size: 15px; border: 1px solid rgb(231, 228, 228); border-bottom-color: ' + (j >= 7 ? '#3d3838' : 'rgb(231, 228, 228)') + ';" id="' + j + 'part' + data[i].codenumber + '" ></td > ' +
    //                             '<td  ondblclick="openmodal(this)" style="width: auto; font-size: 15px; border: 1px solid rgb(231, 228, 228); border-bottom-color: ' + (j >= 7 ? '#3d3838' : 'rgb(231, 228, 228)') + ';" id="' + j + 'linepart' + data[i].codenumber + '" ></td > ' +
    //                             '<td  ondblclick="openmodal(this)" style="width: auto; font-size: 15px; border: 1px solid rgb(231, 228, 228); border-bottom-color: ' + (j >= 7 ? '#3d3838' : 'rgb(231, 228, 228)') + ';" id="' + j + 'lotno' + data[i].codenumber + '" ></td > ' +
    //                             '<td  ondblclick="openmodal(this)" style="width: auto; font-size: 15px; border: 1px solid rgb(231, 228, 228); border-bottom-color: ' + (j >= 7 ? '#3d3838' : 'rgb(231, 228, 228)') + ';" id="' + j + 'pono' + data[i].codenumber + '" ></td > ' +
    //                             '<td  ondblclick="openmodal(this)" style="width: auto; font-size: 15px; border: 1px solid rgb(231, 228, 228); border-bottom-color: ' + (j >= 7 ? '#3d3838' : 'rgb(231, 228, 228)') + ';" id="' + j + 'accumulate' + data[i].codenumber + '" ></td > ' +
    //                             '<td  ondblclick="openmodal(this)" style="width: auto; font-size: 15px; border: 1px solid rgb(231, 228, 228); border-bottom-color: ' + (j >= 7 ? '#3d3838' : 'rgb(231, 228, 228)') + ';" id="' + j + 'remaining' + data[i].codenumber + '" ></td > ' +
    //                             '<td  ondblclick="openmodal(this)" style="width: auto; font-size: 15px; border: 1px solid rgb(231, 228, 228); border-bottom-color: ' + (j >= 7 ? '#3d3838' : 'rgb(231, 228, 228)') + ';" id="' + j + 'planone' + data[i].codenumber + '" ></td > ' +
    //                             '<td  ondblclick="openmodal(this)" style="width: auto; font-size: 15px; border: 1px solid rgb(231, 228, 228); border-bottom-color: ' + (j >= 7 ? '#3d3838' : 'rgb(231, 228, 228)') + ';" id="' + j + 'siljokone' + data[i].codenumber + '" ></td > ' +
    //                             '<td  ondblclick="openmodal(this)" style="width: auto; font-size: 15px; border: 1px solid rgb(231, 228, 228); border-bottom-color: ' + (j >= 7 ? '#3d3838' : 'rgb(231, 228, 228)') + ';" id="' + j + 'plantwo' + data[i].codenumber + '" ></td > ' +
    //                             '<td  ondblclick="openmodal(this)" style="width: auto; font-size: 15px; border: 1px solid rgb(231, 228, 228); border-bottom-color: ' + (j >= 7 ? '#3d3838' : 'rgb(231, 228, 228)') + ';" id="' + j + 'siljoktwo' + data[i].codenumber + '" ></td > ' +
    //                             '<td ondblclick="openmodal(this)" style="display: none; width: auto; font-size: 15px; border: 1px solid rgb(231, 228, 228); border-bottom-color: ' + (j >= 7 ? '#3d3838' : 'rgb(231, 228, 228)') + '; " id="' + j + '">' + j + '</td>' +
    //                             '<td style="display: none;  text-align:center; width:8%; font-size: 20px; border: 1px solid rgb(231, 228, 228); background-color:white; font-weight:bold;"  id="' + data[i].codenumber + '">' + data[i].equipmentname + '<br>' + data[i].part + '<br>' + data[i].size + '</td>' +
    //                             '<td style="display: none;  text-align:center; width:8%; font-size: 20px; border: 1px solid rgb(231, 228, 228); background-color:white; font-weight:bold;"  >' + data[i].codenumber + '</td>' +
    //                             '</tr>'
    //                         );

    //                     }
    //                 }



                    

    //             }
    //         }
    //     });
    // }
    // function planload() {
    //     console.log('afsdasdf')
    //     $('#Datatbody').empty();
    //     $.ajax({
    //         type: 'POST',
    //         url: server + '/api/equipmentname',
    //         dataType: 'json',
    //         success: function (data) {
    //             var tableBody = $('#Datatbody');
    //             if (data.length === 0) {
    //             } else {
    //                 loadTdData = {};

    //                 for (var i = 0; i < data.length; i++) {


    //                     // loadTdData 배열에 객체 추가
    //                     loadTdData[data[i].codenumber] = {};
    //                     var numRows = 8; // 각 설비당 행 수 지정
    //                     for (var j = 0; j < numRows; j++) {


    //                         loadTdData[data[i].codenumber][j] = {
    //                             num: '',
    //                             bomno: '',
    //                             customer: '',
    //                             modelname: '',
    //                             itemname: '',
    //                             part: '',
    //                             linepart: '',
    //                             lotno: '',
    //                             pono: '',
    //                             accumulate: '',
    //                             remaining: '',
    //                             planone: '', // 중복된 'planone' 제거
    //                             siljokone: '',
    //                             plantwo: '',
    //                             siljoktwo: '',
    //                         }

    //                         tableBody.append(
    //                             '<tr>' +
    //                             (j === 0 ? '<td style="text-align:center; width:8%;  font-size: 20px; border: 1px solid rgb(231, 228, 228); background-color:white; font-weight:bold;" rowspan="' + numRows + '" id="' + data[i].codenumber + '">' + data[i].equipmentname + '<br>' + data[i].part + '<br>' + data[i].size + '</td>' : '') +
    //                             '<td  ondblclick="openmodal(this)" style="width: auto; font-size: 15px; border: 1px solid rgb(231, 228, 228); border-bottom-color: ' + (j >= 7 ? '#3d3838' : 'rgb(231, 228, 228)') + ';" id="' + j + 'bomno' + data[i].codenumber + '"></td>' +
    //                             '<td  ondblclick="openmodal(this)" style="width: auto; font-size: 15px; border: 1px solid rgb(231, 228, 228); border-bottom-color: ' + (j >= 7 ? '#3d3838' : 'rgb(231, 228, 228)') + ';" id="' + j + 'customer' + data[i].codenumber + '"></td>' +
    //                             '<td  ondblclick="openmodal(this)" style="width: auto; font-size: 15px; border: 1px solid rgb(231, 228, 228); border-bottom-color: ' + (j >= 7 ? '#3d3838' : 'rgb(231, 228, 228)') + ';" id="' + j + 'modelname' + data[i].codenumber + '" ></td > ' +
    //                             '<td  ondblclick="openmodal(this)" style="width: auto; font-size: 15px; border: 1px solid rgb(231, 228, 228); border-bottom-color: ' + (j >= 7 ? '#3d3838' : 'rgb(231, 228, 228)') + ';" id="' + j + 'itemname' + data[i].codenumber + '" ></td > ' +
    //                             '<td  ondblclick="openmodal(this)" style="width: auto; font-size: 15px; border: 1px solid rgb(231, 228, 228); border-bottom-color: ' + (j >= 7 ? '#3d3838' : 'rgb(231, 228, 228)') + ';" id="' + j + 'part' + data[i].codenumber + '" ></td > ' +
    //                             '<td  ondblclick="openmodal(this)" style="width: auto; font-size: 15px; border: 1px solid rgb(231, 228, 228); border-bottom-color: ' + (j >= 7 ? '#3d3838' : 'rgb(231, 228, 228)') + ';" id="' + j + 'linepart' + data[i].codenumber + '" ></td > ' +
    //                             '<td  ondblclick="openmodal(this)" style="width: auto; font-size: 15px; border: 1px solid rgb(231, 228, 228); border-bottom-color: ' + (j >= 7 ? '#3d3838' : 'rgb(231, 228, 228)') + ';" id="' + j + 'lotno' + data[i].codenumber + '" ></td > ' +
    //                             '<td  ondblclick="openmodal(this)" style="width: auto; font-size: 15px; border: 1px solid rgb(231, 228, 228); border-bottom-color: ' + (j >= 7 ? '#3d3838' : 'rgb(231, 228, 228)') + ';" id="' + j + 'pono' + data[i].codenumber + '" ></td > ' +
    //                             '<td  ondblclick="openmodal(this)" style="width: auto; font-size: 15px; border: 1px solid rgb(231, 228, 228); border-bottom-color: ' + (j >= 7 ? '#3d3838' : 'rgb(231, 228, 228)') + ';" id="' + j + 'accumulate' + data[i].codenumber + '" ></td > ' +
    //                             '<td  ondblclick="openmodal(this)" style="width: auto; font-size: 15px; border: 1px solid rgb(231, 228, 228); border-bottom-color: ' + (j >= 7 ? '#3d3838' : 'rgb(231, 228, 228)') + ';" id="' + j + 'remaining' + data[i].codenumber + '" ></td > ' +
    //                             '<td  ondblclick="openmodal(this)" style="width: auto; font-size: 15px; border: 1px solid rgb(231, 228, 228); border-bottom-color: ' + (j >= 7 ? '#3d3838' : 'rgb(231, 228, 228)') + ';" id="' + j + 'planone' + data[i].codenumber + '" ></td > ' +
    //                             '<td  ondblclick="openmodal(this)" style="width: auto; font-size: 15px; border: 1px solid rgb(231, 228, 228); border-bottom-color: ' + (j >= 7 ? '#3d3838' : 'rgb(231, 228, 228)') + ';" id="' + j + 'siljokone' + data[i].codenumber + '" ></td > ' +
    //                             '<td  ondblclick="openmodal(this)" style="width: auto; font-size: 15px; border: 1px solid rgb(231, 228, 228); border-bottom-color: ' + (j >= 7 ? '#3d3838' : 'rgb(231, 228, 228)') + ';" id="' + j + 'plantwo' + data[i].codenumber + '" ></td > ' +
    //                             '<td  ondblclick="openmodal(this)" style="width: auto; font-size: 15px; border: 1px solid rgb(231, 228, 228); border-bottom-color: ' + (j >= 7 ? '#3d3838' : 'rgb(231, 228, 228)') + ';" id="' + j + 'siljoktwo' + data[i].codenumber + '" ></td > ' +
    //                             '<td ondblclick="openmodal(this)" style="display: none; width: auto; font-size: 15px; border: 1px solid rgb(231, 228, 228); border-bottom-color: ' + (j >= 7 ? '#3d3838' : 'rgb(231, 228, 228)') + '; " id="' + j + '">' + j + '</td>' +
    //                             '<td style="display: none;  text-align:center; width:8%; font-size: 20px; border: 1px solid rgb(231, 228, 228); background-color:white; font-weight:bold;"  id="' + data[i].codenumber + '">' + data[i].equipmentname + '<br>' + data[i].part + '<br>' + data[i].size + '</td>' +
    //                             '<td style="display: none;  text-align:center; width:8%; font-size: 20px; border: 1px solid rgb(231, 228, 228); background-color:white; font-weight:bold;"  >' + data[i].codenumber + '</td>' +
    //                             '</tr>'
    //                         );

    //                     }
    //                 }

    //                 //console.log('loadTdData2', loadTdData)
    //                 plansearching()
    //             }
    //         }
    //     });
    // }

    

    // 달력 초기 업데이트
    updateCalendar();

    // 이전 달로 이동 버튼 클릭 시
    prevMonthButton.addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        updateCalendar();
    });

    // 다음 달로 이동 버튼 클릭 시
    nextMonthButton.addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        updateCalendar();
    });

    // 선택된 버튼으로 스크롤
    function scrollToSelectedButton(selectedButton) {
        if (selectedButton) {
            // 선택된 버튼이 있는 경우에만 스크롤을 조작합니다.
            const containerRect = datesContainer.getBoundingClientRect();
            const buttonRect = selectedButton.getBoundingClientRect();
            const containerScrollLeft = datesContainer.scrollLeft;

            // 스크롤 위치 계산
            const scrollTo = buttonRect.left - containerRect.left + containerScrollLeft - (containerRect.width - buttonRect.width) / 2;

            // 스크롤 애니메이션 적용 (optional)
            datesContainer.scrollTo({
                left: scrollTo,
                behavior: 'smooth' // 부드러운 스크롤
            });
        }
    }
    // 날짜를 yyyy-mm-dd 형식으로 포맷하는 함수
    function formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }



});
