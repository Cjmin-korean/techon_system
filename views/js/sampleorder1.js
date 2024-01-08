function valuechanged() {
    var inputElement = document.getElementById('itemprice-input');
    var inputValue = inputElement.value.replace(/,/g, ''); // Remove existing commas
    if (inputValue === '') {
        inputElement.value = '0';
    } else if (!isNaN(inputValue)) {
        var formattedValue = numberWithCommas(inputValue);
        inputElement.value = formattedValue;
    } else {
    }
}

function valuechanged1() {
    var inputElement = document.getElementById('purchaseprice-input');
    var inputValue = inputElement.value.replace(/,/g, ''); // Remove existing commas
    if (inputValue === '') {
        inputElement.value = '0';
    } else if (!isNaN(inputValue)) {
        var formattedValue = numberWithCommas(inputValue);
        inputElement.value = formattedValue;
    } else {
    }
}
