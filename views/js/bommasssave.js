//cavity 변동
function updateCavityInputs() {
    const cavitySaveValue = parseFloat($("#cavity-save").val()) || 0;
    const taInputValue = cavitySaveValue !== 0 ? (1 / cavitySaveValue) : 0;

    $("[id='cavity-input']").val(cavitySaveValue);
    
}

function updateRlcutValueinput() {
    var currentRow = $(event.target).closest('tr');
    var rowIndex = currentRow.index();
    $('#bomtableBody-input tr:eq(' + rowIndex + ') #rlcut-input').val(
        Math.floor(
            parseFloat($('#bomtableBody-input tr:eq(' + rowIndex + ') #usewidth-input').val()) /
            parseFloat($('#bomtableBody-input tr:eq(' + rowIndex + ') #materialwidth-input').val())
        )
    );
}

function updateSoyoValueinput() {
    var currentRow = $(event.target).closest('tr');
    var rowIndex = currentRow.index();
    const taValue = parseFloat($('#bomtableBody-input tr:eq(' + rowIndex + ') #ta-input').val()) || 0;
    const onepiddingValue = parseFloat($('#bomtableBody-input tr:eq(' + rowIndex + ') #onepidding-input').val()) || 0;
    const taLengthValue = parseFloat($('#bomtableBody-input tr:eq(' + rowIndex + ') #talength-input').val()) || 0;
    const twopiddingValue = parseFloat($('#bomtableBody-input tr:eq(' + rowIndex + ') #twopidding-input').val()) || 0;
    const alltaValue = parseFloat($('#bomtableBody-input tr:eq(' + rowIndex + ') #allta-input').val()) || 0;
    const lossValue = parseFloat($('#bomtableBody-input tr:eq(' + rowIndex + ') #loss-input').val()) || 0;

    let soyoValue = (taValue * ((onepiddingValue + taLengthValue + twopiddingValue) / alltaValue) * 0.001 * (1 + (lossValue / 100))).toFixed(4);
    soyoValue = soyoValue.replace(/\.?0+$/, '');

    $('#bomtableBody-input tr:eq(' + rowIndex + ') #soyo-input').val(soyoValue);
}

function updateRlProductInputinput() {
    var currentRow = $(event.target).closest('tr');
    var rowIndex = currentRow.index();

    let materialWidthValue = $('#bomtableBody-input tr:eq(' + rowIndex + ') #materialwidth-input').val().trim();
    if (materialWidthValue === '') {
        return;
    }

    let materialWidth = parseFloat(materialWidthValue);
    let lengthValue = parseFloat($('#bomtableBody-input tr:eq(' + rowIndex + ') #length-input').val()) || 0;
    let rlcutValue = parseFloat($('#bomtableBody-input tr:eq(' + rowIndex + ') #rlcut-input').val()) || 0;
    let cavitySaveValue = parseFloat($('#bomtableBody-input tr:eq(' + rowIndex + ') #cavity-input').val()) || 0;
    let onepiddingValue = parseFloat($('#bomtableBody-input tr:eq(' + rowIndex + ') #onepidding-input').val()) || 0;
    let taLengthValue = parseFloat($('#bomtableBody-input tr:eq(' + rowIndex + ') #talength-input').val()) || 0;
    let twopiddingValue = parseFloat($('#bomtableBody-input tr:eq(' + rowIndex + ') #twopidding-input').val()) || 0;
    let alltaValue = parseFloat($('#bomtableBody-input tr:eq(' + rowIndex + ') #allta-input').val()) || 0;
    let lossValue = parseFloat($('#bomtableBody-input tr:eq(' + rowIndex + ') #loss-input').val()) || 0;

    let rlcutValue1 = Math.floor(
        parseFloat($('#bomtableBody-input tr:eq(' + rowIndex + ') #usewidth-input').val()) /
        parseFloat($('#bomtableBody-input tr:eq(' + rowIndex + ') #materialwidth-input').val())
    )
    let rlproductValue = ((lengthValue * 1000 * rlcutValue1 * cavitySaveValue * (1 + (lossValue / 100))) / ((onepiddingValue + taLengthValue + twopiddingValue) / alltaValue)).toFixed(0);

    $('#bomtableBody-input tr:eq(' + rowIndex + ') #rlproduct-input').val(rlproductValue);
}

function calculateCostinput() {
    var currentRow = $(event.target).closest('tr');
    var rowIndex = currentRow.index();
    const rollpriceInput = $('#bomtableBody-input tr:eq(' + rowIndex + ') #rollprice-input');
    const rollpriceValue = parseFloat(rollpriceInput.val()) || 0;

    let lengthValue = parseFloat($('#bomtableBody-input tr:eq(' + rowIndex + ') #length-input').val()) || 0;
    let rlcutValue = parseFloat($('#bomtableBody-input tr:eq(' + rowIndex + ') #rlcut-input').val()) || 0;
    let cavitySaveValue = parseFloat($('#bomtableBody-input tr:eq(' + rowIndex + ') #cavity-input').val()) || 0;
    let onepiddingValue = parseFloat($('#bomtableBody-input tr:eq(' + rowIndex + ') #onepidding-input').val()) || 0;
    let taLengthValue = parseFloat($('#bomtableBody-input tr:eq(' + rowIndex + ') #talength-input').val()) || 0;
    let twopiddingValue = parseFloat($('#bomtableBody-input tr:eq(' + rowIndex + ') #twopidding-input').val()) || 0;
    let alltaValue = parseFloat($('#bomtableBody-input tr:eq(' + rowIndex + ') #allta-input').val()) || 0;
    let lossValue = parseFloat($('#bomtableBody-input tr:eq(' + rowIndex + ') #loss-input').val()) || 0;

    let rlproductValue = ((lengthValue * 1000 * rlcutValue * cavitySaveValue * (1 + (lossValue / 100))) / ((onepiddingValue + taLengthValue + twopiddingValue) / alltaValue)).toFixed(0);
    const costValue = rollpriceValue / rlproductValue;
    $('#bomtableBody-input tr:eq(' + rowIndex + ') #cost-input').val(costValue.toFixed(2));
}
document.getElementById('cavity-save').addEventListener('input', updateCavityInputs);

