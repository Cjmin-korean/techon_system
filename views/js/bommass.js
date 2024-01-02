var workpartSaveInput = document.getElementById('workpart-save');
var typeSaveInput = document.getElementById('type-save');
var directionSaveInput = document.getElementById('direction-save');

addUserInputOption(workpartSaveInput);
addUserInputOption(typeSaveInput);
addUserInputOption(directionSaveInput);

function addUserInputOption(combinedInput) {
    var inputOption = document.createElement('option');
    inputOption.value = 'userInput';
    inputOption.text = '직접 입력';
    combinedInput.add(inputOption);

    combinedInput.addEventListener('change', function () {
        var userInputOption = 'userInput';
        var selectedOption = combinedInput.value;

        if (selectedOption === userInputOption) {
            var userInput = prompt('데이터를 입력하세요:');

            if (userInput !== null && userInput.trim() !== '') {
                var newOption = document.createElement('option');
                newOption.value = userInput;
                newOption.text = userInput;
                combinedInput.add(newOption);
                combinedInput.value = userInput;
            } else {
                combinedInput.value = '';
            }
        }
    });
}
var workparedit = document.getElementById('workpart-edit');
var typeedit = document.getElementById('type-edit');
var directionedit = document.getElementById('direction-edit');

addUserInputOption(workparedit);
addUserInputOption(typeedit);
addUserInputOption(directionedit);

function addUserInputOption(combinedInput1) {
    var inputOption = document.createElement('option');
    inputOption.value = 'userInput';
    inputOption.text = '직접 입력';
    combinedInput1.add(inputOption);

    combinedInput1.addEventListener('change', function () {
        var userInputOption = 'userInput';
        var selectedOption = combinedInput1.value;

        if (selectedOption === userInputOption) {
            var userInput = prompt('데이터를 입력하세요:');

            if (userInput !== null && userInput.trim() !== '') {
                var newOption = document.createElement('option');
                newOption.value = userInput;
                newOption.text = userInput;
                combinedInput1.add(newOption);
                combinedInput1.value = userInput;
            } else {
                combinedInput1.value = '';
            }
        }
    });
}
