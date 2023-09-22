$(document).ready(function () {
    console.log('drag..js')
    // 드래그 앤 드롭 이벤트 처리


    //
    // planstauts
    //
    // datatable
})

document.addEventListener("dragstart", function(event) {
    event.dataTransfer.setData("text/plain", event.target.innerHTML);
});

document.addEventListener("dragover", function(event) {
    event.preventDefault();
});

document.addEventListener("drop", function(event) {
    event.preventDefault();
    var data = event.dataTransfer.getData("text/plain");
    var targetTable = event.target.closest("table.droppable");

    if (targetTable) {
        var newRow = targetTable.insertRow(-1);
        var newCell = newRow.insertCell(0);
        newCell.innerHTML = data;
    }
});