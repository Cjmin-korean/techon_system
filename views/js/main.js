


    //검색
    const searchInput = document.getElementById('search-input');
    const dataTable = document.getElementById('data-table');
    const tableRows = dataTable.getElementsByTagName('tr');

    searchInput.addEventListener('input', function () {
        const searchValue = this.value.toLowerCase();

        for (let i = 1; i < tableRows.length; i++) {
            const rowData = tableRows[i].getElementsByTagName('td');

            let found = false;

            for (let j = 0; j < rowData.length; j++) {
                const cellData = rowData[j].textContent.toLowerCase();

                if (cellData.includes(searchValue)) {
                    found = true;
                    break;
                }
            }

            if (found) {
                tableRows[i].style.display = '';
            } else {
                tableRows[i].style.display = 'none';
            }

        }
    });
    //오름차순 내림차순
    function sortTable(columnIndex) {
        var table, rows, switching, i, x, y, shouldSwitch, direction, switchcount = 0;
        table = document.getElementById("data-table");
        switching = true;
        direction = "asc"; // 기본 정렬 방향은 오름차순

        while (switching) {
            switching = false;
            rows = table.getElementsByTagName("tr");

            for (i = 1; i < (rows.length - 1); i++) {
                shouldSwitch = false;
                x = rows[i].getElementsByTagName("td")[columnIndex];
                y = rows[i + 1].getElementsByTagName("td")[columnIndex];

                if (direction == "asc") {
                    if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
                        shouldSwitch = true;
                        break;
                    }
                } else if (direction == "desc") {
                    if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
                        shouldSwitch = true;
                        break;
                    }
                }
            }

            if (shouldSwitch) {
                rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
                switching = true;
                switchcount++;
            } else {
                if (switchcount == 0 && direction == "asc") {
                    direction = "desc";
                    switching = true;
                }
            }
        }
    }

    //엑셀
    function exportToExcel() {
        var table = document.getElementById("data-table");
        var workbook = XLSX.utils.table_to_book(table);
        var worksheet = workbook.Sheets[workbook.SheetNames[0]];
        var excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

        saveAsExcelFile(excelBuffer, 'data');
    }

    function saveAsExcelFile(buffer, fileName) {
        var data = new Blob([buffer], { type: 'application/octet-stream' });
        var url = URL.createObjectURL(data);
        var link = document.createElement('a');
        link.href = url;
        link.download = fileName + '.xlsx';
        link.click();
    }
    window.addEventListener('DOMContentLoaded', function () {
        var table = document.getElementById('data-table');
        var totalRows = table.getElementsByTagName('tbody')[0].getElementsByTagName('tr').length;
        var totalRowsElement = document.getElementById('total-rows');
        totalRowsElement.textContent = '검색수 : ' + totalRows; // 행 수를 요소에 설정
    });

    window.addEventListener('DOMContentLoaded', function () {
        const searchInput = document.getElementById('search-input');
        const dataTable = document.getElementById('data-table');
        const tableRows = dataTable.getElementsByTagName('tr');
        const totalRowsElement = document.getElementById('total-rows');

        searchInput.addEventListener('input', function () {
            const searchValue = this.value.toLowerCase();
            let displayedRows = 0;

            for (let i = 1; i < tableRows.length; i++) {
                const rowData = tableRows[i].getElementsByTagName('td');

                let found = false;

                for (let j = 0; j < rowData.length; j++) {
                    const cellData = rowData[j].textContent.toLowerCase();

                    if (cellData.includes(searchValue)) {
                        found = true;
                        break;
                    }
                }

                if (found) {
                    tableRows[i].style.display = '';
                    displayedRows++;
                } else {
                    tableRows[i].style.display = 'none';
                }
            }

            totalRowsElement.textContent = '검색수: ' + displayedRows; // 표시된 행 수를 요소에 설정
        });
    });


    function editRow(button) {
        var row = button.parentNode.parentNode;
        // 행 수정 로직 추가
        console.log('Edit row:', row);
    }

    function deleteRow(button) {
        var row = button.parentNode.parentNode;
        // 행 삭제 로직 추가
        row.remove();
        console.log('Delete row:', row);
    }

    let currentEditRow = null;
    const editContainer = document.querySelector('.edit-container');

    function showEditDialog(button) {
        const row = button.parentNode.parentNode;
        const name = row.cells[0].textContent;
        const age = row.cells[1].textContent;
        const city = row.cells[2].textContent;

        document.getElementById('edit-name').value = name;
        document.getElementById('edit-age').value = age;
        document.getElementById('edit-city').value = city;

        currentEditRow = row;
        editContainer.style.display = 'block';
    }

    function hideEditDialog() {
        editContainer.style.display = 'none';
        clearEditForm();
    }

    function updateRow() {
        const name = document.getElementById('edit-name').value;
        const age = document.getElementById('edit-age').value;
        const city = document.getElementById('edit-city').value;

        currentEditRow.cells[0].textContent = name;
        currentEditRow.cells[1].textContent = age;
        currentEditRow.cells[2].textContent = city;

        hideEditDialog();
        clearEditForm();
    }

    function clearEditForm() {
        document.getElementById('edit-name').value = '';
        document.getElementById('edit-age').value = '';
        document.getElementById('edit-city').value = '';
    }
