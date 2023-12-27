//cavity 변동
function updateCavityInputs() {
    const cavitySaveValue = parseFloat($("#cavity-save").val()) || 0;
    const taInputValue = cavitySaveValue !== 0 ? (1 / cavitySaveValue) : 0;
    $("#ordercount-save").val(cavitySaveValue);

    $("[id='cavity-input']").val(cavitySaveValue);

}
//컷수 구하기
function updateRlcutValue() {
    var currentRow = $(event.target).closest('tr');
    var rowIndex = currentRow.index();
    $('#bomtableBody tr:eq(' + rowIndex + ') #rlcut-input').val(
        Math.floor(
            parseFloat($('#bomtableBody tr:eq(' + rowIndex + ') #usewidth-input').val().replace(/,/g, '')) /
            parseFloat($('#bomtableBody tr:eq(' + rowIndex + ') #materialwidth-input').val().replace(/,/g, ''))
        )
    );
}
//소요량구하기
function updateSoyoValue() {
    var currentRow = $(event.target).closest('tr');
    var rowIndex = currentRow.index();
    const taValue = parseFloat($('#bomtableBody tr:eq(' + rowIndex + ') #ta-input').val().replace(/,/g, '')) || 0;
    const onepiddingValue = parseFloat($('#bomtableBody tr:eq(' + rowIndex + ') #onepidding-input').val().replace(/,/g, '')) || 0;
    const taLengthValue = parseFloat($('#bomtableBody tr:eq(' + rowIndex + ') #talength-input').val().replace(/,/g, '')) || 0;
    const twopiddingValue = parseFloat($('#bomtableBody tr:eq(' + rowIndex + ') #twopidding-input').val().replace(/,/g, '')) || 0;
    const alltaValue = parseFloat($('#bomtableBody tr:eq(' + rowIndex + ') #allta-input').val().replace(/,/g, '')) || 0;
    const lossValue = parseFloat($('#bomtableBody tr:eq(' + rowIndex + ') #loss-input').val().replace(/,/g, '')) || 0;

    let soyoValue = (taValue * ((onepiddingValue + taLengthValue + twopiddingValue) / alltaValue) * 0.001 * (1 + (lossValue / 100))).toFixed(4);

    soyoValue = soyoValue.replace(/\.?0+$/, '');

    $('#bomtableBody tr:eq(' + rowIndex + ') #soyo-input').val(soyoValue);
}
//1RL생산수량 구하기
function updateRlProductInput() {
    var currentRow = $(event.target).closest('tr');
    var rowIndex = currentRow.index();

    // Check if materialwidth-input is empty
    let materialWidthValue = $('#bomtableBody tr:eq(' + rowIndex + ') #materialwidth-input').val().trim();
    if (materialWidthValue === '') {
        // If materialwidth-input is empty, you can decide to do nothing or handle it accordingly
        return;
    }

    // Convert materialwidth-input value to a number
    let materialWidth = parseFloat(materialWidthValue);

    // Rest of your existing code...
    let lengthValue = parseFloat($('#bomtableBody tr:eq(' + rowIndex + ') #length-input').val());
    let rlcutValue = parseFloat($('#bomtableBody tr:eq(' + rowIndex + ') #rlcut-input').val());
    let cavitySaveValue = parseFloat($('#bomtableBody tr:eq(' + rowIndex + ') #cavity-input').val());
    let onepiddingValue = parseFloat($('#bomtableBody tr:eq(' + rowIndex + ') #onepidding-input').val());
    let taLengthValue = parseFloat($('#bomtableBody tr:eq(' + rowIndex + ') #talength-input').val());
    let twopiddingValue = parseFloat($('#bomtableBody tr:eq(' + rowIndex + ') #twopidding-input').val());
    let alltaValue = parseFloat($('#bomtableBody tr:eq(' + rowIndex + ') #allta-input').val());
    let lossValue = parseFloat($('#bomtableBody tr:eq(' + rowIndex + ') #loss-input').val());

    let rlcutValue1 = Math.floor(
        parseFloat($('#bomtableBody tr:eq(' + rowIndex + ') #usewidth-input').val().replace(/,/g, '')) /
        parseFloat($('#bomtableBody tr:eq(' + rowIndex + ') #materialwidth-input').val().replace(/,/g, ''))
    )
    let rlproductValue = ((lengthValue * 1000 * rlcutValue1 * cavitySaveValue * (1 + (lossValue / 100))) / ((onepiddingValue + taLengthValue + twopiddingValue) / alltaValue)).toFixed(0);

    // Update rlproduct-input value
    $('#bomtableBody tr:eq(' + rowIndex + ') #rlproduct-input').val(rlproductValue);
    // calculateCost();
}
function calculateCost() {
    var currentRow = $(event.target).closest('tr');
    var rowIndex = currentRow.index();
    const rollpriceInput = $('#bomtableBody tr:eq(' + rowIndex + ') #rollprice-input');
    const rollpriceValue = parseFloat(rollpriceInput.val().replace(/,/g, '')) || 0;
    let lengthValue = parseFloat($('#bomtableBody tr:eq(' + rowIndex + ') #length-input').val())
    let rlcutValue = parseFloat($('#bomtableBody tr:eq(' + rowIndex + ') #rlcut-input').val())
    let cavitySaveValue = parseFloat($('#bomtableBody tr:eq(' + rowIndex + ') #cavity-input').val())
    let onepiddingValue = parseFloat($('#bomtableBody tr:eq(' + rowIndex + ') #onepidding-input').val())
    let taLengthValue = parseFloat($('#bomtableBody tr:eq(' + rowIndex + ') #talength-input').val())
    let twopiddingValue = parseFloat($('#bomtableBody tr:eq(' + rowIndex + ') #twopidding-input').val())
    let alltaValue = parseFloat($('#bomtableBody tr:eq(' + rowIndex + ') #allta-input').val())
    let lossValue = parseFloat($('#bomtableBody tr:eq(' + rowIndex + ') #loss-input').val())

    let rlproductValue = ((lengthValue * 1000 * rlcutValue * cavitySaveValue * (1 + (lossValue / 100))) / ((onepiddingValue + taLengthValue + twopiddingValue) / alltaValue)).toFixed(0);
    const costValue = rollpriceValue / rlproductValue;
    $('#bomtableBody tr:eq(' + rowIndex + ') #cost-input').val(costValue.toFixed(2));
}