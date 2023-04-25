var cors = require('cors');


console.log('ReStart=>=>=>=>=>=>=>=ReStart=>=>=>=>=>=>=>=ReStart=>=>=>=>=>=>=>=ReStart=>=>=>=>=>=>=>=ReStart=>=>=>=>=>=>=>=ReStart=>=>=>=>=>=>=>=')
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
var port = process.env.PORT || 8080;
console.log('')
var router = require('./routes')(app);
// // [RUN SERVER]
var server = app.listen(port, function () { console.log("Express server has started on port " + port) });

// const express = require("express");
// const app = express();
const PORT = 3001;

const corsOptions = {
    origin: 'http://localhost:3001',
    credentials: true,
};
console.log('corsOptions',corsOptions)
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
    res.sendFile(__dirname + "/houseinformation.html");
});

app.get("/accountinfo", cors(), (req, res) => {
    res.sendFile(__dirname + "/accountinfo.html");
});
app.get("/department", cors(), (req, res) => {
    res.sendFile(__dirname + "/departmentinformation.html");
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
app.get("/salessearch", cors(), (req, res) => {
    res.sendFile(__dirname + "/salessearch.html");
});
app.get("/employee", cors(), (req, res) => {
    res.sendFile(__dirname + "/employee.html");
});
app.get("/materialgroup", cors(), (req, res) => {
    res.sendFile(__dirname + "/materialinfo.html");
});
app.get("/itemnamesearch", cors(), (req, res) => {
    res.sendFile(__dirname + "/materialinfo.html");
});
app.get("/materialwidthtablerow", cors(), (req, res) => {
    res.sendFile(__dirname + "/materialinfo.html");
});
app.get("/equipment", cors(), (req, res) => {
    res.sendFile(__dirname + "/equipmentinformation.html");    
});
app.get("/abcd", cors(), (req, res) => {
    res.sendFile(__dirname + "/test1.html");
});
app.get("/filesave", cors(), (req, res) => {
    res.sendFile(__dirname + "/test1.html");
});
app.get("/materialstock", cors(), (req, res) => {
    res.sendFile(__dirname + "/materialstock.html");
});
app.get("/materialoption", cors(), (req, res) => {
    res.sendFile(__dirname + "/materialinput1.html");
});
app.get("/materialbase", cors(), (req, res) => {
    res.sendFile(__dirname + "/materialbaseallinformation.html");
});
app.get("/accountnamegroup", cors(), (req, res) => {
    res.sendFile(__dirname + "/salesinformation.html");
});
app.get("/materialstockgroup", cors(), (req, res) => {
    res.sendFile(__dirname + "/materialstock2.html");
});
app.get("/iteminputgroup", cors(), (req, res) => {
    res.sendFile(__dirname + "/itemstock2.html");
});
app.get("/accounting", cors(), (req, res) => {
    res.sendFile(__dirname + "/salessearch.html");
});
app.get("/productlistinsertdata", cors(), (req, res) => {
    res.sendFile(__dirname + "/productlist1.html");
});
app.get("/accountordering", cors(), (req, res) => {
    res.sendFile(__dirname + "/productlist2.html");
});

app.get("/accountupdatedata", cors(), (req, res) => {
    res.sendFile(__dirname + "/accountinformation.html");
});
app.get("/operatingrate", cors(), (req, res) => {
    res.sendFile(__dirname + "/operatingrate.html");
});
app.get("/transference", cors(), (req, res) => {
    res.sendFile(__dirname + "/transference.html");
});
app.get("/iteminfobom", cors(), (req, res) => {
    res.sendFile(__dirname + "/bominformation.html");
});
app.get("/productorderinstruction", cors(), (req, res) => {
    res.sendFile(__dirname + "/productlist2.html");
});
app.get("/productorderlist", cors(), (req, res) => {
    res.sendFile(__dirname + "/productlist2.html");
});

app.get("/bommanagement1", cors(), (req, res) => {
    res.sendFile(__dirname + "/bominformation1.html");
});
app.get("/upload-excel", cors(), (req, res) => {
    res.sendFile(__dirname + "/test13.html");
});


app.get("/materialsoyo", cors(), (req, res) => {
    res.sendFile(__dirname + "/materialsoyo.html");
});
app.get("/materialoptiongroup", cors(), (req, res) => {
    res.sendFile(__dirname + "/materialsoyo.html");
});
app.get("/houseupdatedata", cors(), (req, res) => {
    res.sendFile(__dirname + "/house.html");
});
app.get("/iteminfoupdatedata", cors(), (req, res) => {
    res.sendFile(__dirname + "/iteminfo.html");
});
app.get("/iteminfodeletedata", cors(), (req, res) => {
    res.sendFile(__dirname + "/iteminfo.html");
});


app.get("/equipmentinsertdata", cors(), (req, res) => {
    res.sendFile(__dirname + "/equipment.html");
});
app.get("/equipmentupdatedata", cors(), (req, res) => {
    res.sendFile(__dirname + "/equipment.html");
});
app.get("/equipmentdeletedata", cors(), (req, res) => {
    res.sendFile(__dirname + "/equipment.html");
});

app.get("/managementtopicsinsertdata", cors(), (req, res) => {
    res.sendFile(__dirname + "/managementtopics.html");
});
app.get("/managementtopicsupdatedata", cors(), (req, res) => {
    res.sendFile(__dirname + "/managementtopics.html");
});
app.get("/managementtopicsdeletedata", cors(), (req, res) => {
    res.sendFile(__dirname + "/managementtopics.html");
});

app.get("/materialbaseinsertdata", cors(), (req, res) => {
    res.sendFile(__dirname + "/materialbase.html");
});
app.get("/materialbaseupdatedata", cors(), (req, res) => {
    res.sendFile(__dirname + "/materialbase.html");
});
app.get("/materialbasedeletedata", cors(), (req, res) => {
    res.sendFile(__dirname + "/materialbase.html");
});

app.get("/materialinputsave", cors(), (req, res) => {
    res.sendFile(__dirname + "/materialinputdata.html");
});
app.get("/materialoption", cors(), (req, res) => {
    res.sendFile(__dirname + "/materialinputdata.html");
});
app.get("/materialinputdeletedata", cors(), (req, res) => {
    res.sendFile(__dirname + "/materialinputdata.html");
});
app.get("/updateing", cors(), (req, res) => {
    res.sendFile(__dirname + "/productorderlist2.html");
});
// app.get("/qrprint", cors(), (req, res) => {
//     res.sendFile(__dirname + "/views/html/print.html");
// });

app.get("/alltest", cors(), (req, res) => {
    res.sendFile(__dirname + "/alltest.html");
});
app.get("/filesave", cors(), (req, res) => {
    res.sendFile(__dirname + "/test13.html");
});
app.get("/finalpercent", cors(), (req, res) => {
    res.sendFile(__dirname + "/finalpercent.html");
});
app.get("/bomchange", cors(), (req, res) => {
    res.sendFile(__dirname + "/bomchange.html");
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

app.get("/qrprint", cors(), (req, res) => {
    res.sendFile(__dirname + "/views/html/print.html");
});
// 서버 실행
// app.listen(PORT, () => {
//     console.log(`Listen : ${PORT}`);
// });
