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
        ) || 0
    );
    $('#bomtableBody tr:eq(' + rowIndex + ') #hap-rlcut-input').val(
        Math.floor(
            parseFloat($('#bomtableBody tr:eq(' + rowIndex + ') #hap-usewidth-input').val()) /
            parseFloat($('#bomtableBody tr:eq(' + rowIndex + ') #materialwidth-input').val())
        ) || 0
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

    let materialWidth = parseFloat(materialWidthValue) || 0;
    let lengthValue = parseFloat($('#bomtableBody tr:eq(' + rowIndex + ') #length-input').val()) || 0;
    let rlcutValue = parseFloat($('#bomtableBody tr:eq(' + rowIndex + ') #rlcut-input').val()) || 0;
    let cavitySaveValue = parseFloat($('#bomtableBody tr:eq(' + rowIndex + ') #cavity-input').val()) || 0;
    let onepiddingValue = parseFloat($('#bomtableBody tr:eq(' + rowIndex + ') #onepidding-input').val()) || 0;
    let taLengthValue = parseFloat($('#bomtableBody tr:eq(' + rowIndex + ') #talength-input').val()) || 0;
    let twopiddingValue = parseFloat($('#bomtableBody tr:eq(' + rowIndex + ') #twopidding-input').val()) || 0;
    let alltaValue = parseFloat($('#bomtableBody tr:eq(' + rowIndex + ') #allta-input').val()) || 0;
    let lossValue = parseFloat($('#bomtableBody tr:eq(' + rowIndex + ') #loss-input').val()) || 0;

    let useWidthValue = parseFloat($('#bomtableBody tr:eq(' + rowIndex + ') #usewidth-input').val()) || 0;
    let hapUseWidthValue = parseFloat($('#bomtableBody tr:eq(' + rowIndex + ') #hap-usewidth-input').val()) || 0;

    let rlcutValue1 = Math.floor(useWidthValue / materialWidth) || 0;
    let rlcutValueA = Math.floor(hapUseWidthValue / materialWidth) || 0;

    let rlproductValue = ((lengthValue * 1000 * rlcutValue1 * cavitySaveValue * (1 + (lossValue / 100))) / ((onepiddingValue + taLengthValue + twopiddingValue) / alltaValue)).toFixed(0);
    rlproductValue = isFinite(rlproductValue) && !isNaN(rlproductValue) ? rlproductValue : 0;

    let rlproductValueA = ((lengthValue * 1000 * rlcutValueA * cavitySaveValue * (1 + (lossValue / 100))) / ((onepiddingValue + taLengthValue + twopiddingValue) / alltaValue)).toFixed(0);
    rlproductValueA = isFinite(rlproductValueA) && !isNaN(rlproductValueA) ? rlproductValueA : 0;

    $('#bomtableBody tr:eq(' + rowIndex + ') #rlproduct-input').val(rlproductValue);
    $('#bomtableBody tr:eq(' + rowIndex + ') #hap-rlproduct-input').val(rlproductValueA);
}

function calculateCost() {
    var currentRow = $(event.target).closest('tr');
    var rowIndex = currentRow.index();
    const rollpriceInput = $('#bomtableBody tr:eq(' + rowIndex + ') #rollprice-input');
    const rollpriceValue = parseFloat(rollpriceInput.val()) || 0;
    const rollpriceInputA = $('#bomtableBody tr:eq(' + rowIndex + ') #hap-rollprice-input');
    const rollpriceValueA = parseFloat(rollpriceInputA.val()) || 0;

    let lengthValue = parseFloat($('#bomtableBody tr:eq(' + rowIndex + ') #length-input').val()) || 0;
    let rlcutValue = parseFloat($('#bomtableBody tr:eq(' + rowIndex + ') #rlcut-input').val()) || 0;
    let lengthValueA = parseFloat($('#bomtableBody tr:eq(' + rowIndex + ') #hap-length-input').val()) || 0;
    let rlcutValueA = parseFloat($('#bomtableBody tr:eq(' + rowIndex + ') #hap-rlcut-input').val()) || 0;

    let onepiddingValue = parseFloat($('#bomtableBody tr:eq(' + rowIndex + ') #onepidding-input').val()) || 0;
    let twopiddingValue = parseFloat($('#bomtableBody tr:eq(' + rowIndex + ') #twopidding-input').val()) || 0;
    let alltaValue = parseFloat($('#bomtableBody tr:eq(' + rowIndex + ') #allta-input').val()) || 0;
    let lossValue = parseFloat($('#bomtableBody tr:eq(' + rowIndex + ') #costloss-input').val()) || 0;
    let taLengthValue = parseFloat($('#bomtableBody tr:eq(' + rowIndex + ') #talength-input').val()) || 0;
    let cavitySaveValue = parseFloat($('#bomtableBody tr:eq(' + rowIndex + ') #cavity-input').val()) || 0;

    let rlproductValue = ((lengthValue * 1000 * rlcutValue * cavitySaveValue * (1 - (lossValue / 100))) / ((onepiddingValue + taLengthValue + twopiddingValue) / alltaValue)).toFixed(0);
    rlproductValue = isFinite(rlproductValue) && !isNaN(rlproductValue) ? rlproductValue : 0;

    const costValue = rollpriceValue / rlproductValue || 0;

    let rlproductValueA = ((lengthValueA * 1000 * rlcutValueA * cavitySaveValue * (1 - (lossValue / 100))) / ((onepiddingValue + taLengthValue + twopiddingValue) / alltaValue)).toFixed(0);
    rlproductValueA = isFinite(rlproductValueA) && !isNaN(rlproductValueA) ? rlproductValueA : 0;

    const costValueA = rollpriceValueA / rlproductValueA || 0;

    // 값 설정하기
    $('#bomtableBody tr:eq(' + rowIndex + ') #cost-input').val(isFinite(costValue) && !isNaN(costValue) ? costValue.toFixed(2) : 0);
    $('#bomtableBody tr:eq(' + rowIndex + ') #hap-cost-input').val(isFinite(costValueA) && !isNaN(costValueA) ? costValueA.toFixed(2) : 0);
    $('#bomtableBody tr:eq(' + rowIndex + ') #costsum-input').val((costValue + costValueA).toFixed(2));
}


document.getElementById('cavity-save').addEventListener('input', updateCavity);

