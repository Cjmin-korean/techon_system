$(document).ready(function () {
    var accessToken = sessionStorage.getItem('accessToken');

    if (!accessToken) {
        alert('asdfasdf')        // alert('로그인이 필요합니다.');
        window.location.href = '../index.html'; // 로그인 페이지로 리디렉션
    }
});