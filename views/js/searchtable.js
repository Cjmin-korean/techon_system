function searchTable() {
    var spinnerOverlay = document.querySelector('.spinner-overlay');
    spinnerOverlay.style.display = 'flex'; // Spinner 표시
    var searchText = $('#inputdata').val().toLowerCase();
    var visibleRows = 0;

    $('#iteminfobody tr').filter(function () {
        var isVisible = $(this).text().toLowerCase().indexOf(searchText) > -1;
        $(this).toggle(isVisible);
        if (isVisible) visibleRows++;
    });
    console.log(visibleRows)
    if (visibleRows === 0) {
        $('#iteminfobody').append('<tr class="no-data"><td colspan="20" style="text-align:center;">데이터가 없습니다</td></tr>');
    } else {
        $('#iteminfobody').find('.no-data').remove();
    }
    setTimeout(function () {
        spinnerOverlay.style.display = 'none'; // 1초 후에 Spinner 숨김
    }, 1100);
}
