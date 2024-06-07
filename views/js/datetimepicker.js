function getCurrentDate() {
    var today = new Date();
    var year = today.getFullYear();
    var month = String(today.getMonth() + 1).padStart(2, '0');
    var day = String(today.getDate()).padStart(2, '0');
    return year + '-' + month + '-' + day;
}

// 현재 날짜를 input 요소에 설정하기
document.getElementById('datetimepicker1').value = getCurrentDate();
document.getElementById('datetimepicker2').value = getCurrentDate();
document.getElementById('datetimepicker1-input').value = getCurrentDate();
document.getElementById('datetimepicker2-input').value = getCurrentDate();