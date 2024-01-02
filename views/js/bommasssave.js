//cavity 변동
function updateCavity() {
    const cavitySaveValue = parseFloat($("#cavity-save").val()) || 0;
    const taInputValue = cavitySaveValue !== 0 ? (1 / cavitySaveValue) : 0;

    $("[id='cavity-input']").val(cavitySaveValue);
    
}



function updateRlcutValue() {
    var currentRow = $(event.target).closest('tr');
    var rowIndex = currentRow.index();
    $('#bomtableBody tr:eq(' + rowIndex + ') #rlcut-input').val(
        Math.floor(
            parseFloat($('#bomtableBody tr:eq(' + rowIndex + ') #usewidth-input').val()) /
            parseFloat($('#bomtableBody tr:eq(' + rowIndex + ') #materialwidth-input').val())
        )
    );
}


function updateSoyoValue() {
    var currentRow = $(event.target).closest('tr');
    var rowIndex = currentRow.index();
    const taValue = parseFloat($('#bomtableBody tr:eq(' + rowIndex + ') #ta-input').val()) || 0;
    const onepiddingValue = parseFloat($('#bomtableBody tr:eq(' + rowIndex + ') #onepidding-input').val()) || 0;
    const taLengthValue = parseFloat($('#bomtableBody tr:eq(' + rowIndex + ') #talength-input').val()) || 0;
    const twopiddingValue = parseFloat($('#bomtableBody tr:eq(' + rowIndex + ') #twopidding-input').val()) || 0;
    const alltaValue = parseFloat($('#bomtableBody tr:eq(' + rowIndex + ') #allta-input').val()) || 0;
    const lossValue = parseFloat($('#bomtableBody tr:eq(' + rowIndex + ') #loss-input').val()) || 0;

    let soyoValue = (taValue * ((onepiddingValue + taLengthValue + twopiddingValue) / alltaValue) * 0.001 * (1 + (lossValue / 100))).toFixed(4);
    soyoValue = soyoValue.replace(/\.?0+$/, '');

    $('#bomtableBody tr:eq(' + rowIndex + ') #soyo-input').val(soyoValue);
}

function updateRlProduct() {
    var currentRow = $(event.target).closest('tr');
    var rowIndex = currentRow.index();

    let materialWidthValue = $('#bomtableBody tr:eq(' + rowIndex + ') #materialwidth-input').val().trim();
    if (materialWidthValue === '') {
        return;
    }

    let materialWidth = parseFloat(materialWidthValue);
    let lengthValue = parseFloat($('#bomtableBody tr:eq(' + rowIndex + ') #length-input').val()) || 0;
    let rlcutValue = parseFloat($('#bomtableBody tr:eq(' + rowIndex + ') #rlcut-input').val()) || 0;
    let cavitySaveValue = parseFloat($('#bomtableBody tr:eq(' + rowIndex + ') #cavity-input').val()) || 0;
    let onepiddingValue = parseFloat($('#bomtableBody tr:eq(' + rowIndex + ') #onepidding-input').val()) || 0;
    let taLengthValue = parseFloat($('#bomtableBody tr:eq(' + rowIndex + ') #talength-input').val()) || 0;
    let twopiddingValue = parseFloat($('#bomtableBody tr:eq(' + rowIndex + ') #twopidding-input').val()) || 0;
    let alltaValue = parseFloat($('#bomtableBody tr:eq(' + rowIndex + ') #allta-input').val()) || 0;
    let lossValue = parseFloat($('#bomtableBody tr:eq(' + rowIndex + ') #loss-input').val()) || 0;

    let rlcutValue1 = Math.floor(
        parseFloat($('#bomtableBody tr:eq(' + rowIndex + ') #usewidth-input').val()) /
        parseFloat($('#bomtableBody tr:eq(' + rowIndex + ') #materialwidth-input').val())
    )
    let rlproductValue = ((lengthValue * 1000 * rlcutValue1 * cavitySaveValue * (1 + (lossValue / 100))) / ((onepiddingValue + taLengthValue + twopiddingValue) / alltaValue)).toFixed(0);

    $('#bomtableBody tr:eq(' + rowIndex + ') #rlproduct-input').val(rlproductValue);
}

function calculateCost() {
    var currentRow = $(event.target).closest('tr');
    var rowIndex = currentRow.index();
    const rollpriceInput = $('#bomtableBody tr:eq(' + rowIndex + ') #rollprice-input');
    const rollpriceValue = parseFloat(rollpriceInput.val()) || 0;

    let lengthValue = parseFloat($('#bomtableBody tr:eq(' + rowIndex + ') #length-input').val()) || 0;
    let rlcutValue = parseFloat($('#bomtableBody tr:eq(' + rowIndex + ') #rlcut-input').val()) || 0;
    let cavitySaveValue = parseFloat($('#bomtableBody tr:eq(' + rowIndex + ') #cavity-input').val()) || 0;
    let onepiddingValue = parseFloat($('#bomtableBody tr:eq(' + rowIndex + ') #onepidding-input').val()) || 0;
    let taLengthValue = parseFloat($('#bomtableBody tr:eq(' + rowIndex + ') #talength-input').val()) || 0;
    let twopiddingValue = parseFloat($('#bomtableBody tr:eq(' + rowIndex + ') #twopidding-input').val()) || 0;
    let alltaValue = parseFloat($('#bomtableBody tr:eq(' + rowIndex + ') #allta-input').val()) || 0;
    let lossValue = parseFloat($('#bomtableBody tr:eq(' + rowIndex + ') #loss-input').val()) || 0;

    let rlproductValue = ((lengthValue * 1000 * rlcutValue * cavitySaveValue * (1 + (lossValue / 100))) / ((onepiddingValue + taLengthValue + twopiddingValue) / alltaValue)).toFixed(0);
    const costValue = rollpriceValue / rlproductValue;
    $('#bomtableBody tr:eq(' + rowIndex + ') #cost-input').val(costValue.toFixed(2));
}
document.getElementById('cavity-save').addEventListener('input', updateCavity);

