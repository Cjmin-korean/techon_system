//cavity 변동
function updateCavityInputsedit() {
    const cavitySaveValue = parseFloat($("#cavity-edit").val()) || 0;
    const taInputValue = cavitySaveValue !== 0 ? (1 / cavitySaveValue) : 0;
    // $("#ordercount-edit").val(cavitySaveValue);

    $("[id='cavity-edit']").val(cavitySaveValue);
    // updateRlcutValueedit();
    // updateSoyoValueedit();
    // updateRlProductInputedit();
    // calculateCostedit();
}

function updateRlcutValueedit() {
    var currentRow = $(event.target).closest('tr');
    var rowIndex = currentRow.index();
    $('#bomtableBody-edit tr:eq(' + rowIndex + ') #rlcut-edit').val(
        Math.floor(
            parseFloat($('#bomtableBody-edit tr:eq(' + rowIndex + ') #usewidth-edit').val()) /
            parseFloat($('#bomtableBody-edit tr:eq(' + rowIndex + ') #materialwidth-edit').val())
        )
    );
}

function updateSoyoValueedit() {
    var currentRow = $(event.target).closest('tr');
    var rowIndex = currentRow.index();
    const taValue = parseFloat($('#bomtableBody-edit tr:eq(' + rowIndex + ') #ta-edit').val()) || 0;
    const onepiddingValue = parseFloat($('#bomtableBody-edit tr:eq(' + rowIndex + ') #onepidding-edit').val()) || 0;
    const taLengthValue = parseFloat($('#bomtableBody-edit tr:eq(' + rowIndex + ') #talength-edit').val()) || 0;
    const twopiddingValue = parseFloat($('#bomtableBody-edit tr:eq(' + rowIndex + ') #twopidding-edit').val()) || 0;
    const alltaValue = parseFloat($('#bomtableBody-edit tr:eq(' + rowIndex + ') #allta-edit').val()) || 0;
    const lossValue = parseFloat($('#bomtableBody-edit tr:eq(' + rowIndex + ') #loss-edit').val()) || 0;

    let soyoValue = (taValue * ((onepiddingValue + taLengthValue + twopiddingValue) / alltaValue) * 0.001 * (1 + (lossValue / 100))).toFixed(4);
    soyoValue = soyoValue.replace(/\.?0+$/, '');

    $('#bomtableBody-edit tr:eq(' + rowIndex + ') #soyo-edit').val(soyoValue);
}

function updateRlProductInputedit() {
    var currentRow = $(event.target).closest('tr');
    var rowIndex = currentRow.index();

    let materialWidthValue = $('#bomtableBody-edit tr:eq(' + rowIndex + ') #materialwidth-edit').val().trim();
    if (materialWidthValue === '') {
        return;
    }

    let materialWidth = parseFloat(materialWidthValue);
    let lengthValue = parseFloat($('#bomtableBody-edit tr:eq(' + rowIndex + ') #length-edit').val()) || 0;
    let rlcutValue = parseFloat($('#bomtableBody-edit tr:eq(' + rowIndex + ') #rlcut-edit').val()) || 0;
    let cavitySaveValue = parseFloat($('#bomtableBody-edit tr:eq(' + rowIndex + ') #cavity-edit').val()) || 0;
    let onepiddingValue = parseFloat($('#bomtableBody-edit tr:eq(' + rowIndex + ') #onepidding-edit').val()) || 0;
    let taLengthValue = parseFloat($('#bomtableBody-edit tr:eq(' + rowIndex + ') #talength-edit').val()) || 0;
    let twopiddingValue = parseFloat($('#bomtableBody-edit tr:eq(' + rowIndex + ') #twopidding-edit').val()) || 0;
    let alltaValue = parseFloat($('#bomtableBody-edit tr:eq(' + rowIndex + ') #allta-edit').val()) || 0;
    let lossValue = parseFloat($('#bomtableBody-edit tr:eq(' + rowIndex + ') #loss-edit').val()) || 0;

    let rlcutValue1 = Math.floor(
        parseFloat($('#bomtableBody-edit tr:eq(' + rowIndex + ') #usewidth-edit').val()) /
        parseFloat($('#bomtableBody-edit tr:eq(' + rowIndex + ') #materialwidth-edit').val())
    )
    let rlproductValue = ((lengthValue * 1000 * rlcutValue1 * cavitySaveValue * (1 + (lossValue / 100))) / ((onepiddingValue + taLengthValue + twopiddingValue) / alltaValue)).toFixed(0);

    $('#bomtableBody-edit tr:eq(' + rowIndex + ') #rlproduct-edit').val(rlproductValue);
}

function calculateCostedit() {
    var currentRow = $(event.target).closest('tr');
    var rowIndex = currentRow.index();
    const rollpriceInput = $('#bomtableBody-edit tr:eq(' + rowIndex + ') #rollprice-edit');
    const rollpriceValue = parseFloat(rollpriceInput.val()) || 0;

    let lengthValue = parseFloat($('#bomtableBody-edit tr:eq(' + rowIndex + ') #length-edit').val()) || 0;
    let rlcutValue = parseFloat($('#bomtableBody-edit tr:eq(' + rowIndex + ') #rlcut-edit').val()) || 0;
    let cavitySaveValue = parseFloat($('#bomtableBody-edit tr:eq(' + rowIndex + ') #cavity-edit').val()) || 0;
    let onepiddingValue = parseFloat($('#bomtableBody-edit tr:eq(' + rowIndex + ') #onepidding-edit').val()) || 0;
    let taLengthValue = parseFloat($('#bomtableBody-edit tr:eq(' + rowIndex + ') #talength-edit').val()) || 0;
    let twopiddingValue = parseFloat($('#bomtableBody-edit tr:eq(' + rowIndex + ') #twopidding-edit').val()) || 0;
    let alltaValue = parseFloat($('#bomtableBody-edit tr:eq(' + rowIndex + ') #allta-edit').val()) || 0;
    let lossValue = parseFloat($('#bomtableBody-edit tr:eq(' + rowIndex + ') #loss-edit').val()) || 0;

    let rlproductValue = ((lengthValue * 1000 * rlcutValue * cavitySaveValue * (1 + (lossValue / 100))) / ((onepiddingValue + taLengthValue + twopiddingValue) / alltaValue)).toFixed(0);
    const costValue = rollpriceValue / rlproductValue;
    $('#bomtableBody-edit tr:eq(' + rowIndex + ') #cost-edit').val(costValue.toFixed(2));
}
document.getElementById('cavity-edit').addEventListener('input', updateCavityInputsedit);
