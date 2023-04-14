var axios = require('axios');
var cors = require('cors');


console.log('ReStart=>=>=>=>=>=>=>=ReStart=>=>=>=>=>=>=>=ReStart=>=>=>=>=>=>=>=ReStart=>=>=>=>=>=>=>=ReStart=>=>=>=>=>=>=>=ReStart=>=>=>=>=>=>=>=')
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
var port = process.env.PORT || 8001;
console.log('')
var router = require('./routes')(app);
// // [RUN SERVER]
var server = app.listen(port, function () { console.log("Express server has started on port " + port) });

// const express = require("express");
// const app = express();
const PORT = 3000;

const corsOptions = {
    origin: 'http://localhost:3000',
    credentials: true,
};

app.use(cors(corsOptions));
// 정적 파일 불러오기
app.use(express.static(__dirname + "/views"));

// 라우팅 정의.start.html
app.get("/", cors(), (req, res) => {
    res.sendFile(__dirname + "/index.html");
});
app.get("/config.json", cors(), (req, res) => {
    res.sendFile(__dirname + "/config.json");
});
app.get("/main", cors(), (req, res) => {
    res.sendFile(__dirname + "/views/html/menu.html");
});

app.get("/house", cors(), (req, res) => {
    res.sendFile(__dirname + "/house.html");
});

app.get("/accountinfo", cors(), (req, res) => {
    res.sendFile(__dirname + "/accountinfo.html");
});
app.get("/department", cors(), (req, res) => {
    res.sendFile(__dirname + "/department.html");
});
app.get("/iteminfo", cors(), (req, res) => {
    res.sendFile(__dirname + "/itmeinfo.html");
});
app.get("/materialinfo", cors(), (req, res) => {
    res.sendFile(__dirname + "/materialinfo.html");
});
app.get("/baseinfolow", cors(), (req, res) => {
    res.sendFile(__dirname + "/materialinput.html");
});
app.get("/productorder", cors(), (req, res) => {
    res.sendFile(__dirname + "/productorderlist.html");
});
app.get("/materialstock", cors(), (req, res) => {
    res.sendFile(__dirname + "/materialstock.html");
});

app.get("/qrprint", cors(), (req, res) => {
    res.sendFile(__dirname + "/views/html/print.html");
});


app.get("/jquery.min.js", cors(), (req, res) => {
    res.sendFile(__dirname + "/views/html/jquery.min.js");
});
app.get("/qrcode.js", cors(), (req, res) => {
    res.sendFile(__dirname + "/views/html/qrcode.js");
});
app.get("/qrcode.min.js", cors(), (req, res) => {
    res.sendFile(__dirname + "/views/html/qrcode.min.js");
});

// 서버 실행
app.listen(PORT, () => {
    console.log(`Listen : ${PORT}`);
});
