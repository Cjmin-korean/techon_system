// Data Setting
var L = [];

var leftArry = [];
var righrArry = [];

var M1 = {num:1, data:1};
var M2 = {num:2, data:2};
var M3 = {num:2, data:3};
var M4 = {num:3, data:4};
var M5 = {num:3, data:5};
var M6 = {num:4, data:6};
var M7 = {num:5, data:7};
var M8 = {num:5, data:8};
var M9 = {num:6, data:9};
var M10 = {num:7, data:10};
L[0] = M1;
L[1] = M2;
L[2] = M3;
L[3] = M4;
L[4] = M5;
L[5] = M6;
L[6] = M7;
L[7] = M8;
L[8] = M9;
L[9] = M10;

console.log(M1);
console.log(L[0]);

// 로직 Start

var numCount = {};

L.forEach(element => {
    if (numCount[element.num]) {
        numCount[element.num]++;
    } else {
        numCount[element.num] = 1;
    }
});

var handled = {};

L.forEach(element => {
    if (numCount[element.num] > 1) {
        if (!handled[element.num]) {
            leftArry.push(element);
            handled[element.num] = true;
        } else {
            righrArry.push(element);
            numCount[element.num]--;
        }
    } else {
        leftArry.push(element);
        righrArry.push({});
    }
});

while (righrArry.length < leftArry.length) {
    righrArry.push({});
}

leftArry.forEach(element => {
    console.log('#LLLLL', element);
});

righrArry.forEach(element => {
    console.log('#RRRR', element);
});
