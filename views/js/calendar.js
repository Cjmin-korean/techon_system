
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
    console.log(selectedDate)
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
                    updateCalendar();
                    setSelectedDate(selectedDate);
                    plansearching()

                }
                // 선택한 날짜 정보 저장
          
              




            });
            datesContainer.appendChild(dateButton);
        }

        // 이전에 선택된 버튼 제거
        const selectedButton = datesContainer.querySelector('.selected');
        if (selectedButton) {
            selectedButton.classList.remove('selected');
        }

        // 이전에 선택한 날짜 정보를 기반으로 선택된 버튼 설정
        selectDateButton();

    }

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

    function plansearching() {

        $.ajax({
            type: 'POST',
            url: server + '/api/plansearch',
            dataType: 'json',
            contentType: 'application/json',
            data: JSON.stringify({
                "plandate": $('#plandate').text()
            }),
            success: function (data) {

                for (var i = 0; i < data.length; i++) {
                    var bomno = 'bomno' + data[i].equipmentname + data[i].plandate;
                    var customer = 'customer' + data[i].equipmentname + data[i].plandate;
                    var modelname = 'modelname' + data[i].equipmentname + data[i].plandate;
                    var itemname = 'itemname' + data[i].equipmentname + data[i].plandate;
                    var part = 'part' + data[i].equipmentname + data[i].plandate;
                    var linepart = 'linepart' + data[i].equipmentname + data[i].plandate;
                    var lotno = 'lotno' + data[i].equipmentname + data[i].plandate;
                    var pono = 'pono' + data[i].equipmentname + data[i].plandate;
                    var accumulate = 'accumulate' + data[i].equipmentname + data[i].plandate;
                    var remaining = 'remaining' + data[i].equipmentname + data[i].plandate;
                    var planone = 'planone' + data[i].equipmentname + data[i].plandate;
                    var siljokone = 'siljokone' + data[i].equipmentname + data[i].plandate;
                    var plantwo = 'plantwo' + data[i].equipmentname + data[i].plandate;
                    var siljoktwo = 'siljoktwo' + data[i].equipmentname + data[i].plandate;

                    $('#' + i + bomno + '').text(data[i].bomno);
                    $('#' + i + customer + '').text(data[i].customer);
                    $('#' + i + modelname + '').text(data[i].modelname);
                    $('#' + i + itemname + '').text(data[i].itemname);
                    $('#' + i + part + '').text(data[i].part);
                    $('#' + i + linepart + '').text(data[i].linepart);
                    $('#' + i + lotno + '').text(data[i].lotno);
                    $('#' + i + pono + '').text(data[i].pono);
                    $('#' + i + accumulate + '').text(data[i].accumulate);
                    $('#' + i + remaining + '').text(data[i].remaining);
                    $('#' + i + planone + '').text(data[i].planone);
                    $('#' + i + siljokone + '').text(data[i].siljokone);
                    $('#' + i + plantwo + '').text(data[i].plantwo);
                    $('#' + i + siljoktwo + '').text(data[i].siljoktwo);
                }
            }
        });
    }
});
