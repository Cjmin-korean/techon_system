// 드래그가 이미 시작되었는지 여부를 나타내는 변수
var isDragStarted = false;

document.addEventListener("dragstart", function(event) {
    // 이미 드래그가 시작되었다면 추가하지 않음
    if (isDragStarted) {
        return;
    }

    var draggedData = event.target.innerHTML;
    var dataText = stripHTML(draggedData); // HTML 태그를 제거한 텍스트 데이터

    // 데이터를 줄바꿈 문자를 기준으로 분리
    var dataLines = dataText.split('\n');

    // 데이터를 콘솔에 출력
    for (var i = 0; i < dataLines.length; i++) {
        console.log(dataLines[i]);
    }

    event.dataTransfer.setData("text/plain", dataText);
    event.dataTransfer.setData("source-table", event.target.closest("table").id);

    // 드래그가 시작되었음을 표시
    isDragStarted = true;
});

// 드래그가 끝났을 때 isDragStarted 변수 초기화
document.addEventListener("dragend", function(event) {
    isDragStarted = false;
});

function stripHTML(html) {
    var doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent || "";
}
