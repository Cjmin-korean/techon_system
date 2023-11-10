// routes/index.jsvert
const multer = require('multer');
const xlsx = require('xlsx');
const fs = require('fs');
const sql = require("mssql");
module.exports = function (app) {
    const sql = require('mssql');
    var config = {
        user: 'pswel1',
        password: '1234',
        server: '118.46.215.214',
        database: 'Techon',
        // connectTimeout: 10000,
        // stream: false,
        options: {
            encrypt: false,
            enableArithAbort: true
        }
    };


    // **** start
    sql.connect(config).then(pool => {
        app.post('/api/users', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");
            // console.log('req', req)
            console.log('req body', req.body)


            var nameid = req.body.nameid;
            var password = req.body.password;

            console.log(nameid)
            console.log(password)

            // console.log('req',req)
            return pool.request()
                .input('nameid', sql.NVarChar, nameid)
                .query(
                    'SELECT ' +
                    'password, ' +
                    'name, ' +
                    'part ' +
                    'FROM member where nameid = @nameid')
                .then(result => {
                    // console.log('result',result)
                    // console.log('이름 :', result.recordset[0].name)
                    var judgment = 'NG';
                    if (password == result.recordset[0].password) {
                        judgment = 'OK';
                        res.json({
                            judgment: judgment,
                            name: result.recordset[0].name,
                            part: result.recordset[0].part
                        });
                    } else {
                        res.json({
                            judgment: judgment,
                        });
                    }

                    res.end();
                });
        });
    });
    // **** finish


    const upload = multer({ dest: 'uploads/' });

    app.post('/upload-excel', upload.single('excelFile'), (req, res) => {
        // 클라이언트가 업로드한 파일을 읽음


        const workbook = xlsx.readFile(req.file.path);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const buffer = Buffer.from(xlsx.utils.sheet_to_csv(worksheet));

        // SQL Server에 연결하여 파일 삽입
        sql.connect(config).then(() => {
            const request = new sql.Request();
            request.input('filename', sql.NVarChar(sql.MAX), workbook.name);
            request.input('filedata', sql.VarBinary(sql.MAX), buffer);
            request.query('INSERT INTO filesave (filename,filedata) VALUES (@filename,@filedata)', (err, result) => {
                if (err) {
                    console.log(err);
                    res.status(500).send('파일 삽입 실패');
                } else {
                    console.log('File inserted successfully!');
                    res.send('파일 업로드 및 삽입 완료');
                }
            });
        }).catch((err) => {
            console.log(err);
            res.status(500).send('서버 오류');
        });

        // 업로드된 파일 삭제
        fs.unlink(req.file.path, (err) => {
            if (err) console.log(err);
        });
    });


    // const downloadPath = '/Users/cjh/Downloads/Techon/sshkey_1'; // 다운로드 받을 경로


    app.get('/down-excel', (req, res) => {
        sql.connect(config)
            .then(() => {
                const request = new sql.Request();
                const id = 7; // 바이너리 파일을 불러올 파일 ID
                request.query(`SELECT filename, filedata FROM filesave WHERE id=${id}`, (err, result) => {
                    if (err) {
                        console.log(err);
                        res.status(500).send('서버 오류');
                    } else {
                        const filename = result.recordset[0].filename;
                        const filedata = result.recordset[0].filedata;
                        console.log('filename', filename);
                        console.log('filedata', filedata);

                        // 파일 저장
                        const newFilename = req.query.download || filename;
                        fs.writeFile(`${newFilename}`, filedata, 'binary', (err) => {
                            if (err) {
                                console.log(err);
                                res.status(500).send('파일 저장 실패');
                            } else {
                                console.log('File saved successfully!');
                                // 파일 다운로드
                                res.download(`${newFilename}`, newFilename, (err) => {
                                    if (err) {
                                        console.log(err);
                                        res.status(500).send('파일 다운로드 실패');
                                    }
                                });
                            }
                        });
                    }
                });
            })
        //   .catch((err) => {
        //     console.log(err);
        //     res.status(500).send('서버 오류');
        //   });
    });


    app.get('/down-excel/1', (req, res) => {
        sql.connect(config)
            .then(() => {
                const request = new sql.Request();
                const id = 13; // 바이너리 파일을 불러올 파일 ID
                request.query(`SELECT filename, filedata FROM filesave WHERE id=${id}`, (err, result) => {
                    if (err) {
                        console.log(err);
                        res.status(500).send('서버 오류');
                    } else {
                        const filename = result.recordset[0].filename;
                        const filedata = result.recordset[0].filedata;
                        console.log('filename', filename);
                        console.log('filedata', filedata);

                        // 파일 저장
                        const newFilename = req.query.download || filename;
                        fs.writeFile(`${newFilename}`, filedata, 'binary', (err) => {
                            if (err) {
                                console.log(err);
                                res.status(500).send('파일 저장 실패');
                            } else {
                                console.log('File saved successfully!');
                                // 파일 다운로드
                                res.download(`${newFilename}`, newFilename, (err) => {
                                    if (err) {
                                        console.log(err);
                                        res.status(500).send('파일 다운로드 실패');
                                    }
                                });
                            }
                        });
                    }
                });
            })
        //   .catch((err) => {
        //     console.log(err);
        //     res.status(500).send('서버 오류');
        //   });
    });


    // **** start
    sql.connect(config).then(pool => {
        app.post('/api/finalpercent', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()

                .query(
                    " SELECT " +
                    " a.contentname, " +
                    " a.bomno, " +
                    " a.accountdate, " +
                    " c.startdate, " +
                    " c.lotno, " +
                    " c.marchine, " +
                    " a.customer, " +
                    " a.modelname, " +
                    " a.itemname, " +
                    " a.quantity, " +
                    " c.quantity as productquantity, " +
                    " b.itemprice, " +
                    " b.onepidding, " +
                    " b.cavity, " +
                    " (c.quantity / CAST(b.cavity AS FLOAT) * CAST(b.onepidding AS FLOAT)) * 0.001 as P, " +
                    " e.materialinput as Q, " +
                    " e.materialoutput as R, " +
                    " (e.materialinput - e.materialoutput) as S, " +
                    " (CEILING((e.materialinput - e.materialoutput)/ b.onepidding * b.cavity *1000)) as T, " +
                    " (CEILING((e.materialinput - e.materialoutput)/ b.onepidding * b.cavity *1000)* b.itemprice) as U, " +
                    " (c.touch) as V, " +
                    " (c.touch * b.cavity) as W, " +
                    " (c.touch * b.cavity * b.itemprice) as X, " +
                    " (CEILING((c.touch * b.cavity)/((e.materialinput - e.materialoutput)/ b.onepidding * b.cavity *1000) *100)) as Y, " +
                    " d.ngcount as Z, " +
                    " (CEILING((e.materialinput - e.materialoutput)/ b.onepidding * b.cavity *1000)-d.okcount)*b.itemprice as AA, " +
                    " d.okcount as AB, " +
                    " (CEILING((e.materialinput - e.materialoutput)/ b.onepidding * b.cavity *1000)- d.okcount) as AC, " +
                    " (CEILING((c.touch * b.cavity - d.ngcount)/((e.materialinput - e.materialoutput)/ b.onepidding * b.cavity *1000)*100)) as AD, " +
                    " e.materialname" +
                    " FROM " +
                    "    accountinput a  " +
                    "    LEFT OUTER JOIN iteminfo b ON a.bomno = b.bomno   " +
                    "    LEFT OUTER JOIN orderlist c ON a.contentname = c.contentname   " +
                    "    LEFT OUTER JOIN alltest d ON c.lotno = d.lotno " +
                    "    LEFT OUTER JOIN bommanagement1 e ON e.pono = a.contentname  " +
                    "WHERE " +
                    "    e.classification = '메인자재'  and e.lotno= c.lotno  order by c.lotno asc"
                )

                .then(result => {
                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** finish

    // **** start       
    sql.connect(config).then(pool => {
        app.post('/api/all', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()

                .query(
                    "   select " +
                    "    a.contentname, " +
                    "    a.accountdate, " +
                    "    a.deliverydate, " +
                    "    a.customer, " +
                    "    a.bomno, " +
                    "    a.modelname, " +
                    "    a.itemname, " +
                    "    a.itemprice, " +
                    "    a.itemcost, " +
                    "    ROUND(a.itemprice/a.itemcost * 100,1) as 'costpc', " +
                    "    format(convert(int,Isnull(a.quantity,0)),'##,##0')'accountinputquantity', " +
                    "    format(convert(int,Isnull(a.price,0)),'##,##0')'price', " +
                    "    o.productdate, " +
                    "    o.lotno, " +
                    "    o.marchine, " +
                    "    format(convert(int,Isnull(o.quantity,0)),'##,##0')'orderlistquantity' " +

                    "    from orderlist o, " +
                    "    accountinput a " +
                    "    where a.contentname = o.contentname ")

                .then(result => {
                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** finish

    // **** start       
    sql.connect(config).then(pool => {
        app.post('/api/deleteaccount', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()
                .input('contentname', sql.NVarChar, req.body.contentname)
                .query(
                    " delete from accountinput where contentname=@contentname")

                .then(result => {
                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** finish
    // **** start       
    sql.connect(config).then(pool => {
        app.post('/api/bommanagement1materialinput', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()
                .input('pono', sql.NVarChar, req.body.pono)
                .input('materialinput', sql.Float, req.body.materialinput)
                .input('materialname', sql.NVarChar, req.body.materialname)
                .input('lotno', sql.NVarChar, req.body.lotno)
                .query(
                    "update bommanagement1 set materialinput=@materialinput where pono=@pono and lotno=@lotno and materialname=@materialname")

                .then(result => {
                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** finish

    // **** start       
    sql.connect(config).then(pool => {
        app.post('/api/productionbominsert', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()
                .input('pono', sql.NVarChar, req.body.pono)
                .input('lotno', sql.NVarChar, req.body.lotno)
                .input('bomno', sql.NVarChar, req.body.bomno)
                .query(
                    " INSERT INTO bommanagement1 (bomno, model, itemname, materialname, swidth, mwidth, classification, cost, lotno, dpid,pono) " +
                    " SELECT bomno, model, itemname, materialname, swidth, mwidth, classification, cost, @lotno, dpid, @pono " +
                    " FROM bommanagement " +
                    " WHERE status = 'true' and bomno=@bomno")

                .then(result => {
                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** finish
    // **** start       
    sql.connect(config).then(pool => {
        app.post('/api/deleteproductionjisi', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()
                .input('id', sql.Int, req.body.id)
                .query(
                    " delete from orderlist where id=@id")

                .then(result => {
                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** finish


    // **** start
    sql.connect(config).then(pool => {
        app.post('/api/shipment', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()
                .input('START', sql.NVarChar, req.body.start)
                .input('FINISH', sql.NVarChar, req.body.finish)
                .query(
                    "   SELECT " +
                    "     S.SHIPMENTDATE, " +
                    "     I.REV, " +
                    "     I.CUSTOMER, " +
                    "     I.MODELNAME, " +
                    "     I.ITEMNAME, " +
                    " format(convert(int,Isnull(S.SHIPMENTCOUNT,0)),'##,##0') AS SHIPMENT, " +
                    " format(convert(int,Isnull(T.TOTAL_QUANTITY,0)),'##,##0') AS TOTALQUANTITY, " +
                    " format(convert(int,Isnull(T.TOTAL_QUANTITY - S.SHIPMENTCOUNT,0)),'##,##0') AS DIFFER, " +
                    " format(convert(int,Isnull(I.ITEMPRICE,0)),'##,##0') AS ITEMPRICE, " +
                    " format(convert(int,Isnull(I.ITEMPRICE * S.SHIPMENTCOUNT,0)),'##,##0') AS ALLPRICE, " +
                    "  CASE " +
                    "     WHEN S.SHIPMENTCOUNT > T.TOTAL_QUANTITY THEN '부족' " +
                    "     ELSE '가능' " +
                    " END AS STATUS " +

                    " FROM " +
                    "     ITEMINFO I " +
                    " JOIN " +
                    "     SHIPMENT S " +
                    " ON " +
                    "      I.MODELNAME = S.MODELNAME " +
                    "     AND I.ITEMNAME = S.ITEMNAME " +
                    " JOIN " +
                    "     ( " +
                    "         SELECT " +
                    "             MODELNAME, " +
                    "             ITEMNAME, " +
                    "             ITEMPRICE, " +
                    "             SUM(QUANTITY) AS TOTAL_QUANTITY " +
                    "         FROM " +
                    "             ITEMINPUT " +
                    "         GROUP BY " +
                    "             MODELNAME, " +
                    "             ITEMNAME, " +
                    "             ITEMPRICE " +
                    "     ) T " +
                    " ON " +
                    "     I.MODELNAME = T.MODELNAME " +
                    "     AND I.ITEMNAME = T.ITEMNAME " +
                    "     AND I.ITEMPRICE = T.ITEMPRICE " +
                    "     AND SHIPMENTDATE BETWEEN @START AND @FINISH ")

                .then(result => {
                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** finish

    // **** start       
    sql.connect(config).then(pool => {
        app.post('/api/searchingaccount', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()
                .input('START', sql.NVarChar, req.body.start)
                .input('FINISH', sql.NVarChar, req.body.finish)
                .query(
                    "  SELECT " +
                    " * " +
                    " FROM " +
                    " (SELECT " +
                    "     ITEMNAME, " +
                    "     CASE WHEN PART='1' THEN '발주' WHEN PART='2' THEN '계획' WHEN PART='3' THEN '실적' END PART, " +
                    "       ISNULL([1], '') AS ONE1, " +
                    "         ISNULL([2], '') AS ONE2, " +
                    "         ISNULL([3], '') AS ONE3, " +
                    "         ISNULL([4], '') AS ONE4, " +
                    "         ISNULL([5], '') AS ONE5, " +
                    "         ISNULL([6], '') AS ONE6, " +
                    "         ISNULL([7], '') AS ONE7, " +
                    "         ISNULL([8], '') AS ONE8, " +
                    "         ISNULL([9], '') AS ONE9, " +
                    "         ISNULL([10], '') AS ONE10," +
                    "         ISNULL([11], '') AS ONE11," +
                    "         ISNULL([12], '') AS ONE12," +
                    "         ISNULL([13], '') AS ONE13," +
                    "         ISNULL([14], '') AS ONE14," +
                    "         ISNULL([15], '') AS ONE15," +
                    "         ISNULL([16], '') AS ONE16," +
                    "         ISNULL([17], '') AS ONE17," +
                    "         ISNULL([18], '') AS ONE18," +
                    "         ISNULL([19], '') AS ONE19," +
                    "         ISNULL([20], '') AS ONE20," +
                    "         ISNULL([21], '') AS ONE21," +
                    "         ISNULL([22], '') AS ONE22," +
                    "         ISNULL([23], '') AS ONE23," +
                    "         ISNULL([24], '') AS ONE24," +
                    "         ISNULL([25], '') AS ONE25," +
                    "         ISNULL([26], '') AS ONE26," +
                    "         ISNULL([27], '') AS ONE27," +
                    "         ISNULL([28], '') AS ONE28," +
                    "         ISNULL([29], '') AS ONE29," +
                    "         ISNULL([30], '') AS ONE30," +
                    "         ISNULL([31], '') AS ONE31 " +
                    " FROM " +
                    " ( " +
                    "     SELECT " +
                    "         PART, " +
                    "         ITEMNAME, " +
                    "         DAY(ASDATE) AS DAY_OF_MONTH, " +
                    "         QUANTITY " +
                    "     FROM " +
                    "     ( " +
                    "         SELECT " +
                    "             '1' AS PART, " +
                    "             ITEMNAME, " +
                    "             ACCOUNTDATE AS ASDATE, " +
                    "             QUANTITY " +
                    "         FROM " +
                    "             ACCOUNTINPUT  " +
                    "         WHERE " +
                    "             ACCOUNTDATE BETWEEN '2023-05-01' AND '2023-05-31' " +
                    "         UNION ALL " +
                    "         SELECT " +
                    "             '2' AS PART, " +
                    "             ITEMNAME, " +
                    "             SHIPMENTDATE AS ASDATE, " +
                    "             SHIPMENTCOUNT AS QUANTITY " +
                    "         FROM " +
                    "             SHIPMENT " +
                    "         WHERE " +
                    "             SHIPMENTDATE BETWEEN '2023-05-01' AND '2023-05-31' " +
                    "     ) AS TB " +
                    " ) AS SourceTable " +

                    " PIVOT " +
                    " ( " +
                    "     SUM(QUANTITY) " +
                    "     FOR DAY_OF_MONTH IN ([1], [2], [3], [4], [5], [6], [7], [8], [9], [10], [11], [12], [13], [14], [15], [16], [17], [18], [19], [20], [21], [22], [23], [24], [25], [26], [27], [28], [29], [30], [31]) " +
                    " ) AS PivotTable) IB")

                .then(result => {
                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** finish

    // **** start       
    sql.connect(config).then(pool => {
        app.post('/api/house', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()

                .query(
                    'SELECT ' +
                    '* ' +
                    'FROM house')

                .then(result => {

                    // console.log('내가보고싶은거', result.recordset)


                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** finish

    // **** start       
    sql.connect(config).then(pool => {
        app.post('/api/bomchange', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()

                .query(
                    'SELECT ' +
                    '* ' +
                    'FROM bommanagement')

                .then(result => {

                    // console.log('내가보고싶은거', result.recordset)


                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** finish

    // **** start       
    sql.connect(config).then(pool => {
        app.post('/api/filesave', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()

                .query(
                    'SELECT ' +
                    '* ' +
                    'FROM filesave')

                .then(result => {

                    // console.log('내가보고싶은거', result.recordset)


                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** finish

    // **** start 원자재 코드기초정보 쿼리
    sql.connect(config).then(pool => {
        app.post('/api/materialbaseall', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()
                // .input('searchText', sql.NVarChar, req.body.searchText)
                .query(
                    "select * from materialbase"
                )
                .then(result => {
                    res.json(result.recordset);
                    res.end();
                });

        });

    });
    // **** finish
    // **** start 원자재 코드기초정보 쿼리
    sql.connect(config).then(pool => {
        app.post('/api/materialbase', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()
                .input('searchText', sql.NVarChar, req.body.searchText)
                .query(
                    "SELECT " +
                    "  id, " +
                    "  materialname, " +
                    "  codenumber, " +
                    "  classification, " +
                    "  FORMAT(CONVERT(INT, ISNULL(fullwidth, 0)), '##,##0') AS fullwidth, " +
                    "  FORMAT(CONVERT(INT, ISNULL(swidth, 0)), '##,##0') AS swidth, " +
                    "  customer, " +
                    "  FORMAT(CONVERT(INT, ISNULL(sqmprice, 0)), '##,##0') AS sqmprice, " +
                    "  FORMAT(CONVERT(INT, ISNULL(rollprice, 0)), '##,##0') AS rollprice, " +
                    "  day," +
                    "  inspection  " +
                    "FROM materialbase " +
                    "WHERE " +
                    "  materialname LIKE '%' + @searchText + '%' " +
                    "  OR codenumber LIKE '%' + @searchText + '%' " +
                    "  OR classification LIKE '%' + @searchText + '%' " +
                    "ORDER BY materialname ASC;"
                )
                .then(result => {
                    res.json(result.recordset);
                    res.end();
                });

        });

    });
    // **** finish
    // **** start 원자재 코드기초정보 쿼리
    sql.connect(config).then(pool => {
        app.post('/api/materialbaseinput', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()
                .input('searchText', sql.NVarChar, req.body.searchText)
                .query(
                    "SELECT " +
                    "  id, " +
                    "  materialname, " +
                    "  codenumber, " +
                    "  classification, " +
                    "  FORMAT(CONVERT(INT, ISNULL(fullwidth, 0)), '##,##0') AS fullwidth, " +
                    "  FORMAT(CONVERT(INT, ISNULL(swidth, 0)), '##,##0') AS swidth, " +
                    "  customer, " +
                    "  FORMAT(CONVERT(INT, ISNULL(sqmprice, 0)), '##,##0') AS sqmprice, " +
                    "  FORMAT(CONVERT(INT, ISNULL(rollprice, 0)), '##,##0') AS rollprice, " +
                    "  day," +
                    "  inspection  " +
                    "  FROM materialbase " +
                    "  WHERE " +
                    "  materialname LIKE '%' + @searchText + '%' " +
                    "  OR codenumber LIKE '%' + @searchText + '%' " +
                    "  OR classification LIKE '%' + @searchText + '%' " +
                    "ORDER BY materialname ASC;"
                )
                .then(result => {
                    res.json(result.recordset);
                    res.end();
                });

        });

    });
    // **** finish


    // **** start  거래처정보 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/accountmanagement', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()

                .query(
                    "    SELECT " +
                    "    id, " +
                    "    ISNULL(accountcode, '') AS accountcode, " +
                    "    ISNULL(accountname, '') AS accountname, " +
                    "    ISNULL(representativename, '') AS representativename, " +
                    "    ISNULL(phone, '') AS phone, " +
                    "    ISNULL(adress, '') AS adress, " +
                    "    ISNULL(fax, '') AS fax, " +
                    "    ISNULL(etc, '') AS etc, " +
                    "    ISNULL(mobile, '') AS mobile," +
                    "    ISNULL(number, '') AS number," +
                    "    ISNULL(email, '') AS email" +
                    "    FROM Accountmanagement")

                .then(result => {
                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish

    // **** start  최종검사 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/alltest', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()

                .query(
                    'SELECT ' +
                    '* ' +
                    'FROM alltest')

                .then(result => {
                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish


    // **** start  거래처정보 조회 쿼리  
    sql.connect(config).then(pool => {
        app.post('/api/accountmanagementsearch', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()
                // .input('accountname', sql.NVarChar, req.body.accountname)
                .query(
                    " SELECT " +
                    " * " +
                    " FROM accountmanagement where accountname like '%스%' ")

                .then(result => {
                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish

    // **** start  거래처정보 조회 쿼리  
    sql.connect(config).then(pool => {
        app.post('/api/materialinputwhere', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()
                .input('materialname', sql.NVarChar, req.body.materialname)
                .query(
                    " SELECT " +
                    " * " +
                    " FROM materialinput where materialname=@materialname ")

                .then(result => {
                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish


    // **** start  BOM정보 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/bommanagement1', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()
                .input('bomno', sql.NVarChar, req.body.bomno)
                .query(
                    " SELECT  bomno,materialname,swidth,mwidth,dpid,cost,classification " +
                    "  FROM bommanagement " +
                    "  WHERE  bomno=@bomno and status='true' ")

                .then(result => {
                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish

    // **** start       
    sql.connect(config).then(pool => {
        app.post('/api/department', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()

                .query(
                    'SELECT ' +
                    '* ' +
                    'FROM department')

                .then(result => {


                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** finish

    // **** start  품목정보 띄우기
    sql.connect(config).then(pool => {
        app.post('/api/iteminfo', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()

                .query(
                    " SELECT " +
                    "    id, " +
                    "    itemcode, " +
                    "    bomno, " +
                    "    modelname, " +
                    "    itemname, " +
                    "    customer, " +
                    "    itemprice, " +
                    "    cost, " +
                    "    quantity,  " +
                    "    CASE " +
                    "        WHEN itemprice = 0 THEN 0" +
                    "        ELSE CAST(ROUND(cost / itemprice * 100, 2) AS decimal(18, 2))" +
                    "    END AS 'costpg' ,etc " +
                    "FROM iteminfo  order by bomno asc               "
                )

                .then(result => {


                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** finish
    // **** start       
    sql.connect(config).then(pool => {
        app.post('/api/managementtopics', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()

                .query(
                    'SELECT ' +
                    '* ' +
                    'FROM managementtopics')

                .then(result => {


                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** finish


    // **** start       
    sql.connect(config).then(pool => {
        app.post('/api/baseinfolow', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()
                .query(
                    'select TOP (10)' +
                    'id,' +
                    'codenumber,' +
                    'itemname,' +
                    'classfication,' +
                    'materialwidth,' +
                    'fullwidth,' +
                    'length,' +
                    'koreancustomer,' +
                    'sqmprice,' +
                    'rollprice,' +
                    'widthclassfication,' +
                    'chk,' +
                    'day' +
                    ' from materialinfo')
                .then(result => {
                    console.log(result.recordset)
                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish

    // **** start 영업수주조회창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/salessearch', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()
                .input('start', sql.NVarChar, req.body.orderdate)
                .input('finish', sql.NVarChar, req.body.deliverydate)
                // .query(
                //     " select" +
                //     " * " +
                //     "from purchaseorder " +
                //     "where deliverydate between @start and @finish " +
                //     "and status=" +
                //     "'영업완료'")
                .query(
                    "SELECT " +
                    "id," +
                    "managementno," +
                    "orderdate," +
                    "deliverydate," +
                    "purchaseordername," +
                    "customer," +
                    "format(convert(int,Isnull(count,0)),'##,##0')'count'," +
                    "employee," +
                    "status " +
                    "FROM purchaseorder " +
                    "Where deliverydate between @start and @finish " +
                    "and status=" +
                    "'영업등록완료'")

                .then(result => {


                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** finish
    // **** start  BOM창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/iteminfobom', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()

                .query(
                    "SELECT " +
                    "id," +
                    "bomno," +
                    "part," +
                    "modelname," +
                    "itemname," +
                    "customer," +
                    "itemcode," +
                    "working," +
                    "cavity," +
                    "onepidding," +
                    "twopidding," +
                    "one," +
                    "two," +
                    "rev," +
                    "insertdate," +
                    "updatedate," +
                    "cost," +
                    "minus," +
                    "itemprice" +
                    " FROM iteminfo ")

                .then(result => {


                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** finish
    // **** start  사원관리창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/employee', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()

                .query(
                    " SELECT " +
                    " id, " +
                    " name," +
                    " nameid," +
                    " '********' AS  password," +
                    " part," +
                    " birth," +
                    " gender," +
                    " email," +
                    " phone," +
                    " salary" +

                    " FROM member ")

                .then(result => {


                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** finish


    // **** start  생산설비창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/equipment', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");
            console.log("req", req)


            return pool.request()

                .query(
                    "SELECT " +
                    " * " +
                    " FROM equipment ")

                .then(result => {


                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** finish

    // **** start  생산설비창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/test', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()

                .query(
                    "SELECT " +
                    "A,B" +
                    " FROM test ")

                .then(result => {


                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** finish

    // **** start       
    sql.connect(config).then(pool => {
        app.post('/api/materialinputinsertdata', function (req, res) {

            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()
                //.input('변수',값 형식, 값)
                .input('date', sql.NVarChar, req.body.date)
                .input('input', sql.NVarChar, req.body.input)
                .input('materialname', sql.NVarChar, req.body.materialname)
                .input('codenumber', sql.NVarChar, req.body.codenumber)
                .input('lotno', sql.NVarChar, req.body.lotno)
                .input('manufacturedate', sql.NVarChar, req.body.manufacturedate)
                .input('expirationdate', sql.NVarChar, req.body.expirationdate)
                .input('materialwidth', sql.Int, req.body.materialwidth)
                .input('quantity', sql.Int, req.body.quantity)
                .input('roll', sql.Int, req.body.roll)
                .input('sum', sql.Int, req.body.sum)
                .input('price', sql.Int, req.body.price)
                .input('accountnumber', sql.NVarChar, req.body.accountnumber)
                .input('contents', sql.NVarChar, req.body.contents)
                .input('part', sql.NVarChar, req.body.part)
                .input('sqmprice', sql.Float, req.body.sqmprice)

                .query(
                    'insert into materialinput(date,input,materialname,codenumber,lotno,manufacturedate,expirationdate,materialwidth,quantity,roll,sum,price,accountnumber,contents,part,sqmprice)' +
                    ' values(@date,@input,@materialname,@codenumber,@lotno,@manufacturedate,@expirationdate,@materialwidth,@quantity,@roll,@sum,@price,@accountnumber,@contents,@part,@sqmprice)'
                )
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish
    // **** start       
    sql.connect(config).then(pool => {
        app.post('/api/inputexcelmaterial', function (req, res) {

            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()
                //.input('변수',값 형식, 값)
                .input('date', sql.NVarChar, req.body.date)
                .input('input', sql.NVarChar, req.body.input)
                .input('materialname', sql.NVarChar, req.body.materialname)
                .input('codenumber', sql.NVarChar, req.body.codenumber)
                .input('lotno', sql.NVarChar, req.body.lotno)
                .input('manufacturedate', sql.NVarChar, req.body.manufacturedate)
                .input('expirationdate', sql.NVarChar, req.body.expirationdate)
                .input('materialwidth', sql.Int, req.body.materialwidth)
                .input('quantity', sql.Int, req.body.quantity)
                .input('roll', sql.Int, req.body.roll)
                .input('sum', sql.Int, req.body.sum)
                .input('price', sql.Int, req.body.price)
                .input('accountnumber', sql.NVarChar, req.body.accountnumber)
                .input('contents', sql.NVarChar, req.body.contents)
                .input('part', sql.NVarChar, req.body.part)
                .input('sqmprice', sql.Float, req.body.sqmprice)
                .input('customer', sql.NVarChar, req.body.customer)
                .input('classification', sql.NVarChar, req.body.classification)
                .input('house', sql.NVarChar, req.body.house)

                .query(
                    'insert into materialinput(date,input,materialname,codenumber,lotno,manufacturedate,expirationdate,materialwidth,quantity,roll,sum,price,accountnumber,contents,part,sqmprice,customer,classification,house)' +
                    ' values(@date,@input,@materialname,@codenumber,@lotno,@manufacturedate,@expirationdate,@materialwidth,@quantity,@roll,@sum,@price,@accountnumber,@contents,@part,@sqmprice,@customer,@classification,@house)'
                )
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish


    // **** start       
    sql.connect(config).then(pool => {
        app.post('/api/materialbaseinsertdata', function (req, res) {

            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()
                //.input('변수',값 형식, 값)

                .input('materialname', sql.NVarChar, req.body.materialname)
                .input('codenumber', sql.NVarChar, req.body.codenumber)
                .input('classification', sql.NVarChar, req.body.classification)
                .input('fullwidth', sql.Int, req.body.fullwidth)
                .input('swidth', sql.Int, req.body.swidth)
                .input('customer', sql.NVarChar, req.body.customer)
                .input('sqmprice', sql.Float, req.body.sqmprice)
                .input('rollprice', sql.Float, req.body.rollprice)
                .input('day', sql.Int, req.body.day)


                .query(
                    'insert into materialbase(materialname,codenumber,classification,fullwidth,swidth,customer,sqmprice,rollprice,day)' +
                    ' values(@materialname,@codenumber,@classification,@fullwidth,@swidth,@customer,@sqmprice,@rollprice,@day)'
                )
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish


    // **** start       
    sql.connect(config).then(pool => {
        app.post('/api/equipmentinsertdata', function (req, res) {

            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()
                .input('codenumber', sql.NVarChar, req.body.codenumber)
                .input('equipmentname', sql.NVarChar, req.body.equipmentname)
                .input('part', sql.NVarChar, req.body.part)
                .input('size', sql.NVarChar, req.body.size)
                .input('num', sql.NVarChar, req.body.num)
                .input('customer', sql.NVarChar, req.body.customer)
                .input('position', sql.NVarChar, req.body.position)
                .input('etc', sql.NVarChar, req.body.etc)


                .query(
                    'insert into equipment(codenumber,equipmentname,part,size,num,customer,position,etc)' +
                    ' values(@codenumber,@equipmentname,@part,@size,@num,@customer,@position,@etc)'
                )
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish

    // **** start  생산설비창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/materialoption', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()

                .query(
                    "SELECT " +
                    "id," +
                    "input," +
                    "date," +
                    "materialname," +
                    "classification," +
                    "lotno," +
                    "manufacturedate," +
                    "expirationdate," +
                    "format(convert(int,Isnull(materialwidth,0)),'##,##0')'materialwidth'," +
                    "format(convert(int,Isnull(quantity,0)),'##,##0')'quantity'," +
                    "roll," +
                    "sum,part" +

                    " FROM materialinput ")

                .then(result => {


                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** finish

    // **** start  생산설비창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/itemstockfianl1', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()

                .query(
                    "SELECT " +
                    "     modelname, " +
                    "     itemname, " +
                    "     SUM(quantity) AS total_quantity, " +
                    "     itemprice, " +
                    "     (SUM(quantity) * itemprice) AS total " +
                    " FROM " +
                    "     iteminput " +
                    " GROUP BY " +
                    "     modelname, itemname, itemprice")

                .then(result => {


                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** finish
    // **** start  생산설비창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/itemstockfianl0', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()

                .query(
                    "select * from iteminput")

                .then(result => {


                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** finish

    // **** start  생산설비창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/materialinputsearch', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()
                .input('start', sql.NVarChar, req.body.start)
                .input('finish', sql.NVarChar, req.body.finish)
                .query(
                    "SELECT " +
                    "id," +
                    "input," +
                    "date," +
                    "materialname," +
                    "classification," +
                    "customer," +
                    "lotno," +
                    "manufacturedate," +
                    "expirationdate," +
                    "format(convert(int,Isnull(materialwidth,0)),'##,##0')'materialwidth'," +
                    "format(convert(int,Isnull(quantity,0)),'##,##0')'quantity'," +
                    "format(convert(int,Isnull(roll,0)),'##,##0')'roll'," +
                    "sum,part,house,codenumber," +
                    "format(convert(int,Isnull(sqmprice,0)),'##,##0')'sqmprice'" +

                    " FROM materialinput where date between @start and @finish order by materialname,lotno asc")

                .then(result => {


                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** finish
    sql.connect(config).then(pool => {
        app.post('/api/materialinputsearch1', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()

                .query(
                    "SELECT " +
                    "id," +
                    "input," +
                    "date," +
                    "materialname," +
                    "classification," +
                    "customer," +
                    "lotno," +
                    "manufacturedate," +
                    "expirationdate," +
                    "format(convert(int,Isnull(materialwidth,0)),'##,##0')'materialwidth'," +
                    "format(convert(int,Isnull(quantity,0)),'##,##0')'quantity'," +
                    "format(convert(int,Isnull(roll,0)),'##,##0')'roll'," +
                    "sum,part,house,codenumber," +
                    "format(convert(int,Isnull(sqmprice,0)),'##,##0')'sqmprice'" +

                    " FROM materialinput where input='원자재입고'")

                .then(result => {


                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** finish
    // **** start  생산설비창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/materialinputsearchgroup', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()
                .input('start', sql.NVarChar, req.body.start)
                .input('finish', sql.NVarChar, req.body.finish)
                .query(
                    "SELECT " +
                    "     input, " +
                    "     date, " +
                    "     materialname, " +
                    "     classification, " +
                    "     customer, " +
                    "     codenumber, " +
                    "     lotno, " +
                    "     manufacturedate, " +
                    "     expirationdate, " +
                    "     format(convert(int,Isnull(materialwidth,0)),'##,##0')'materialwidth', " +
                    "     format(convert(int,Isnull(materialwidth,0)),'##,##0')'sqmprice', " +
                    "     format(convert(int,Isnull(SUM(roll),0)),'##,##0')'roll', " +
                    "     format(convert(int,Isnull(quantity,0)),'##,##0')'quantity', " +
                    // "     (quantity * materialwidth / 1000 * sqmprice * SUM(roll)) AS 'sumroll', "+
                    "     house, " +
                    "     part " +
                    " FROM  " +
                    "     materialinput " +
                    " WHERE date between @start and @finish " +
                    " GROUP BY " +
                    "     date, " +
                    "     input, " +
                    "     materialname, " +
                    "     codenumber, " +
                    "     lotno, " +
                    "     manufacturedate, " +
                    "     expirationdate, " +
                    "     materialwidth, " +
                    "     quantity, " +
                    "     part, " +
                    "     classification, " +
                    "     customer, " +
                    "     sqmprice, " +
                    "     house "
                )

                .then(result => {


                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** finish
    // **** start  생산설비창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/materialinputsearchslim', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()
                .input('start', sql.NVarChar, req.body.start)
                .input('finish', sql.NVarChar, req.body.finish)
                .query(
                    "SELECT " +
                    "id," +
                    "input," +
                    "date," +
                    "materialname," +
                    "classification," +
                    "lotno," +
                    "manufacturedate," +
                    "expirationdate," +
                    "format(convert(int,Isnull(materialwidth,0)),'##,##0')'materialwidth'," +
                    "format(convert(int,Isnull(quantity,0)),'##,##0')'quantity'," +
                    "roll," +
                    "sum,part,house,codenumber," +
                    "format(convert(int,Isnull(sqmprice,0)),'##,##0')'sqmprice'" +

                    " FROM materialinput where input='슬리팅입고' and date between @start and @finish")

                .then(result => {


                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** finish

    // **** start  생산설비창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/materialouput', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()

                .query(
                    "   select " +
                    "    contentname,orderid,productdate,lotno,bomno,modelname,itemname,quantity,materialstatus " +
                    "    from " +
                    "    orderlist where materialstatus='true' " +
                    "    group by " +
                    "   contentname,bomno,orderid,productdate,modelname,itemname,lotno,materialstatus,quantity "
                )

                .then(result => {


                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** start  생산설비창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/productionmaterialouput', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()

                .query(
                    "   SELECT contentname, orderid, productdate, lotno, bomno, modelname, itemname, quantity, materialstatus " +
                    " FROM orderlist " +
                    " WHERE mstatus IN ('자재완전출고', '자재부분출고') " +
                    " GROUP BY contentname, bomno, orderid, productdate, modelname, itemname, lotno, materialstatus, quantity; "

                )

                .then(result => {


                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** start  생산설비창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/materialoutputdata', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()

                .query(
                    " select * from materialinput where input='원자재출고'"

                )

                .then(result => {


                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** start  생산설비창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/productioning', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()

                .query(
                    " select * from orderlist where status1='생산중'"

                )

                .then(result => {


                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** start  생산설비창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/updateproduction', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()
                .input('status1', sql.NVarChar, req.body.status1)
                .input('lotno', sql.NVarChar, req.body.lotno)

                .query(
                    " update orderlist set status1=@status1 where lotno=@lotno"

                )

                .then(result => {


                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** start  품목등록    
    sql.connect(config).then(pool => {
        app.post('/api/insertmaterialinput', function (req, res) {

            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()
                //.input('변수',값 형식, 값)
                .input('date', sql.NVarChar, req.body.date)
                .input('input', sql.NVarChar, req.body.input)
                .input('materialname', sql.NVarChar, req.body.materialname)
                .input('lotno', sql.NVarChar, req.body.lotno)
                .input('manufacturedate', sql.NVarChar, req.body.manufacturedate)
                .input('expirationdate', sql.NVarChar, req.body.expirationdate)
                .input('materialwidth', sql.Int, req.body.materialwidth)
                .input('quantity', sql.Int, req.body.quantity)
                .input('roll', sql.Int, req.body.roll)
                .input('sum', sql.Int, req.body.sum)
                .input('contents', sql.NVarChar, req.body.contents)
                .input('house', sql.NVarChar, req.body.house)
                .input('classification', sql.NVarChar, req.body.classification)
                .input('codenumber', sql.NVarChar, req.body.codenumber)
                .input('customer', sql.NVarChar, req.body.customer)
                .input('part', sql.NVarChar, req.body.part)



                .query(
                    'insert into materialinput(date,input,materialname,lotno,manufacturedate,expirationdate,materialwidth,quantity,roll,sum,contents,house,classification,codenumber,customer,part)' +
                    ' values(@date,@input,@materialname,@lotno,@manufacturedate,@expirationdate,@materialwidth,@quantity,@roll,@sum,@contents,@house,@classification,@codenumber,@customer,@part)'
                )
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish
    // **** start  생산설비창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/updatemtstatus', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()
                .input('mstatus', sql.NVarChar, req.body.mstatus)
                .input('lotno', sql.NVarChar, req.body.lotno)

                .query(
                    " update orderlist set mstatus=@mstatus where lotno=@lotno"

                )

                .then(result => {


                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** finish
    // **** start  생산설비창 띄우기  
    // sql.connect(config).then(pool => {
    //     app.post('/api/materialrealstock', function (req, res) {
    //         res.header("Access-Control-Allow-Origin", "*");

    //         return pool.request()
    //             .input('searchText', sql.NVarChar, req.body.searchText)
    //             .input('materialwidth', sql.Int, req.body.materialwidth)

    //             .query(
    //                 "   SELECT " +
    //                 "   materialname, " +
    //                 "     classification, " +
    //                 "   lotno, " +
    //                 "   materialwidth, " +

    //                 "     SUM(quantity) AS totalquantity, " +
    //                 "   sqmprice, " +
    //                 "   materialid, " +
    //                 " codenumber, " +
    //                 " manufacturedate, " +
    //                 " expirationdate " +
    //                 " FROM " +
    //                 "   materialinput " +
    //                 " where " +
    //                 " materialname " +
    //                 " LIKE '%' + @searchText + '%' and materialwidth=@materialwidth " +
    //                 " GROUP BY " +
    //                 "   materialid, " +
    //                 "    materialwidth,  " +
    //                 "    classification, " +
    //                 "    sqmprice,  " +
    //                 "   materialname, " +
    //                 "   lotno, " +
    //                 " codenumber, " +
    //                 " manufacturedate, " +
    //                 " expirationdate " +
    //                 " HAVING " +
    //                 "   SUM(quantity) > 0  order by expirationdate asc"
    //             )
    //             .then(result => {
    //                 res.json(result.recordset);
    //                 res.end();
    //             });
    //     });

    // });
    // **** finish
    // **** start  생산설비창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/materialstockreal', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");

            return pool.request()

                .query(
                    "   SELECT " +
                    "   materialname, " +
                    "     classification, " +
                    "   lotno, " +
                    "   materialwidth, " +

                    "     SUM(quantity) AS totalquantity, " +
                    "   sqmprice, " +
                    "   materialid " +
                    " FROM " +
                    "   materialinput " +


                    " GROUP BY " +
                    "   materialid, " +
                    "    materialwidth,  " +
                    "    classification, " +
                    "    sqmprice,  " +
                    "   materialname, " +
                    "   lotno " +
                    " HAVING " +
                    "   SUM(quantity) > 0 "
                )
                .then(result => {
                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish

    // **** start  생산설비창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/materialrealstock', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");

            return pool.request()
                .input('searchText', sql.NVarChar, req.body.searchText)
                .input('materialwidth', sql.Int, req.body.materialwidth)
                .query(
                    "  WITH cte AS ( " +
                    "    SELECT " +
                    "        materialname, " +
                    "        classification, " +
                    "        materialwidth, " +
                    "         CASE WHEN part IN ('출고대기', '출고완료') THEN -roll ELSE roll END AS roll, " +
                    "        CASE WHEN part IN ('출고대기', '출고완료') THEN -quantity ELSE quantity END AS negated_quantity, " +
                    "        quantity " +
                    "    FROM " +
                    "        materialinput " +
                    ") " +
                    "SELECT " +
                    "    materialname, " +
                    "    classification, " +
                    "    materialwidth, " +
                    "    SUM(roll) AS roll, " +
                    "    negated_quantity AS quantity, " +
                    "    SUM(quantity) AS totalquantity " +

                    "FROM " +
                    "    cte " +
                    "GROUP BY " +
                    "    materialname, " +
                    "    classification, " +
                    "    materialwidth, " +
                    "    negated_quantity; "
                )
                .then(result => {
                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish
    // **** start  생산설비창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/materialouput1', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()

                .query(
                    "   select " +
                    "    orderid,productdate,lotno,bomno,modelname,itemname,materialstatus,mstatus " +
                    "    from " +
                    "    orderlist where materialstatus='true1' " +
                    "    group by " +
                    "    bomno,orderid,productdate,modelname,itemname,lotno,materialstatus,mstatus "
                )

                .then(result => {


                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** finish

    // **** start  생산설비창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/materialoptiondate', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()
                .input('start', sql.NVarChar, req.body.accountcode)
                .input('finish', sql.NVarChar, req.body.accountcode)
                .query(
                    "SELECT " +
                    "id," +
                    "date," +
                    "materialname," +
                    "lotno," +
                    "manufacturedate," +
                    "expirationdate," +
                    "materialwidth," +
                    "quantity," +
                    "roll," +
                    "sum" +

                    " FROM materialinput where date between @start and @finish ")

                .then(result => {


                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** finish

    // **** start  생산설비창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/materialoptiongroup', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()

                .query(
                    "select materialname,lotno,manufacturedate,expirationdate,format(convert(int,Isnull(materialwidth,0)),'##,##0')'materialwidth',format(convert(int,Isnull(sum(quantity),0)),'##,##0')'quantity' from materialinput where part='입고완료' group by materialname,lotno,manufacturedate,expirationdate,materialwidth")


                .then(result => {


                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** finish

    // **** start  생산설비창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/materialoptiongroup', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()

                .query(
                    "select materialname,lotno,manufacturedate,expirationdate,format(convert(int,Isnull(materialwidth,0)),'##,##0')'materialwidth',format(convert(int,Isnull(sum(quantity),0)),'##,##0')'quantity' from materialinput where part='입고완료' group by materialname,lotno,manufacturedate,expirationdate,materialwidth")


                .then(result => {


                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** finish
    // **** start  생산설비창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/materialsoyosearch', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()
                .input('materialname', sql.NVarChar, req.body.materialname)
                .input('materialwidth', sql.Int, req.body.materialwidth)
                .query(
                    " SELECT" +
                    "     materialname, " +
                    "     codenumber, " +
                    "     classification, " +
                    "     lotno, " +
                    "     manufacturedate, " +
                    "     expirationdate, " +
                    "     materialwidth, " +
                    "     SUM(quantity) AS 'quantity', " +
                    "     sqmprice,  " +
                    "     house, " +
                    "     materialid,customer " +
                    " FROM " +
                    "     materialinput " +
                    " WHERE materialname = @materialname and house='원자재창고' " +
                    " GROUP BY " +
                    "     materialname, " +
                    "     codenumber, " +
                    "     classification, " +
                    "     lotno, " +
                    "     manufacturedate, " +
                    "     expirationdate, " +
                    "     materialwidth, " +
                    "     sqmprice, " +
                    "     house, " +
                    "     materialid,customer " +
                    " HAVING " +
                    "     SUM(quantity) <> 0 " +
                    "     AND materialwidth = @materialwidth " +
                    " ORDER BY " +
                    "    house asc, " +
                    " expirationdate ASC, " +
                    " quantity desc ")


                .then(result => {


                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** finish


    // **** start  생산설비창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/materialstocksearch', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()
                .input('start', sql.NVarChar, req.body.start)
                .input('finish', sql.NVarChar, req.body.finish)
                .query(
                    " select " +
                    " materialname, " +
                    " lotno, " +
                    " codenumber, " +
                    " classification, " +
                    " manufacturedate, " +
                    " expirationdate, " +
                    " materialwidth," +
                    " sqmprice, " +
                    " sum(quantity)'quantity', " +
                    " sum(roll)'roll' " +
                    " from materialinput " +
                    " where part='입고완료' " +
                    " and date between @start and @finish " +
                    " group by  " +
                    " materialname, " +
                    " lotno, " +
                    " codenumber, " +
                    " classification, " +
                    " manufacturedate, " +
                    " expirationdate, " +
                    " materialwidth, " +
                    " sqmprice,roll")


                .then(result => {


                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** finish

    // **** start  생산설비창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/materialoptiongroup1', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()
                // .input('materialname', sql.NVarChar, req.body.materialname)
                .query(
                    "select materialname,lotno,manufacturedate,expirationdate,format(convert(int,Isnull(materialwidth,0)),'##,##0')'materialwidth',format(convert(int,Isnull(sum(quantity),0)),'##,##0')'quantity' from materialinput where part='입고완료' group by materialname,lotno,manufacturedate,expirationdate,materialwidth")
                .then(result => {
                    res.json(result.recordset);
                    res.end();
                });
        });
    });
    // **** finish

    // **** start  생산설비창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/iteminputgroup', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()
                .query(
                    "select modelname,itemname,itemprice,sum(quantity)'quantity' from iteminput group by  modelname,itemname,itemprice")
                .then(result => {
                    res.json(result.recordset);
                    res.end();
                });
        });
    });
    // **** finish

    // // **** start       
    // sql.connect(config).then(pool => {
    //     app.post('/api/materialoption', function (req, res) {
    //         console.log("req", req)
    //         res.header("Access-Control-Allow-Origin", "*");
    //         return pool.request()
    //             .query(
    //                 "  select " +
    //                 "  *" +
    //                 "   from" +

    //                 "  (select " +
    //                 "  date," +
    //                 "  input," +
    //                 "  materialname," +
    //                 "  codenumber," +
    //                 "  lotno," +
    //                 "  manufacturedate," +
    //                 "  expirationdate," +
    //                 "  materialwidth," +
    //                 "  quantity," +
    //                 "  roll," +
    //                 "  sum," +
    //                 "  price " +
    //                 "  from materialinput " +
    //                 "  union all " +

    //                 "  select " +
    //                 "  (CASE WHEN date iS NULL THEN '합계'else '소계' end)'date'," +
    //                 "  (CASE WHEN date iS not null THEN null else '' end)'input'," +
    //                 "  (CASE WHEN date iS not null THEN null else '' end)'materialname'," +
    //                 "  (CASE WHEN date iS not null THEN codenumber else '' end)'materialname'," +
    //                 "  (CASE WHEN date iS not null THEN null else '' end)'lotno'," +
    //                 "  (CASE WHEN date iS not null THEN null else '' end)'manufacturedate'," +
    //                 "  (CASE WHEN date iS not null THEN null else '' end)'expirationdate'," +
    //                 "  (CASE WHEN date iS not null THEN null else '' end)'materialwidth'," +
    //                 "  (CASE WHEN date iS not null THEN null else '' end)'lotno'," +
    //                 "  roll," +
    //                 "  sum," +
    //                 "  price " +
    //                 "   from (" +
    //                 "  select " +

    //                 "  date," +
    //                 "  input," +
    //                 "  materialname," +
    //                 "  codenumber," +
    //                 "  lotno," +
    //                 "  manufacturedate," +
    //                 "  expirationdate," +
    //                 "  materialwidth," +
    //                 "  quantity," +
    //                 "  sum(roll)'roll'," +
    //                 "  sum(sum)'sum'," +
    //                 "  sum(price)'price' " +


    //                 "  from materialinput " +

    //                 "  GROUP BY ROLLUP(" +

    //                 "  date," +
    //                 "  input," +
    //                 "  materialname," +
    //                 "  codenumber," +
    //                 "  lotno," +
    //                 "  manufacturedate," +
    //                 "  expirationdate," +
    //                 "  materialwidth," +
    //                 "  quantity" +
    //                 "  ) " +
    //                 "  ) tb " +
    //                 "  where 1=1 " +
    //                 "  and ((quantity is not null) or (date is null)) " +
    //                 "  )tb2 " +
    //                 "  order by codenumber desc, price asc"
    //             )
    //             .then(result => {
    //                 console.log(result.recordset)
    //                 res.json(result.recordset);
    //                 res.end();
    //             });
    //     });

    // });
    // **** finish
    // **** start       
    sql.connect(config).then(pool => {
        app.post('/api/openinsertdata', function (req, res) {

            // console.log("11", req)
            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()
                //.input('변수',값 형식, 값)

                .input('accountdate', sql.NVarChar, req.body.accountdate)
                .input('deliverydate', sql.NVarChar, req.body.deliverydate)
                .input('customer', sql.NVarChar, req.body.customer)
                .input('itemcode', sql.NVarChar, req.body.itemcode)
                .input('bomno', sql.NVarChar, req.body.bomno)
                .input('modelname', sql.NVarChar, req.body.modelname)
                .input('itemname', sql.NVarChar, req.body.itemname)
                .input('size', sql.NVarChar, req.body.size)
                .input('itemprice', sql.Float, req.body.itemprice)
                .input('itemcost', sql.Float, req.body.itemcost)
                .input('quantity', sql.Float, req.body.quantity)
                .input('price', sql.Float, req.body.price)
                .input('salesorder', sql.NVarChar, req.body.accountdate)
                .input('contentname', sql.NVarChar, req.body.contentname)
                .input('ponum', sql.NVarChar, req.body.ponum)
                .input('countsum', sql.Float, req.body.countsum)
                .input('pricesum', sql.Float, req.body.pricesum)
                .input('status', sql.NVarChar, req.body.status)
                .input('ad', sql.NVarChar, req.body.ad)

                .query(
                    'insert into accountinput(accountdate,deliverydate,customer,itemcode,bomno,modelname,itemname,size,itemprice,quantity,price,salesorder,contentname,countsum,pricesum,itemcost,ponum,status,ad)' +
                    ' values(@accountdate,@deliverydate,@customer,@itemcode,@bomno,@modelname,@itemname,@size,@itemprice,@quantity,@price,@salesorder,@contentname,@countsum,@pricesum,@itemcost,@ponum,@status,@ad)'
                )
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish

    // **** start       
    sql.connect(config).then(pool => {
        app.post('/api/inputitemstock', function (req, res) {


            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()
                //.input('변수',값 형식, 값)

                .input('modelname', sql.NVarChar, req.body.modelname)
                .input('itemname', sql.NVarChar, req.body.itemname)
                .input('quantity', sql.Int, req.body.quantity)

                .query(
                    'insert into iteminput(modelname,itemname,quantity)' +
                    ' values(@modelname,@itemname,@quantity)'
                )
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish


    // **** start   영업수주 네임건 등록
    sql.connect(config).then(pool => {
        app.post('/api/purchaseorder', function (req, res) {

            console.log("11", req)
            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()
                //.input('변수',값 형식, 값)

                .input('orderdate', sql.NVarChar, req.body.orderdate)
                .input('deliverydate', sql.NVarChar, req.body.deliverydate)
                .input('purchaseordername', sql.NVarChar, req.body.purchaseordername)
                .input('customer', sql.NVarChar, req.body.customer)
                .input('managementno', sql.NVarChar, req.body.managementno)
                .input('count', sql.NVarChar, req.body.count)
                .input('employee', sql.NVarChar, req.body.employee)
                .input('status', sql.NVarChar, req.body.status)


                .query(
                    'insert into purchaseorder(orderdate,deliverydate,purchaseordername,customer,managementno,count,employee,status)' +
                    ' values(@orderdate,@deliverydate,@purchaseordername,@customer,@managementno,@count,@employee,@status)'
                )
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish

    // **** start       
    sql.connect(config).then(pool => {
        app.post('/api/materialinfoinsertdata', function (req, res) {

            console.log("11", req)
            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()
                //.input('변수',값 형식, 값)

                .input('codenumber', sql.NVarChar, req.body.codenumber)
                .input('itemname', sql.NVarChar, req.body.itemname)
                .input('classfication', sql.NVarChar, req.body.classfication)
                .input('materialwidth', sql.Int, req.body.materialwidth)
                .input('fullwidth', sql.NVarChar, req.body.fullwidth)
                .input('length', sql.NVarChar, req.body.length)
                .input('koreancustomer', sql.NVarChar, req.body.koreancustomer)
                .input('sqmprice', sql.NVarChar, req.body.sqmprice)
                .input('rollprice', sql.NVarChar, req.body.rollprice)
                .input('widthclassfication', sql.NVarChar, req.body.widthclassfication)
                .input('day', sql.NVarChar, req.body.day)


                .query(
                    'insert into materialinfo(codenumber,itemname,classfication,materialwidth,fullwidth,length,koreancustomer,sqmprice,rollprice,widthclassfication,day)' +
                    ' values(@codenumber,@itemname,@classfication,@materialwidth,@fullwidth,@length,@koreancustomer,@sqmprice,@rollprice,@widthclassfication,@day)'
                )
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish
    // **** start       
    sql.connect(config).then(pool => {
        app.post('/api/productorderinsertdata', function (req, res) {

            console.log("11", req)
            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()
                //.input('변수',값 형식, 값)

                .input('productdate', sql.NVarChar, req.body.productdate)
                .input('modelname', sql.NVarChar, req.body.modelname)
                .input('productname', sql.NVarChar, req.body.productname)
                .input('bomno', sql.NVarChar, req.body.bomno)
                .input('lotno', sql.NVarChar, req.body.lotno)
                .input('productnumber', sql.NVarChar, req.body.productnumber)
                .input('productcount', sql.Int, req.body.productcount)
                .input('status', sql.NVarChar, req.body.status)


                .query(
                    'insert into productinput(productdate,modelname,productname,bomno,lotno,productnumber,productcount,status)' +
                    ' values(@productdate,@modelname,@productname,@bomno,@lotno,@productnumber,@productcount,@status)'
                )
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish
    // **** start       
    sql.connect(config).then(pool => {
        app.post('/api/productorder1', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");
            console.log("11", req)
            return pool.request()
                .query(
                    'select ' +
                    'productdate,' +
                    'modelname,' +
                    'productname,' +
                    'bomno,' +
                    'lotno,' +
                    'productnumber,' +
                    'productcount,' +
                    'status' +
                    ' from productinput')
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish

    // **** start       
    sql.connect(config).then(pool => {
        app.post('/api/productorderlist', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");

            return pool.request()
                .query(
                    " select " +
                    " id, " +
                    " bomno, " +

                    " contentname, " +
                    " productdate, " +
                    " modelname, " +
                    " itemname, " +
                    " lotno, " +
                    " quantity, " +
                    " orderid,marchine,a,b,c,d,qrno,orderstatus " +
                    " from  " +
                    " orderlist where orderstatus='생산확정' order by orderstatus desc ")
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** start       
    sql.connect(config).then(pool => {
        app.post('/api/productorderlist3', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");

            return pool.request()
                .query(
                    " select " +
                    " id, " +
                    " bomno, " +

                    " contentname, " +
                    " productdate, " +
                    " modelname, " +
                    " itemname, " +
                    " lotno, " +
                    " quantity, " +
                    " orderid,marchine,a,b,c,d,qrno,orderstatus " +
                    " from  " +
                    " orderlist where status='true' order by orderstatus,productdate asc ")
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish
    // **** start       
    sql.connect(config).then(pool => {
        app.post('/api/planorderlist', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");

            return pool.request()
                .query(
                    " select " +
                    " id, " +
                    " bomno, " +

                    " contentname, " +
                    " productdate, " +
                    " modelname, " +
                    " itemname, " +
                    " lotno, " +
                    " quantity, " +
                    " orderid,marchine,a,b,c,d,qrno " +
                    " from  " +
                    " orderlist where status='ok' order by contentname,lotno asc ")
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish

    // **** start       
    sql.connect(config).then(pool => {
        app.post('/api/equipmentname', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");

            return pool.request()
                .query(
                    "select equipmentname,codenumber from equipment")
                .then(result => {
                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish
    // **** start       
    sql.connect(config).then(pool => {
        app.post('/api/searchequipmentcodenumber', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");

            return pool.request()
                .input('equipmentname', sql.NVarChar, req.body.equipmentname)
                .query(
                    "select codenumber from equipment where equipmentname=@equipmentname")
                .then(result => {
                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish


    // **** start       
    sql.connect(config).then(pool => {
        app.post('/api/plansearch', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");

            return pool.request()
                .input('plandate', sql.NVarChar, req.body.plandate)
                .input('equipmentname', sql.NVarChar, req.body.equipmentname)
                .query("select * from produceplan where plandate=@plandate and equipmentname=@equipmentname")
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });

    sql.connect(config).then(pool => {
        app.post('/api/plansearchAll', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");

            return pool.request()
                .input('plandate', sql.NVarChar, req.body.plandate)
                .query("select * from produceplan where plandate=@plandate")
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });

    // sql.connect(config).then(pool => {
    //     app.post('/api/plansearch', function (req, res) {
    //         res.header("Access-Control-Allow-Origin", "*");

    //         return pool.request()
    //             .input('plandate', sql.NVarChar, req.body.plandate)
    //             .query("select * from produceplan where plandate=@plandate")
    //             .then(result => {
    //             res.json(result.recordset);
    //             res.end();
    //             })
    //             .catch(err => {
    //             console.error('SQL error:', err);
    //             res.status(500).send('Database error');
    //             });
    //         });
    // })
    // .catch(err => {
    //     console.error('Database connection error:', err);
    // });

    // **** finish


    sql.connect(config).then(pool => {
        app.post('/api/plansearch1', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()
                .input('plandate', sql.NVarChar, req.body.plandate)
                .input('equipmentname', sql.NVarChar, req.body.equipmentname)

                .query(
                    "select * from produceplan where plandate=@plandate and equipmentname=@equipmentname")
                .then(result => {
                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish


    // **** start       
    sql.connect(config).then(pool => {
        app.post('/api/productorderlist3', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");

            return pool.request()
                .query(
                    " select " +
                    " id, " +
                    " productdate, " +
                    " bomno, " +
                    " modelname, " +
                    " itemname, " +
                    " lotno, " +
                    " quantity, " +
                    " startdate, " +
                    " starttime, " +
                    " finaltime, " +
                    " marchine " +

                    " from  " +
                    " orderlist ")
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish
    // **** start       
    sql.connect(config).then(pool => {
        app.post('/api/productionpause', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");

            return pool.request()
                .query(
                    " select id,registrationdate,productionordernumber,lotno,bomno,modelname,productname,equipment,downtime,restarttime,DowntimeReason from pause "
                )
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish

    // **** start       
    sql.connect(config).then(pool => {
        app.post('/api/startproduction', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");

            return pool.request()
                .query(
                    " select " +
                    " id, " +
                    " modelname, " +
                    " itemname, " +
                    " bomno, " +
                    " lotno, " +
                    " quantity, " +
                    " orderid, " +
                    " materialstatus " +
                    " from  " +
                    " orderlist  " +
                    " where status='true' ")

                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish
    // **** start       
    sql.connect(config).then(pool => {
        app.post('/api/startproductioning', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");

            return pool.request()
                .query(
                    " select " +
                    " id, " +
                    " modelname, " +
                    " itemname, " +
                    " bomno, " +
                    " lotno, " +
                    " quantity, " +
                    " orderid, " +
                    " status,contentname " +
                    " from  " +
                    " orderlist  " +
                    " where status='생산중' ")

                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish

    // **** start       
    sql.connect(config).then(pool => {
        app.post('/api/materialoutputorderid', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");

            return pool.request()
                .input('orderid', sql.NVarChar, req.body.orderid)
                .input('lotno', sql.NVarChar, req.body.lotno)

                .query(
                    " SELECT  " +
                    "    mi.materialname, " +
                    "    mi.lotno, " +
                    "    mi.materialwidth, " +
                    "    CASE WHEN mi.quantity < 0 THEN -1 * mi.quantity ELSE mi.quantity END AS quantity, " +
                    "    bm.classification " +
                    "FROM " +
                    "    materialinput mi " +

                    "JOIN " +
                    "    bommanagement1 bm ON mi.materialname = bm.materialname " +
                    "    where orderid=@orderid and bm.lotno=@lotno")

                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish

    // **** start       
    sql.connect(config).then(pool => {
        app.post('/api/operatingrate', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");

            return pool.request()
                .query(
                    'select * from operatingrate')
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish

    // **** start       
    sql.connect(config).then(pool => {
        app.post('/api/productorderinstruction', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");

            return pool.request()
                .input('modelname', sql.NVarChar, req.body.modelname)
                .input('contentname', sql.NVarChar, req.body.contentname)
                .input('itemname', sql.NVarChar, req.body.itemname)
                .input('lotno', sql.NVarChar, req.body.lotno)
                .input('bomno', sql.NVarChar, req.body.bomno)
                .input('marchine', sql.NVarChar, req.body.marchine)
                .input('quantity', sql.Int, req.body.quantity)
                .input('productdate', sql.NVarChar, req.body.productdate)
                .input('status', sql.NVarChar, req.body.status)
                .input('orderid', sql.NVarChar, req.body.orderid)
                .input('materialstatus', sql.NVarChar, req.body.materialstatus)
                .input('a', sql.NVarChar, req.body.a)
                .input('b', sql.NVarChar, req.body.b)
                .input('c', sql.NVarChar, req.body.c)
                .input('d', sql.NVarChar, req.body.d)
                .input('orderstatus', sql.NVarChar, req.body.orderstatus)

                .query(
                    "insert into orderlist(modelname,itemname,lotno,marchine,quantity,productdate,status,contentname,bomno,orderid,materialstatus,qrno,a,b,c,d,orderstatus)" +
                    " values(@modelname,@itemname,@lotno,@marchine,@quantity,@productdate,@status,@contentname,@bomno,@orderid,@materialstatus,'30AF8B0C-AE78-4E60-8A41-C7F5EA51854A',@a,@b,@c,@d,@orderstatus)"
                )
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish


    // **** start       
    sql.connect(config).then(pool => {
        app.post('/api/abcd', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");

            return pool.request()
                .input('A', sql.NVarChar, req.body.data1)
                // .input('B', sql.Int, req.body.data2)




                .query(
                    'insert into test(A)' +
                    ' values(@A)'
                )
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish
    // **** start       
    sql.connect(config).then(pool => {
        app.post('/api/planinsert', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");

            return pool.request()
                .input('plandate', sql.NVarChar, req.body.plandate)
                .input('bomno', sql.NVarChar, req.body.bomno)
                .input('modelname', sql.NVarChar, req.body.modelname)
                .input('itemname', sql.NVarChar, req.body.itemname)
                .input('lotno', sql.NVarChar, req.body.lotno)
                .input('pono', sql.NVarChar, req.body.pono)
                .input('equipmentname', sql.NVarChar, req.body.equipmentname)
                .input('num', sql.Int, req.body.num)
                .query(
                    'insert into produceplan(plandate,bomno,modelname,itemname,lotno,pono,equipmentname,num)' +
                    ' values(@plandate,@bomno,@modelname,@itemname,@lotno,@pono,@equipmentname,@num)'
                )
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish



    // **** start       

    sql.connect(config).then(pool => {
        app.post('/api/planupdate', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");
            // console.log('req', req)
            // console.log('req', req.body.id, req.body.num)
            return pool.request()
                .input('plandate', sql.NVarChar, req.body.plandate)
                .input('bomno', sql.NVarChar, req.body.bomno)
                .input('modelname', sql.NVarChar, req.body.modelname)
                .input('itemname', sql.NVarChar, req.body.itemname)
                .input('lotno', sql.NVarChar, req.body.lotno)
                .input('pono', sql.NVarChar, req.body.pono)
                .input('equipmentname', sql.NVarChar, req.body.equipmentname)
                .input('num', sql.Int, req.body.num)
                .input('id', sql.Int, req.body.id)
                .query(

                    'update produceplan set plandate=@plandate' +
                    ',bomno=@bomno,' +
                    'modelname=@modelname,' +
                    'itemname=@itemname,' +
                    'lotno=@lotno,' +
                    'pono=@pono,' +
                    'equipmentname=@equipmentname,' +
                    'num=@num' +
                    ' where id=@id'

                )
                .then(result => {
                    // console.log(result)
                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish
    // **** start       

    sql.connect(config).then(pool => {
        app.post('/api/slitingupdate', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");

            return pool.request()
                .input('finalmaterialwidth', sql.Float, req.body.finalmaterialwidth)
                .input('finalm', sql.Float, req.body.finalm)
                .input('finalroll', sql.Float, req.body.finalroll)
                .input('finaltotal', sql.Float, req.body.finaltotal)
                .input('id', sql.Int, req.body.id)
                .query(

                    'update slitingplan set finalmaterialwidth=@finalmaterialwidth,finalm=@finalm,finalroll=@finalroll,finaltotal=@finaltotal where id=@id'


                )
                .then(result => {
                    // console.log(result)
                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish
    sql.connect(config).then(pool => {
        app.post('/api/insertslitingupdate', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");

            return pool.request()
                .input('slitingdate', sql.NVarChar, req.body.slitingdate)
                .input('part', sql.NVarChar, req.body.part)
                .input('materialname', sql.NVarChar, req.body.materialname)
                .input('classification', sql.NVarChar, req.body.classification)
                .input('materialwidth', sql.Float, req.body.materialwidth)
                .input('m', sql.Float, req.body.m)
                .input('roll', sql.Float, req.body.roll)
                .input('total', sql.Float, req.body.total)
                .input('aftermaterialwidth', sql.Float, req.body.aftermaterialwidth)
                .input('afterm', sql.Float, req.body.afterm)
                .input('afterroll', sql.Float, req.body.afterroll)
                .input('aftertotal', sql.Float, req.body.aftertotal)
                .input('finalmaterialwidth', sql.Float, req.body.finalmaterialwidth)
                .input('finalm', sql.Float, req.body.finalm)
                .input('finalroll', sql.Float, req.body.finalroll)
                .input('finaltotal', sql.Float, req.body.finaltotal)
                .query(

                    'insert into slitingplan(slitingdate,part,materialname,classification,materialwidth,m,roll,total,aftermaterialwidth,afterm,afterroll,aftertotal,finalmaterialwidth,finalm,finalroll,finaltotal)' +
                    ' values(@slitingdate,@part,@materialname,@classification,@materialwidth,@m,@roll,@total,@aftermaterialwidth,@afterm,@afterroll,@aftertotal,@finalmaterialwidth,@finalm,@finalroll,@finaltotal)'


                )
                .then(result => {
                    // console.log(result)
                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish


    // **** start       
    sql.connect(config).then(pool => {
        app.post('/api/savefile', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");

            const filename = req.body.filename;
            const filedata = req.body.filedata;


            return pool.request()

                .input('filename', sql.NVarChar, filename)
                // .input('filedata', sql.VarBinary, filedata)
                // .input('filedata', mssql.VarBinary(mssql.MAX), filedata)
                .input('filedata', sql.VarBinary, filedata)

                .query(
                    'insert into filesave(filename,filedata)' +
                    ' values(@filename,@filedata)'
                )
                .then(result => {
                    res.json(result.recordset);
                    res.end();
                });
        });
    });
    // **** finish


    // **** start
    sql.connect(config).then(pool => {
        app.post('/api/transference', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");

            return pool.request()
                .query(
                    'select * from transference')
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish
    // **** start
    sql.connect(config).then(pool => {
        app.post('/api/soyodata', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");

            return pool.request()
                .input('orderid', sql.NVarChar, req.body.orderid)
                .query(
                    " SELECT" +
                    "    tb2.materialname, " +
                    "    tb2.swidth, " +
                    "    tb2.soyo, " +
                    "    COALESCE(tb1.quantity, 0) AS quantity, " +
                    "    CASE " +
                    "        WHEN tb2.soyo >= COALESCE(tb1.quantity, 0) THEN '부족' " +
                    "        ELSE '가능' " +
                    "    END AS availability " +
                    "FROM ( " +
                    "    SELECT materialname, " +
                    "           materialwidth, " +
                    "           SUM(quantity) 'quantity', " +
                    "           house " +
                    "    FROM materialinput " +
                    "    WHERE house = '생산창고' " +
                    "    GROUP BY materialname, materialwidth, house " +
                    ") tb1 " +
                    "RIGHT JOIN ( " +
                    "    SELECT bm.materialname, " +
                    "           bm.swidth, " +
                    "           SUM(CEILING(o.quantity * (bm.mwidth / ii.cavity / 1000 * 1.03))) AS soyo " +
                    "    FROM orderlist o " +
                    "    JOIN bommanagement bm ON o.bomno = bm.bomno AND o.orderid = @orderid " +
                    "    JOIN iteminfo ii ON o.bomno = ii.bomno " +
                    "    WHERE o.materialstatus = 'true' " +
                    "    GROUP BY bm.materialname, bm.swidth " +
                    ") tb2 ON tb1.materialname = tb2.materialname")

                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish

    // **** start       
    sql.connect(config).then(pool => {
        app.post('/api/materialsoyo', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");

            return pool.request()
                .input('orderid', sql.NVarChar, req.body.orderid)

                .query(
                    "     SELECT " +
                    "     orderid, " +
                    "     OL.productdate, " +
                    "     OL.lotno, " +
                    "     BOM.bomno, " +
                    "     BOM.model, " +
                    "     BOM.itemname, " +
                    "     BOM.materialname, " +
                    "     BOM.swidth, " +
                    "     FORMAT(BOM.mwidth * OL.quantity, 'N0') AS soyo, " +
                    "     FORMAT(COALESCE(MI.quantity, 0), 'N0') AS materialnum, " +
                    "     FORMAT( " +
                    "         CASE " +
                    "             WHEN BOM.materialname = MI.materialname AND BOM.swidth = MI.materialwidth " +
                    "             THEN BOM.mwidth * OL.quantity - COALESCE(MI.quantity, 0) " +
                    "             ELSE BOM.mwidth * OL.quantity " +
                    "         END, " +
                    "         'N0' " +
                    "     ) AS diff, " +
                    "     CASE " +
                    "         WHEN BOM.mwidth * OL.quantity > COALESCE(MI.quantity, 0) THEN '부족' " +
                    "         WHEN BOM.mwidth * OL.quantity <= COALESCE(MI.quantity, 0) THEN '가능' " +
                    "         ELSE NULL " +
                    "     END AS condition " +
                    " FROM  " +
                    "     bommanagement AS BOM " +
                    "     INNER JOIN ( " +
                    "         SELECT  " +
                    "             orderid, " +
                    "             productdate, " +
                    "             lotno, " +
                    "             itemname,  " +
                    "             SUM(CASE WHEN [status] = 'true' THEN [quantity] ELSE 0 END) AS quantity " +
                    "         FROM " +
                    "             orderlist  " +
                    "         GROUP BY " +
                    "             lotno, itemname, productdate ,orderid  " +
                    "     ) AS OL ON BOM.itemname = OL.itemname " +
                    "     LEFT JOIN ( " +
                    "         SELECT " +
                    "             materialname, " +
                    "             materialwidth, " +
                    "             SUM(quantity) AS quantity " +
                    "         FROM " +
                    "             materialinput " +
                    "         GROUP BY " +
                    "             materialname, " +
                    "             materialwidth " +
                    "     ) AS MI ON BOM.materialname = MI.materialname AND BOM.swidth = MI.materialwidth WHERE BOM.status = 'true' and orderid=@orderid order by orderid asc"
                )

                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish

    // **** start       
    sql.connect(config).then(pool => {
        app.post('/api/materialsoyojisi', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");

            return pool.request()
                .input('orderid', sql.NVarChar, req.body.orderid)

                .query(
                    "  SELECT  "+
                    "    orderid,  "+
                    "    OL.productdate,  "+
                    "    OL.lotno,  "+
                    "    BOM.bomno,  "+
                    "    BOM.model,  "+
                    "    BOM.itemname,  "+
                    "    BOM.materialname,  "+
                    "    BOM.swidth,  "+
                    "    FORMAT(SUM(OL.quantity * BOM.mwidth / iteminfo.cavity / 1000 * 1.03), 'N0') AS soyo,  "+
                    "    FORMAT(COALESCE(SUM(MI.quantity), 0), 'N0') AS materialnum,  "+
                    "    FORMAT(  "+
                    "        CASE  "+
                    "            WHEN BOM.materialname = MI.materialname AND BOM.swidth = MI.materialwidth  "+
                    "            THEN SUM(OL.quantity * BOM.mwidth / iteminfo.cavity / 1000 * 1.03) - COALESCE(SUM(MI.quantity), 0)  "+
                    "            ELSE SUM(OL.quantity * BOM.mwidth / iteminfo.cavity / 1000 * 1.03)  "+
                    "        END,  "+
                    "        'N0'  "+
                    "    ) AS diff,  "+
                    "    CASE  "+
                    "        WHEN SUM(OL.quantity * BOM.mwidth / iteminfo.cavity / 1000 * 1.03) > COALESCE(SUM(MI.quantity), 0) THEN '부족'  "+
                    "        WHEN SUM(OL.quantity * BOM.mwidth / iteminfo.cavity / 1000 * 1.03) <= COALESCE(SUM(MI.quantity), 0) THEN '가능'  "+
                    "        ELSE NULL  "+
                    "    END AS condition  "+
                    "FROM   "+
                    "    bommanagement AS BOM  "+
                    "    INNER JOIN (  "+
                    "        SELECT   "+
                    "            orderid,  "+
                    "            productdate,  "+
                    "            lotno,  "+
                    "            itemname,   "+
                    "            SUM(CASE WHEN [status] = 'true' THEN [quantity] ELSE 0 END) AS quantity  "+
                    "        FROM  "+
                    "            orderlist   "+
                    "        GROUP BY  "+
                    "            lotno, itemname, productdate, orderid   "+
                    "    ) AS OL ON BOM.itemname = OL.itemname  "+
                    "    LEFT JOIN (  "+
                    "        SELECT  "+
                    "            materialname,  "+
                    "            materialwidth,  "+
                    "            SUM(quantity) AS quantity  "+
                    "        FROM  "+
                    "            materialinput  "+
                    "        GROUP BY  "+
                    "            materialname, materialwidth  "+
                    "    ) AS MI ON BOM.materialname = MI.materialname AND BOM.swidth = MI.materialwidth  "+
                    "    LEFT JOIN ("+
                    "        SELECT itemname, cavity "+
                    "        FROM iteminfo "+
                    "    ) AS iteminfo ON BOM.itemname = iteminfo.itemname "+
                    "WHERE BOM.status = 'true'  "+
                    "GROUP BY "+
                    "    orderid, OL.productdate, OL.lotno, BOM.bomno, BOM.model, BOM.itemname, BOM.materialname, BOM.swidth, iteminfo.cavity,MI.materialname,MI.materialwidth "+
                    "ORDER BY materialname ASC"
                )

                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish


    // **** start       
    sql.connect(config).then(pool => {
        app.post('/api/accountmaterialstock', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");
            console.log("11", req)
            return pool.request()
                .query(
                    "select " +
                    " b.codenumber, " +
                    " b.materialname, " +
                    " wa.width, " +
                    " format(convert(int,Isnull(b.swidth * a.quantity,0)),'##,##0') as 'disturbance', " +
                    " format(convert(int,Isnull(wa.cnt,0)),'##,##0') as 'currentstock' " +
                    "  from " +
                    " bommanagement b, " +
                    " accountinput a, " +
                    " (SELECT" +
                    " w.codenumber, w.materialname,w.width, sum(w.count) as 'cnt', w.status" +
                    " FROM " +
                    " warehouse w " +
                    " group by codenumber, materialname,width, status) wa" +
                    " where 1=1 " +
                    " and b.partname = a.itemname " +
                    " and b.codenumber = wa.codenumber" +
                    " and wa.status = '대기'")
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish

    // **** start       
    sql.connect(config).then(pool => {
        app.post('/api/salescontent', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()
                .query(
                    "   select " +
                    "    contentname, " +
                    "    accountdate, " +
                    "    deliverydate, " +
                    "    customer, " +
                    "    bomno, " +
                    "    modelname, " +
                    "    itemname, " +
                    "    FORMAT(itemcost, '#,##0.00') AS itemcost, " +
                    "    FORMAT(itemprice, '#,##0.00') AS itemprice, " +
                    "    FORMAT(quantity, '#,##0.##') AS quantity, " +
                    "    FORMAT((itemprice * quantity), '#,##0.##') AS totalprice, " +
                    "    productok, " +
                    "    materialok " +
                    "    from " +
                    "    accountinput ")
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish
    // **** start       
    sql.connect(config).then(pool => {
        app.post('/api/selectmaterial', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()

            .input('materialname', sql.NVarChar, req.body.materialname)
            .input('materialwidth', sql.Int, req.body.materialwidth)

                .query(
                    "  SELECT "+
                    "    materialname, "+
                    "    materialwidth, "+
                    "    SUM( "+
                    "        CASE "+
                    "            WHEN input = '원자재출고' THEN -quantity "+
                    "            ELSE quantity "+
                    "        END "+
                    "    ) AS totalcount "+
                    "FROM "+
                    "    materialinput "+
                    "WHERE "+
                    "    materialname = @materialname "+
                    "    AND materialwidth > @materialwidth "+
                    "GROUP BY "+
                    "    materialname, materialwidth, materialid; ")
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish
    // **** start       
    sql.connect(config).then(pool => {
        app.post('/api/insertsltmaterial', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()

            .input('slitingdate', sql.NVarChar, req.body.slitingdate)
            .input('part', sql.NVarChar, req.body.part)
            .input('materialname', sql.NVarChar, req.body.materialname)
            .input('classification', sql.NVarChar, req.body.classification)
            .input('materialwidth', sql.Float, req.body.materialwidth)
            .input('m', sql.Float, req.body.m)
            .input('roll', sql.Float, req.body.roll)
            .input('total', sql.Float, req.body.total)
            .input('afterm', sql.Float, req.body.afterm)
            .input('aftermaterialwidth', sql.Float, req.body.aftermaterialwidth)
            .input('afterroll', sql.Float, req.body.afterroll)
            .input('aftertotal', sql.Float, req.body.aftertotal)
            .input('finalmaterialwidth', sql.Float, req.body.finalmaterialwidth)
            .input('finalm', sql.Float, req.body.finalm)
            .input('finalroll', sql.Float, req.body.finalroll)
            .input('finaltotal', sql.Float, req.body.finaltotal)
            .input('orderno', sql.NVarChar, req.body.orderno)
            .input('trash', sql.NVarChar, req.body.trash)

                .query(
                    'insert into slitingplan(slitingdate,part,materialname,classification,materialwidth,m,roll,total,afterm,aftermaterialwidth,afterroll,aftertotal,finalmaterialwidth,finalm,finalroll,finaltotal,orderno,trash)' +
                    ' values(@slitingdate,@part,@materialname,@classification,@materialwidth,@m,@roll,@total,@afterm,@aftermaterialwidth,@afterroll,@aftertotal,@finalmaterialwidth,@finalm,@finalroll,@finaltotal,@orderno,@trash)'
                )
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish


    // **** start       
    sql.connect(config).then(pool => {
        app.post('/api/accountmaterialstock2', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");
            console.log("11", req)
            return pool.request()
                .query(
                    "select " +
                    " b.codenumber, " +
                    " b.materialname, " +
                    " wa.width, " +
                    " format(convert(int,Isnull((b.swidth * a.productcount),0)),'##,##0') as 'disturbance', " +
                    " format(convert(int,Isnull(wa.cnt,0)),'##,##0')  as 'currentstock' " +
                    "  from " +
                    " bommanagement b, " +
                    " productinput a, " +
                    " (SELECT" +
                    " w.codenumber, w.materialname,w.width, sum(w.count) as 'cnt' " +
                    " FROM " +
                    " warehouse w " +
                    "   WHERE status = '대기'" +
                    " group by codenumber, materialname,width) wa " +
                    " where 1=1" +
                    " and b.partname = a.productname " +
                    " and b.codenumber = wa.codenumber")
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish

    // **** start       
    sql.connect(config).then(pool => {
        app.post('/api/accountmaterial', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");
            console.log("11", req)
            return pool.request()
                .query(
                    " SELECT " +
                    " A.id, " +
                    " A.deliverydate, " +
                    " A.MODELNAME, " +
                    " A.ITEMNAME, " +
                    " A.QUANTITY, " +
                    " CASE WHEN I.QUANTITY IS NULL THEN 0 ELSE I.QUANTITY END AS 'DIFFERENCE' " +
                    " FROM " +
                    " ITEMINPUT AS I " +
                    " RIGHT OUTER JOIN ACCOUNTINPUT AS A " +
                    " ON I.MODELNAME =  A.MODELNAME ")

                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish

    // **** start       
    sql.connect(config).then(pool => {
        app.post('/api/accountordering', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");

            return pool.request()

                .query(
                    // "  WITH cte AS ( " +
                    // "      SELECT " +
                    // "        a.contentname,a.deliverydate, a.customer,a.modelname, a.itemname, a.quantity, a.bomno, " +
                    // "        SUM(i.quantity) AS total_quantity, " +
                    // "        ROW_NUMBER() OVER (PARTITION BY a.modelname, a.itemname ORDER BY a.deliverydate ASC) AS row_num " +
                    // "      FROM accountinput a " +
                    // "      JOIN iteminput i ON a.modelname = i.modelname AND a.itemname = i.itemname  " +
                    // "      GROUP BY a.contentname, a.modelname, a.itemname, a.quantity , a.deliverydate ,a.customer, a.bomno " +
                    // "    ), recursive_cte AS ( " +
                    // "      SELECT " +
                    // "      bomno, contentname,deliverydate,customer,modelname, itemname, quantity, total_quantity, " +
                    // "          total_quantity - quantity AS difference, " +
                    // "        row_num " +
                    // "      FROM cte " +
                    // "      WHERE row_num = 1 " +
                    // "      UNION ALL  " +
                    // "      SELECT " +
                    // "      c.bomno, c.contentname,c.deliverydate,c.customer, c.modelname, c.itemname, c.quantity, c.total_quantity, " +
                    // "        rc.difference - c.quantity AS difference, " +
                    // "        c.row_num " +
                    // "      FROM cte c " +
                    // "      JOIN recursive_cte rc " +
                    // "        ON c.modelname = rc.modelname  " +
                    // "        AND c.itemname = rc.itemname  " +
                    // "        AND c.row_num = rc.row_num + 1 " +
                    // "    ) " +
                    // "    SELECT contentname,bomno,deliverydate,customer,modelname, itemname, quantity, difference, " +
                    // "     case when (difference)>=0  then '가능' else '부족' end as possible  " +
                    // "    FROM recursive_cte  "
                    "   WITH cte AS (   " +
                    "        SELECT   " +
                    "            a.ad,a.contentname,a.deliverydate, a.customer,a.modelname, a.itemname, a.quantity, a.bomno,   " +
                    "            SUM(ISNULL(i.quantity, 0)) AS total_quantity,   " +
                    "            ROW_NUMBER() OVER (PARTITION BY a.modelname, a.itemname ORDER BY a.deliverydate ASC) AS row_num   " +
                    "        FROM accountinput a   " +
                    "        LEFT JOIN iteminput i ON a.modelname = i.modelname AND a.itemname = i.itemname    " +
                    "         WHERE a.status = '생산발주대기'   " +
                    "        GROUP BY a.ad,a.contentname, a.modelname, a.itemname, a.quantity , a.deliverydate ,a.customer, a.bomno   " +
                    "    ), recursive_cte AS (   " +
                    "        SELECT   " +
                    "            ad,bomno, contentname,deliverydate,customer,modelname, itemname, quantity, total_quantity,   " +
                    "            total_quantity - quantity AS difference,   " +
                    "            row_num   " +
                    "        FROM cte   " +
                    "        WHERE row_num = 1   " +
                    "        UNION ALL    " +
                    "        SELECT   " +
                    "            c.ad, c.bomno, c.contentname,c.deliverydate,c.customer, c.modelname, c.itemname, c.quantity, c.total_quantity,   " +
                    "            rc.difference - c.quantity AS difference,   " +
                    "            c.row_num   " +
                    "        FROM cte c   " +
                    "        JOIN recursive_cte rc   " +
                    "            ON c.modelname = rc.modelname    " +
                    "            AND c.itemname = rc.itemname    " +
                    "            AND c.row_num = rc.row_num +  1   " +
                    "    )   " +
                    "    SELECT  " +
                    "        contentname,bomno,deliverydate,customer,modelname, itemname, FORMAT(quantity, '#,0') AS quantity, FORMAT(difference, '#,0') AS difference,  " +
                    "        CASE WHEN (difference)>=0  THEN '가능' ELSE '부족' END AS possible, " +
                    "       ad " +
                    "    FROM recursive_cte "
                )
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish

    // **** start      재고 조회 쿼리 
    sql.connect(config).then(pool => {
        app.post('/api/materialstock', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");
            console.log("11", req)
            return pool.request()
                .query(
                    "select codenumber,materialname,width" +
                    ",  format(convert(int,Isnull(SUM(count),0)),'##,##0')'stock' " +

                    " From warehouse  GROUP BY  codenumber, materialname, width ")
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish

    // **** start 영업진행 조회 쿼리 
    sql.connect(config).then(pool => {
        app.post('/api/accounting', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");

            return pool.request()
                .query(
                    " select " +
                    " id, " +
                    " deliverydate, " +
                    " customer, " +
                    " modelname, " +
                    " itemname, " +
                    " format(convert(int,Isnull(quantity,0)),'##,##0')  as 'quantity', " +
                    " salesorder, " +
                    " productionorder, " +
                    " material, " +
                    " production, " +
                    " test, " +
                    " shipment, " +
                    " datediff(day,salesorder,shipment)'difference', " +
                    " CASE " +
                    " WHEN DATEDIFF(day, GETDATE(), deliverydate) < 0 THEN '납기일이 지났습니다' " +
                    " ELSE CONVERT(VARCHAR(10), DATEDIFF(day, GETDATE(), deliverydate)) + '일 남았습니다' " +
                    " END AS difference1 " +
                    " from " +
                    " accountinput ")
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish

    // **** start 영업진행 조회 쿼리 
    sql.connect(config).then(pool => {
        app.post('/api/accountend', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");

            return pool.request()
                .query(
                    " select " +
                    " id, " +
                    " deliverydate, " +
                    " customer, " +
                    " modelname, " +
                    " itemname, " +
                    " quantity, " +
                    " salesorder, " +
                    " productionorder, " +
                    " material, " +
                    " production, " +
                    " test, " +
                    " shipment, " +
                    " datediff(day,salesorder,shipment)'difference' " +
                    " from " +
                    " accountinput where status='완료' ")
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish

    // **** start       
    sql.connect(config).then(pool => {
        app.post('/api/salesfinish', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");

            return pool.request()
                .input('start', sql.NVarChar, req.body.orderdate)
                .input('finish', sql.NVarChar, req.body.deliverydate)
                .query(
                    " select" +
                    " * " +
                    "from purchaseorder " +
                    "where deliverydate between @start and @finish " +
                    "and status=" +
                    "'영업완료'")
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish

    // **** start       
    sql.connect(config).then(pool => {
        app.post('/api/materialstock', function (req, res) {
            console.log("req", req)
            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()
                .query(
                    "  select " +
                    "  *" +
                    "   from" +

                    "  (select " +
                    "  date," +
                    "  input," +
                    "  materialname," +
                    "  codenumber," +
                    "  lotno," +
                    "  manufacturedate," +
                    "  expirationdate," +
                    "  materialwidth," +
                    "  quantity," +
                    "  roll," +
                    "  sum," +
                    "  price " +
                    "  from materialinput " +
                    "  union all " +

                    "  select " +
                    "  (CASE WHEN date iS NULL THEN '합계'else '소계' end)'date'," +
                    "  (CASE WHEN date iS not null THEN null else '' end)'input'," +
                    "  (CASE WHEN date iS not null THEN null else '' end)'materialname'," +
                    "  (CASE WHEN date iS not null THEN codenumber else '' end)'materialname'," +
                    "  (CASE WHEN date iS not null THEN null else '' end)'lotno'," +
                    "  (CASE WHEN date iS not null THEN null else '' end)'manufacturedate'," +
                    "  (CASE WHEN date iS not null THEN null else '' end)'expirationdate'," +
                    "  (CASE WHEN date iS not null THEN null else '' end)'materialwidth'," +
                    "  (CASE WHEN date iS not null THEN null else '' end)'lotno'," +
                    "  roll," +
                    "  sum," +
                    "  price " +
                    "   from (" +
                    "  select " +

                    "  date," +
                    "  input," +
                    "  materialname," +
                    "  codenumber," +
                    "  lotno," +
                    "  manufacturedate," +
                    "  expirationdate," +
                    "  materialwidth," +
                    "  quantity," +
                    "  sum(roll)'roll'," +
                    "  sum(sum)'sum'," +
                    "  sum(price)'price' " +


                    "  from materialinput " +

                    "  GROUP BY ROLLUP(" +

                    "  date," +
                    "  input," +
                    "  materialname," +
                    "  codenumber," +
                    "  lotno," +
                    "  manufacturedate," +
                    "  expirationdate," +
                    "  materialwidth," +
                    "  quantity" +
                    "  ) " +
                    "  ) tb " +
                    "  where 1=1 " +
                    "  and ((quantity is not null) or (date is null)) " +
                    "  )tb2 " +
                    "  order by codenumber desc, price asc"
                )
                .then(result => {
                    console.log(result.recordset)
                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish
    // **** start       
    sql.connect(config).then(pool => {
        app.post('/api/accountinfoinsertdata', function (req, res) {

            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()
                //.input('변수',값 형식, 값)
                .input('accountcode', sql.NVarChar, req.body.accountcode)
                .input('accountname', sql.NVarChar, req.body.accountname)
                .input('representativename', sql.NVarChar, req.body.representativename)
                .input('phone', sql.NVarChar, req.body.phone)
                .input('adress', sql.NVarChar, req.body.adress)
                .input('number', sql.NVarChar, req.body.number)
                .input('mobile', sql.NVarChar, req.body.mobile)
                .input('email', sql.NVarChar, req.body.email)
                .input('fax', sql.NVarChar, req.body.fax)
                .input('etc', sql.NVarChar, req.body.etc)


                .query(
                    'insert into Accountmanagement(accountcode,accountname,representativename,phone,adress,number,mobile,email,fax,etc)' +
                    ' values(@accountcode,@accountname,@representativename,@phone,@adress,@number,@mobile,@email,@fax,@etc)'
                )
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish

    // **** start       
    sql.connect(config).then(pool => {
        app.post('/api/productlistinsertdata', function (req, res) {

            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()
                //.input('변수',값 형식, 값)
                .input('productdate', sql.NVarChar, req.body.productdate)
                .input('modelname', sql.NVarChar, req.body.modelname)
                .input('productname', sql.NVarChar, req.body.productname)
                .input('bomno', sql.NVarChar, req.body.bomno)
                .input('lotno', sql.NVarChar, req.body.lotno)
                .input('productnumber', sql.NVarChar, req.body.productnumber)
                .input('productcount', sql.NVarChar, req.body.productcount)
                .input('status', "생산발주완료")

                .query(
                    'insert into productinput(productdate,modelname,productname,bomno,lotno,productnumber,productcount,status)' +
                    ' values(@productdate,@modelname,@productname,@bomno,@lotno,@productnumber,@productcount,@status)'
                )
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish
    // **** start       
    sql.connect(config).then(pool => {
        app.post('/api/insertalltest', function (req, res) {

            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()
                //.input('변수',값 형식, 값)
                .input('bom', sql.NVarChar, req.body.bom)
                .input('testdate', sql.NVarChar, req.body.testdate)
                .input('modelname', sql.NVarChar, req.body.modelname)
                .input('itemname', sql.NVarChar, req.body.itemname)
                .input('lotno', sql.NVarChar, req.body.lotno)
                .input('productdate', sql.NVarChar, req.body.productdate)
                .input('productno', sql.NVarChar, req.body.productno)
                .input('count', sql.Float, req.body.count)
                .input('okcount', sql.Float, req.body.okcount)
                .input('ngcount', sql.Float, req.body.ngcount)
                .input('ng1', sql.Int, req.body.ng1)
                .input('ng2', sql.Int, req.body.ng2)
                .input('ng3', sql.Int, req.body.ng3)
                .input('ng4', sql.Int, req.body.ng4)
                .input('ng5', sql.Int, req.body.ng5)
                .input('ng6', sql.Int, req.body.ng6)
                .input('ng7', sql.Int, req.body.ng7)
                .input('ng8', sql.Int, req.body.ng8)
                .input('ng9', sql.Int, req.body.ng9)
                .input('ng10', sql.Int, req.body.ng10)
                .input('ng11', sql.Int, req.body.ng11)
                .input('ng12', sql.Int, req.body.ng12)
                .input('ng13', sql.Int, req.body.ng13)
                .input('ng14', sql.Int, req.body.ng14)
                .input('ng15', sql.Int, req.body.ng15)
                .input('ng16', sql.Int, req.body.ng16)


                .query(
                    'insert into alltest(bom,testdate,modelname,itemname,lotno,productdate,productno,count,okcount,ngcount,ng1,ng2,ng3,ng4,ng5,ng6,ng7,ng8,ng9,ng10,ng11,ng12,ng13,ng14,ng15,ng16)' +
                    ' values(@bom,@testdate,@modelname,@itemname,@lotno,@productdate,@productno,@count,@okcount,@ngcount,@ng1,@ng2,@ng3,@ng4,@ng5,@ng6,@ng7,@ng8,@ng9,@ng10,@ng11,@ng12,@ng13,@ng14,@ng15,@ng16)'
                )
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish

    // **** start       
    sql.connect(config).then(pool => {
        app.post('/api/accountinfoupdatedata', function (req, res) {
            console.log("res", res)
            console.log("req", req)

            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()
                //.input('변수',값 형식, 값)
                .input('id', sql.Int, req.body.id)
                .input('accountcode', sql.NVarChar, req.body.accountcode)
                .input('accountname', sql.NVarChar, req.body.accountname)
                .input('representativename', sql.NVarChar, req.body.representativename)
                .input('phone', sql.NVarChar, req.body.phone)
                .input('adress', sql.NVarChar, req.body.adress)


                .query(
                    'update Accountmanagement set accountcode=@accountcode,accountname=@accountname,representativename=@representativename,phone=@phone,adress=@adress where id=@id'
                )
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish
    // **** start       
    sql.connect(config).then(pool => {
        app.post('/api/updatea', function (req, res) {

            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()

                .input('qrno', sql.NVarChar, req.body.qrno)
                .input('a', sql.NVarChar, req.body.a)


                .query(
                    'update orderlist set a=@a where qrno=@qrno'
                )
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish

    // **** start       
    sql.connect(config).then(pool => {
        app.post('/api/orderchange', function (req, res) {

            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()

                .input('productdate', sql.NVarChar, req.body.productdate)
                .input('quantity', sql.Int, req.body.quantity)
                .input('id', sql.Int, req.body.id)


                .query(
                    'update orderlist set quantity=@quantity,productdate=@productdate where id=@id'
                )
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish

    // **** start       
    sql.connect(config).then(pool => {
        app.post('/api/updateorderstatus', function (req, res) {

            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()

                .input('id', sql.Int, req.body.id)
                .input('orderstatus', sql.NVarChar, req.body.orderstatus)


                .query(
                    'update orderlist set orderstatus=@orderstatus where id=@id'


                )
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish
    // **** start       
    sql.connect(config).then(pool => {
        app.post('/api/deleteorderstatus', function (req, res) {

            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()


                .input('id', sql.Int, req.body.id)



                .query(
                    'delete from orderlist where id=@id'

                )
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish

    // **** start       
    sql.connect(config).then(pool => {
        app.post('/api/statusfalse', function (req, res) {

            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()

                .input('orderstatus', sql.NVarChar, req.body.orderstatus)
                .input('lotno', sql.NVarChar, req.body.lotno)


                .query(
                    'update orderlist set orderstatus=@orderstatus where lotno=@lotno'
                )
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish
    // **** start       
    sql.connect(config).then(pool => {
        app.post('/api/updateb', function (req, res) {

            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()

                .input('qrno', sql.NVarChar, req.body.qrno)
                .input('b', sql.NVarChar, req.body.b)
                .input('a', sql.NVarChar, req.body.a)


                .query(
                    'update orderlist set a=@a,b=@b where qrno=@qrno'
                )
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish
    // **** start       
    sql.connect(config).then(pool => {
        app.post('/api/updateorderliststatus', function (req, res) {


            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()

                .input('contentname', sql.NVarChar, req.body.contentname)
                .input('status', sql.NVarChar, req.body.status)


                .query(
                    'update accountinput set status=@status where contentname=@contentname'
                )
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish

    // **** start       
    sql.connect(config).then(pool => {
        app.post('/api/orderlistupdate', function (req, res) {
            console.log("res", res)
            console.log("req", req)

            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()

                .input('orderid', sql.NVarChar, req.body.orderid)
                .input('materialinput', sql.Float, req.body.materialinput)


                .query(
                    'update orderlist set materialinput=@materialinput where orderid=@orderid'
                )
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish
    // **** start       
    sql.connect(config).then(pool => {
        app.post('/api/materialoutputdelete', function (req, res) {


            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()

                .input('orderid', sql.NVarChar, req.body.orderid)
                .input('materialstatus', sql.NVarChar, req.body.materialstatus)


                .query(
                    'update orderlist set materialstatus=@materialstatus where orderid=@orderid'
                )
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish

    // **** start       
    sql.connect(config).then(pool => {
        app.post('/api/orderlistmaterialoutput', function (req, res) {

            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()

                .input('lotno', sql.NVarChar, req.body.lotno)
                .input('materialoutput', sql.Float, req.body.materialoutput)


                .query(
                    'update orderlist set materialoutput=@materialoutput where lotno=@lotno'
                )
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish


    sql.connect(config).then(pool => {
        app.post('/api/updateorderlist', function (req, res) {


            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()
                //.input('변수',값 형식, 값)


                .input('materialinput', sql.Float, req.body.materialinput)
                .input('materialoutput', sql.Float, req.body.materialoutput)
                .query(
                    "update orderlist set materialinput=@materialinput,materialoutput=@materialoutput "
                )
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish


    // **** start       
    sql.connect(config).then(pool => {
        app.post('/api/startproduct', function (req, res) {


            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()
                //.input('변수',값 형식, 값)
                .input('id', sql.Int, req.body.id)
                .input('startdate', sql.NVarChar, req.body.startdate)
                .input('marchine', sql.NVarChar, req.body.marchine)
                .input('starttime', sql.NVarChar, req.body.starttime)
                .input('status', sql.NVarChar, req.body.status)
                .input('materialstatus', sql.NVarChar, req.body.materialstatus)
                .input('materialinput', sql.Float, req.body.materialinput)


                .query(
                    'update orderlist set startdate=@startdate,marchine=@marchine,starttime=@starttime,status=@status,materialstatus=@materialstatus,materialinput=@materialinput where id=@id'
                )
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish
    // **** start       
    sql.connect(config).then(pool => {
        app.post('/api/finishinproduct', function (req, res) {


            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()
                //.input('변수',값 형식, 값)
                .input('id', sql.Int, req.body.id)

                .input('finaltime', sql.NVarChar, req.body.finaltime)
                .input('status', sql.NVarChar, req.body.status)
                .input('touch', sql.Float, req.body.touch)


                .query(
                    'update orderlist set finaltime=@finaltime,touch=@touch,status=@status where id=@id'
                )
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish
    // **** start       
    sql.connect(config).then(pool => {
        app.post('/api/finishinproduct1', function (req, res) {


            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()

                .input('materialoutput', sql.Float, req.body.materialoutput)
                .input('materialname', sql.NVarChar, req.body.materialname)
                .input('pono', sql.NVarChar, req.body.pono)
                .input('lotno', sql.NVarChar, req.body.lotno)


                .query(
                    'update bommanagement1 set materialoutput=@materialoutput where materialname=@materialname and pono=@pono and lotno=@lotno'
                )
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish

    // **** start       
    sql.connect(config).then(pool => {
        app.post('/api/startinspection', function (req, res) {


            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()
                //.input('변수',값 형식, 값)
                .input('id', sql.Int, req.body.id)
                .input('inspectiondate', sql.NVarChar, req.body.inspectiondate)
                .input('start', sql.NVarChar, req.body.start)
                .input('status', sql.NVarChar, req.body.status)


                .query(
                    "update allteststatus set inspectiondate=@inspectiondate,start=@start,status=@status where id=@id "
                )
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish

    // **** start       
    sql.connect(config).then(pool => {
        app.post('/api/finishproduct', function (req, res) {


            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()
                //.input('변수',값 형식, 값)
                .input('id', sql.Int, req.body.id)
                .input('finaltime', sql.NVarChar, req.body.finaltime)
                .input('touch', sql.NVarChar, req.body.touch)


                .query(
                    'update orderlist set finaltime=@finaltime,touch=@touch where id=@id'
                )
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish
    // **** start       
    sql.connect(config).then(pool => {
        app.post('/api/finishinspection', function (req, res) {


            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()
                //.input('변수',값 형식, 값)
                .input('id', sql.Int, req.body.id)
                .input('finish', sql.NVarChar, req.body.finish)


                .query(
                    "update allteststatus set finish=@finish,status='검사완료' where id=@id"
                )
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish


    // **** start       
    sql.connect(config).then(pool => {
        app.post('/api/updatebominput', function (req, res) {


            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()


                .input('modelname', sql.NVarChar, req.body.modelname)
                .input('itemname', sql.NVarChar, req.body.itemname)
                .input('itemcode', sql.NVarChar, req.body.itemcode)
                .input('bomno', sql.NVarChar, req.body.bomno)
                .input('customer', sql.NVarChar, req.body.customer)
                .input('working', sql.NVarChar, req.body.working)
                .input('cost', sql.Float, req.body.cost)
                .input('cavity', sql.Int, req.body.cavity)
                .input('onepidding', sql.Float, req.body.onepidding)
                .input('twopidding', sql.Float, req.body.twopidding)
                .input('one', sql.Float, req.body.one)
                .input('two', sql.Float, req.body.two)
                .input('rev', sql.NVarChar, req.body.rev)
                .input('updatedate', sql.NVarChar, req.body.updatedate)
                .input('minus', sql.Float, req.body.minus)
                .input('part', sql.NVarChar, req.body.part)
                .input('itemprice', sql.Float, req.body.itemprice)


                .query(
                    'update iteminfo set modelname=@modelname,itemname=@itemname,itemcode=@itemcode,bomno=@bomno,customer=@customer,working=@working,cost=@cost,cavity=@cavity,onepidding=@onepidding,twopidding=@twopidding,one=@one,two=@two,rev=@rev,updatedate=@updatedate,minus=@minus,part=@part,itemprice=@itemprice where bomno=@bomno'
                )
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish


    // **** start       
    sql.connect(config).then(pool => {
        app.post('/api/updateing', function (req, res) {
            console.log("res", res)
            console.log("req", req)

            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()
                //.input('변수',값 형식, 값)
                .input('id', sql.Int, req.body.id)
                .input('productionorder', sql.NVarChar, req.body.productionorder)


                .query(
                    'update accountinput set productionorder=@productionorder where id=@id'
                )
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish


    // **** start       
    sql.connect(config).then(pool => {
        app.post('/api/accountupdatedata', function (req, res) {


            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()
                //.input('변수',값 형식, 값)
                .input('id', sql.Int, req.body.id)
                .input('accountcode', sql.NVarChar, req.body.accountcode)
                .input('accountname', sql.NVarChar, req.body.accountname)
                .input('representativename', sql.NVarChar, req.body.representativename)
                .input('phone', sql.NVarChar, req.body.phone)
                .input('number', sql.NVarChar, req.body.number)
                .input('fax', sql.NVarChar, req.body.fax)
                .input('mobile', sql.NVarChar, req.body.mobile)
                .input('email', sql.NVarChar, req.body.email)
                .input('adress', sql.NVarChar, req.body.adress)
                .input('etc', sql.NVarChar, req.body.etc)


                .query(
                    "update accountmanagement set accountcode=@accountcode,accountname=@accountname,representativename=@representativename,phone=@phone,adress=@adress,number=@number,email=@email,etc=@etc,fax=@fax,mobile=@mobile  where id=@id "
                )
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish

    // **** start       
    sql.connect(config).then(pool => {
        app.post('/api/updateinspection', function (req, res) {


            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()
                //.input('변수',값 형식, 값)
                .input('id', sql.Int, req.body.id)


                .query(
                    "update inspection set final='수입검사완료' where id=@id "
                )
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish

    // **** start       
    sql.connect(config).then(pool => {
        app.post('/api/updateinspectionmaterial', function (req, res) {
            console.log(req.body.materialname)

            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()
                //.input('변수',값 형식, 값)
                .input('materialname', sql.NVarChar, req.body.materialname)
                .input('lotno', sql.NVarChar, req.body.lotno)


                .query(
                    "update materialinput set part='입고완료' where materialname=@materialname and input='원자재입고' and lotno=@lotno"
                )
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish


    // **** start
    sql.connect(config).then(pool => {
        app.post('/api/bomupdatedata', function (req, res) {


            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()
                //.input('변수',값 형식, 값)
                .input('id', sql.Int, req.body.id)
                .input('marchine', sql.NVarChar, req.body.marchine)
                .input('customer', sql.NVarChar, req.body.customer)
                .input('pcs', sql.NVarChar, req.body.pcs)
                .input('working', sql.NVarChar, req.body.working)
                .input('cavity', sql.NVarChar, req.body.cavity)
                .input('onepidding', sql.NVarChar, req.body.onepidding)
                .input('twopidding', sql.NVarChar, req.body.twopidding)
                .input('rev', sql.NVarChar, req.body.rev)


                .query(
                    'update iteminfo set working=@working,customer=@customer,pcs=@pcs,marchine=@marchine,cavity=@cavity,onepidding=@onepidding,twopidding=@twopidding,rev=@rev where id=@id'
                )
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish

    // **** start       
    sql.connect(config).then(pool => {
        app.post('/api/equipmentupdatedata', function (req, res) {


            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()
                //.input('변수',값 형식, 값)
                .input('id', sql.Int, req.body.id)
                .input('codenumber', sql.NVarChar, req.body.codenumber)
                .input('equipmentname', sql.NVarChar, req.body.equipmentname)
                .input('part', sql.NVarChar, req.body.part)
                .input('size', sql.NVarChar, req.body.size)
                .input('num', sql.NVarChar, req.body.num)
                .input('customer', sql.NVarChar, req.body.customer)
                .input('position', sql.NVarChar, req.body.position)
                .input('etc', sql.NVarChar, req.body.etc)


                .query(
                    'update equipment set codenumber=@codenumber,equipmentname=@equipmentname,part=@part,size=@size,num=@num,customer=@customer,position=@position,etc=@etc where id=@id'
                )
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish


    // **** start       
    sql.connect(config).then(pool => {
        app.post('/api/accountinfodeletedata', function (req, res) {

            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()
                //.input('변수',값 형식, 값)
                .input('id', sql.Int, req.body.id)


                .query(
                    'delete from  Accountmanagement where id=@id'
                )
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish
    // **** start       
    sql.connect(config).then(pool => {
        app.post('/api/materialsoyodelete', function (req, res) {

            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()
                //.input('변수',값 형식, 값)
                .input('materialid', sql.NVarChar, req.body.materialid)
                .input('quantity', sql.Int, req.body.quantity)


                .query(
                    'delete from  materialinput where materialid=@materialid and quantity=@quantity'
                )
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish

    // **** start       
    sql.connect(config).then(pool => {
        app.post('/api/materialinputdeletedata', function (req, res) {

            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()
                //.input('변수',값 형식, 값)
                .input('id', sql.Int, req.body.id)


                .query(
                    'delete from  materialinput where id=@id'
                )
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish

    // **** start       
    sql.connect(config).then(pool => {
        app.post('/api/materialbasedeletedata', function (req, res) {

            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()
                //.input('변수',값 형식, 값)
                .input('id', sql.Int, req.body.id)


                .query(
                    'delete from  materialbase where id=@id'
                )
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish

    // **** start   설비삭제
    sql.connect(config).then(pool => {
        app.post('/api/equipmentdeletedata', function (req, res) {

            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()
                //.input('변수',값 형식, 값)
                .input('id', sql.Int, req.body.id)


                .query(
                    'delete from  equipment where id=@id'
                )
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish

    // **** start  부서등록    
    sql.connect(config).then(pool => {
        app.post('/api/departmentinsertdata', function (req, res) {

            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()
                //.input('변수',값 형식, 값)
                .input('departmentcode', sql.NVarChar, req.body.departmentcode)
                .input('departmentname', sql.NVarChar, req.body.departmentname)


                .query(
                    'insert into department(departmentcode,departmentname)' +
                    ' values(@departmentcode,@departmentname)'
                )
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish
    // **** start  창고등록    
    sql.connect(config).then(pool => {
        app.post('/api/houseinsertdata', function (req, res) {

            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()
                //.input('변수',값 형식, 값)
                .input('housecode', sql.NVarChar, req.body.housecode)
                .input('housename', sql.NVarChar, req.body.housename)
                .input('part', sql.NVarChar, req.body.part)
                .input('partname', sql.NVarChar, req.body.partname)


                .query(
                    'insert into house(housecode,housename,part,partname)' +
                    ' values(@housecode,@housename,@part,@partname)'
                )
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish
    // **** start  품목등록    
    sql.connect(config).then(pool => {
        app.post('/api/iteminfoinsertdata', function (req, res) {

            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()
                .input('itemcode', sql.NVarChar, req.body.itemcode)
                .input('bomno', sql.NVarChar, req.body.bomno)
                .input('modelname', sql.NVarChar, req.body.modelname)
                .input('itemname', sql.NVarChar, req.body.itemname)
                .input('customer', sql.NVarChar, req.body.customer)
                .input('cost', sql.Float, req.body.cost)
                .input('rev', sql.NVarChar, req.body.rev)
                .input('insertdate', sql.NVarChar, req.body.insertdate)
                .input('minus', sql.Float, req.body.minus)
                .input('working', sql.NVarChar, req.body.working)
                .input('cavity', sql.Int, req.body.cavity)
                .input('onepidding', sql.NVarChar, req.body.onepidding)
                .input('twopidding', sql.NVarChar, req.body.twopidding)
                .input('one', sql.Float, req.body.one)
                .input('two', sql.Float, req.body.two)
                .input('part', sql.NVarChar, req.body.part)
                .input('itemprice', sql.Float, req.body.itemprice)


                .query(
                    'insert into iteminfo(itemcode,bomno,modelname,itemname,customer,cost,rev,insertdate,minus,working,cavity,onepidding,twopidding,one,two,part,itemprice)' +
                    ' values(@itemcode,@bomno,@modelname,@itemname,@customer,@cost,@rev,@insertdate,@minus,@working,@cavity,@onepidding,@twopidding,@one,@two,@part,@itemprice)'
                )
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish

    // **** start  품목등록    
    sql.connect(config).then(pool => {
        app.post('/api/updatebom', function (req, res) {

            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()
                //.input('변수',값 형식, 값)
                .input('bomno', sql.NVarChar, req.body.bomno)
                .input('model', sql.NVarChar, req.body.model)
                .input('itemname', sql.NVarChar, req.body.itemname)
                .input('materialname', sql.NVarChar, req.body.materialname)
                .input('swidth', sql.Float, req.body.swidth)
                .input('mwidth', sql.Float, req.body.mwidth)
                .input('savedate', sql.NVarChar, req.body.savedate)
                .input('status', sql.NVarChar, req.body.status)
                .input('cost', sql.Float, req.body.cost)
                .input('dpid', sql.Float, req.body.dpid)
                .input('classification', sql.NVarChar, req.body.classification)


                .query(
                    'insert into bommanagement(bomno,model,itemname,materialname,swidth,mwidth,savedate,status,cost,dpid,classification)' +
                    ' values(@bomno,@model,@itemname,@materialname,@swidth,@mwidth,@savedate,@status,@cost,@dpid,@classification)'
                )
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish


    // **** start  품목등록    
    sql.connect(config).then(pool => {
        app.post('/api/outputmaterialinput', function (req, res) {

            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()
                //.input('변수',값 형식, 값)
                .input('date', sql.NVarChar, req.body.date)
                .input('input', sql.NVarChar, req.body.input)
                .input('materialname', sql.NVarChar, req.body.materialname)
                .input('lotno', sql.NVarChar, req.body.lotno)
                .input('manufacturedate', sql.NVarChar, req.body.manufacturedate)
                .input('expirationdate', sql.NVarChar, req.body.expirationdate)
                .input('materialwidth', sql.Int, req.body.materialwidth)
                .input('quantity', sql.Int, req.body.quantity)
                .input('roll', sql.Int, req.body.roll)
                .input('sum', sql.Int, req.body.sum)
                .input('contents', sql.NVarChar, req.body.contents)
                .input('part', sql.NVarChar, req.body.part)


                .query(
                    'insert into materialinput(date,input,materialname,lotno,manufacturedate,expirationdate,materialwidth,quantity,roll,sum,contents,part)' +
                    ' values(@date,@input,@materialname,@lotno,@manufacturedate,@expirationdate,@materialwidth,@quantity,@roll,@sum,@contents,@part)'
                )
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish
    // **** start  품목등록    
    sql.connect(config).then(pool => {
        app.post('/api/materialsoyooutput', function (req, res) {


            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()
                //.input('변수',값 형식, 값)
                .input('date', sql.NVarChar, req.body.date)
                .input('input', sql.NVarChar, req.body.input)
                .input('materialname', sql.NVarChar, req.body.materialname)
                .input('lotno', sql.NVarChar, req.body.lotno)
                .input('manufacturedate', sql.NVarChar, req.body.manufacturedate)
                .input('expirationdate', sql.NVarChar, req.body.expirationdate)
                .input('materialwidth', sql.Int, req.body.materialwidth)
                .input('quantity', sql.Int, req.body.quantity)
                .input('part', sql.NVarChar, req.body.part)
                .input('codenumber', sql.NVarChar, req.body.codenumber)
                .input('classification', sql.NVarChar, req.body.classification)
                // .input('sqmprice', sql.Float, req.body.sqmprice)
                .input('house', sql.NVarChar, req.body.house)
                .input('materialid', sql.NVarChar, req.body.materialid)
                .input('orderid', sql.NVarChar, req.body.orderid)
                .input('roll', sql.Int, req.body.roll)
                .input('customer', sql.NVarChar, req.body.customer)
                .input('productlot', sql.NVarChar, req.body.productlot)


                .query(
                    'insert into materialinput(date,input,materialname,lotno,manufacturedate,expirationdate,materialwidth,quantity,part,codenumber,classification,house,materialid,orderid,roll,customer,productlot)' +
                    ' values(@date,@input,@materialname,@lotno,@manufacturedate,@expirationdate,@materialwidth,@quantity,@part,@codenumber,@classification,@house,@materialid,@orderid,@roll,@customer,@productlot)'
                )
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish


    // **** start  관리항목등록    
    sql.connect(config).then(pool => {
        app.post('/api/managementtopicsinsertdata', function (req, res) {

            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()
                //.input('변수',값 형식, 값)
                .input('managementcode', sql.NVarChar, req.body.managementcode)
                .input('managementname', sql.NVarChar, req.body.managementname)


                .query(
                    'insert into managementtopics(managementcode,managementname)' +
                    ' values(@managementcode,@managementname)'
                )
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish
    // **** start  부서수정쿼리
    sql.connect(config).then(pool => {
        app.post('/api/departmentupdatedata', function (req, res) {

            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()
                //.input('변수',값 형식, 값)
                .input('id', sql.Int, req.body.id)
                .input('departmentcode', sql.NVarChar, req.body.departmentcode)
                .input('departmentname', sql.NVarChar, req.body.departmentname)


                .query(
                    'update Department set departmentcode=@departmentcode,departmentname=@departmentname where id=@id'
                )
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish

    // **** start  부서수정쿼리
    sql.connect(config).then(pool => {
        app.post('/api/falsebom', function (req, res) {

            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()
                //.input('변수',값 형식, 값)

                .input('bomno', sql.NVarChar, req.body.bomno)
                .input('status', sql.NVarChar, req.body.status)


                .query(
                    'update bommanagement set status=@status where bomno=@bomno'
                )
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish


    // **** start  부서수정쿼리
    sql.connect(config).then(pool => {
        app.post('/api/materialbaseupdatedata', function (req, res) {

            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()
                //.input('변수',값 형식, 값)
                .input('id', sql.Int, req.body.id)
                .input('materialname', sql.NVarChar, req.body.materialname)
                .input('codenumber', sql.NVarChar, req.body.codenumber)
                .input('classification', sql.NVarChar, req.body.classification)
                .input('fullwidth', sql.Int, req.body.fullwidth)
                .input('swidth', sql.Int, req.body.swidth)
                .input('customer', sql.NVarChar, req.body.customer)
                .input('sqmprice', sql.Float, req.body.sqmprice)
                .input('rollprice', sql.Float, req.body.rollprice)
                .input('day', sql.Int, req.body.day)


                .query(
                    'update materialbase set materialname=@materialname,codenumber=@codenumber,classification=@classification,fullwidth=@fullwidth,swidth=@swidth,customer=@customer,sqmprice=@sqmprice,rollprice=@rollprice,day=@day where id=@id'
                )
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish

    // **** start  창고수정쿼리
    sql.connect(config).then(pool => {
        app.post('/api/houseupdatedata', function (req, res) {

            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()
                //.input('변수',값 형식, 값)
                .input('id', sql.Int, req.body.id)
                .input('housecode', sql.NVarChar, req.body.housecode)
                .input('housename', sql.NVarChar, req.body.housename)
                .input('part', sql.NVarChar, req.body.part)
                .input('partname', sql.NVarChar, req.body.partname)


                .query(
                    'update house set housecode=@housecode,housename=@housename,part=@part,partname=@partname where id=@id'
                )
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish
    // **** start  품목수정쿼리
    sql.connect(config).then(pool => {
        app.post('/api/iteminfoupdatedata', function (req, res) {

            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()
                //.input('변수',값 형식, 값)
                .input('id', sql.Int, req.body.id)
                .input('itemcode', sql.NVarChar, req.body.itemcode)
                .input('bomno', sql.NVarChar, req.body.bomno)
                .input('modelname', sql.NVarChar, req.body.modelname)
                .input('itemname', sql.NVarChar, req.body.itemname)
                // .input('size', sql.NVarChar, req.body.size)
                .input('itemprice', sql.Float, req.body.itemprice)


                .query(
                    'update iteminfo set itemcode=@itemcode,bomno=@bomno,modelname=@modelname,itemname=@itemname,itemprice=@itemprice where id=@id'
                )
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** start  품목수정쿼리
    sql.connect(config).then(pool => {
        app.post('/api/priceupdate', function (req, res) {

            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()
                //.input('변수',값 형식, 값)
                .input('id', sql.Int, req.body.id)

                .input('itemprice', sql.Float, req.body.itemprice)


                .query(
                    'update iteminfo set itemprice=@itemprice where id=@id'
                )
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish
    // **** start  관리항목수정쿼리
    sql.connect(config).then(pool => {
        app.post('/api/managementtopicsupdatedata', function (req, res) {

            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()
                //.input('변수',값 형식, 값)
                .input('id', sql.Int, req.body.id)
                .input('managementcode', sql.NVarChar, req.body.managementcode)
                .input('managementname', sql.NVarChar, req.body.managementname)


                .query(
                    'update managementtopics set managementcode=@managementcode,managementname=@managementname where id=@id'
                )
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish
    // **** start  원자재정보수정쿼리
    sql.connect(config).then(pool => {
        app.post('/api/materialinfoupdatedata', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()
                //.input('변수',값 형식, 값)
                .input('id', sql.Int, req.body.id)
                .input('codenumber', sql.NVarChar, req.body.codenumber)
                .input('itemname', sql.NVarChar, req.body.itemname)
                .input('classfication', sql.NVarChar, req.body.classfication)
                .input('materialwidth', sql.Int, req.body.materialwidth)
                .input('fullwidth', sql.NVarChar, req.body.fullwidth)
                .input('length', sql.NVarChar, req.body.length)
                .input('koreancustomer', sql.NVarChar, req.body.koreancustomer)
                .input('sqmprice', sql.NVarChar, req.body.sqmprice)
                .input('rollprice', sql.NVarChar, req.body.rollprice)
                .input('widthclassfication', sql.NVarChar, req.body.widthclassfication)
                .input('day', sql.NVarChar, req.body.day)

                .query(
                    'update materialinfo set codenumber=@codenumber,itemname=@itemname,classfication=@classfication,materialwidth=@materialwidth,fullwidth=@fullwidth,length=@length,koreancustomer=@koreancustomer,' +
                    'sqmprice=@sqmprice,rollprice=@rollprice,widthclassfication=@widthclassfication,day=@day where id=@id'
                )
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish

    // **** start  원자재정보삭제쿼리     
    sql.connect(config).then(pool => {
        app.post('/api/materialinfodeletedata', function (req, res) {

            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()
                //.input('변수',값 형식, 값)
                .input('id', sql.Int, req.body.id)


                .query(
                    'delete from materialinfo where id=@id'
                )
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** start  부서삭제쿼리     
    sql.connect(config).then(pool => {
        app.post('/api/departmentdeletedata', function (req, res) {

            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()
                //.input('변수',값 형식, 값)
                .input('id', sql.Int, req.body.id)


                .query(
                    'delete from department where id=@id'
                )
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish
    // **** start  창고삭제쿼리     
    sql.connect(config).then(pool => {
        app.post('/api/housedeletedata', function (req, res) {

            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()
                //.input('변수',값 형식, 값)
                .input('id', sql.Int, req.body.id)


                .query(
                    'delete from house where id=@id'
                )
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish
    // **** start  품목삭제쿼리     
    sql.connect(config).then(pool => {
        app.post('/api/iteminfodeletedata', function (req, res) {

            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()
                //.input('변수',값 형식, 값)
                .input('id', sql.Int, req.body.id)


                .query(
                    'delete from iteminfo where id=@id'
                )
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish
    // **** start  관리항목삭제쿼리     
    sql.connect(config).then(pool => {
        app.post('/api/managementtopicsdeletedata', function (req, res) {

            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()
                //.input('변수',값 형식, 값)
                .input('id', sql.Int, req.body.id)


                .query(
                    'delete from managementtopics where id=@id'
                )
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish

    // **** start  사원정보등록쿼리    
    sql.connect(config).then(pool => {
        app.post('/api/employeeinsertdata', function (req, res) {

            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()
                //.input('변수',값 형식, 값)


                .input('name', sql.NVarChar, req.body.name)
                .input('nameid', sql.NVarChar, req.body.nameid)
                .input('password', sql.NVarChar, req.body.password)
                .input('part', sql.NVarChar, req.body.part)
                .input('birth', sql.NVarChar, req.body.birth)
                .input('gender', sql.NVarChar, req.body.gender)
                .input('email', sql.NVarChar, req.body.email)
                .input('phone', sql.NVarChar, req.body.phone)


                .query(
                    'insert into member(name,nameid,password,part,birth,gender,email,phone)' +
                    ' values(@name,@nameid,@password,@part,@birth,@gender,@email,@phone)'
                )
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish
    // **** start  사원정보등록쿼리    
    sql.connect(config).then(pool => {
        app.post('/api/pricechange', function (req, res) {

            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()
                //.input('변수',값 형식, 값)


                .input('bomno', sql.NVarChar, req.body.bomno)
                .input('modelname', sql.NVarChar, req.body.modelname)
                .input('itemname', sql.NVarChar, req.body.itemname)
                .input('customer', sql.NVarChar, req.body.customer)
                .input('savedate', sql.NVarChar, req.body.savedate)
                .input('price', sql.Float, req.body.price)

                .query(
                    'insert into pricechange(bomno,modelname,itemname,customer,savedate,price)' +
                    ' values(@bomno,@modelname,@itemname,@customer,@savedate,@price)'
                )
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish

    // **** start  사원정보등록쿼리    
    sql.connect(config).then(pool => {
        app.post('/api/selectpricechange', function (req, res) {

            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()


                .query(
                    "SELECT " +
                    "    [id], " +
                    "    [bomno], " +
                    "    [modelname], " +
                    "    [itemname], " +
                    "    [customer], " +
                    "    [savedate], " +
                    "        [price], " +
                    "    CASE " +
                    "        WHEN ROW_NUMBER() OVER (ORDER BY [savedate]) = 1 THEN NULL " +
                    "        ELSE LAG([price]) OVER (ORDER BY [savedate]) " +
                    "    END AS previousprice, " +
                    "    CASE " +
                    " WHEN ROW_NUMBER() OVER (ORDER BY [savedate]) = 1 THEN NULL " +
                    " ELSE [price] - LAG([price]) OVER (ORDER BY [savedate]) " +
                    " END AS pricedifference," +
                    "  CASE " +
                    " WHEN ROW_NUMBER() OVER (ORDER BY [savedate]) = 1 THEN NULL " +
                    " ELSE ROUND((([price] - LAG([price]) OVER (ORDER BY [savedate])) / LAG([price]) OVER (ORDER BY [savedate])) * 100, 2) " +
                    "  END AS pricechangepercentage " +
                    "FROM " +
                    "    ( " +
                    "    SELECT " +
                    "        [id], " +
                    "        [bomno], " +
                    "        [modelname], " +
                    "        [itemname], " +
                    "        [customer], " +
                    "        [savedate], " +
                    "        [price], " +
                    "        ROW_NUMBER() OVER (ORDER BY [savedate]) AS row_num " +
                    "    FROM [Techon].[dbo].[pricechange] " +
                    "    ) AS subquery " +
                    "ORDER BY [savedate] "
                )
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish


    // **** start  사원정보수정쿼리
    sql.connect(config).then(pool => {
        app.post('/api/employeeupdatedata', function (req, res) {

            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()
                //.input('변수',값 형식, 값)
                .input('id', sql.Int, req.body.id)
                .input('name', sql.NVarChar, req.body.name)
                .input('nameid', sql.NVarChar, req.body.nameid)
                .input('password', sql.NVarChar, req.body.password)
                .input('part', sql.NVarChar, req.body.part)
                .input('birth', sql.NVarChar, req.body.birth)
                .input('gender', sql.NVarChar, req.body.gender)
                .input('email', sql.NVarChar, req.body.email)
                .input('phone', sql.NVarChar, req.body.phone)
                .input('salary', sql.Int, req.body.phone)


                .query(
                    'update member set name=@name,nameid=@nameid,password=@password,part=@part,birth=@birth,gender=@gender,email=@email,salary=@salary' +
                    'phone=@phone where id=@id'
                )
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish
    // **** start  사원정보수정쿼리
    sql.connect(config).then(pool => {
        app.post('/api/materialoutputsave', function (req, res) {

            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()
                .input('orderid', sql.NVarChar, req.body.orderid)
                .input('materialstatus', sql.NVarChar, req.body.materialstatus)
                .input('lotno', sql.NVarChar, req.body.lotno)


                .query(
                    "update orderlist set materialstatus=@materialstatus where lotno=@lotno and orderid=@orderid"
                )
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish
    // **** start  사원정보삭제쿼리     
    sql.connect(config).then(pool => {
        app.post('/api/employeedeletedata', function (req, res) {

            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()
                //.input('변수',값 형식, 값)
                .input('id', sql.Int, req.body.id)


                .query(
                    'delete from member where id=@id'
                )
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish
    // **** start material combobox group 쿼리      
    sql.connect(config).then(pool => {
        app.post('/api/materialgroup', function (req, res) {

            res.header("Access-Control-Allow-Origin", "*");

            return pool.request()

                .query(
                    " Select" +
                    "  itemname" +
                    "  from materialinfo" +
                    "  WHERE itemname not in ('Null','')" +
                    "  group by itemname " +
                    " order by itemname asc "
                )
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** start material combobox group 쿼리      
    sql.connect(config).then(pool => {
        app.post('/api/mold', function (req, res) {

            res.header("Access-Control-Allow-Origin", "*");

            return pool.request()

                .query(
                    "select * from 금형"
                )
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish
    // **** start material combobox group 쿼리      
    sql.connect(config).then(pool => {
        app.post('/api/productcontent', function (req, res) {

            res.header("Access-Control-Allow-Origin", "*");

            return pool.request()
                .input('contents', sql.NVarChar, req.body.contents)

                .query(
                    " select materialname,materialwidth,lotno,quantity from materialinput where contents=@contents "
                )
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish

    // **** start material combobox group 쿼리      
    sql.connect(config).then(pool => {
        app.post('/api/POaccountinput', function (req, res) {

            res.header("Access-Control-Allow-Origin", "*");

            return pool.request()
                .input('start', sql.NVarChar, req.body.start)
                .input('finish', sql.NVarChar, req.body.finish)

                .query(
                    " select " +
                    " contentname, " +
                    " bomno, " +
                    " modelname, " +
                    " itemname, " +
                    " customer, " +
                    " quantity, " +
                    " itemprice, " +
                    " price, " +
                    " deliverydate " +
                    " from " +
                    " accountinput " +
                    " order by accountdate asc"
                )
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish
    // **** start material combobox group 쿼리      
    sql.connect(config).then(pool => {
        app.post('/api/pcent', function (req, res) {

            res.header("Access-Control-Allow-Origin", "*");

            return pool.request()
                .input('start', sql.NVarChar, req.body.start)
                .input('finish', sql.NVarChar, req.body.finish)
                .input('marchine', sql.NVarChar, req.body.marchine)

                .query(
                    " select * from pcent where date between '2023-05-01' and '2023-05-31' order by date asc "
                )
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish
    sql.connect(config).then(pool => {
        app.post('/api/POaccountinput1', function (req, res) {

            res.header("Access-Control-Allow-Origin", "*");

            return pool.request()

                .input('contentname', sql.NVarChar, req.body.contentname)

                .query(
                    " select id from orderlist where contentname=@contentname"
                )
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish

    // **** finish
    sql.connect(config).then(pool => {
        app.post('/api/POmaterialinput1', function (req, res) {

            res.header("Access-Control-Allow-Origin", "*");

            return pool.request()

                .input('orderid', sql.NVarChar, req.body.orderid)

                .query(
                    "SELECT id FROM orderlist WHERE orderid = @orderid AND materialstatus = 'true1'"
                )
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish
    // **** start material combobox group 쿼리      
    sql.connect(config).then(pool => {
        app.post('/api/POaccountinputponum', function (req, res) {

            res.header("Access-Control-Allow-Origin", "*");

            return pool.request()
                .input('ponum', sql.NVarChar, req.body.ponum)


                .query(
                    "   select " +
                    "   itemcode, " +
                    "   bomno, " +
                    "   modelname, " +
                    "   itemname, " +
                    "   customer, " +
                    "   itemcost, " +
                    "   itemprice, " +
                    "   quantity, " +
                    "   price  " +
                    "   from " +
                    "   accountinput " +
                    "   where " +
                    "   ponum = @ponum"
                )
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish


    // **** start material combobox group 쿼리      
    sql.connect(config).then(pool => {
        app.post('/api/accountnamegroup', function (req, res) {

            res.header("Access-Control-Allow-Origin", "*");

            return pool.request()

                .query(
                    'select accountname from accountmanagement group by accountname order by accountname asc'
                )
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish
    // **** start material combobox group 쿼리      
    sql.connect(config).then(pool => {
        app.post('/api/modelgroup', function (req, res) {

            res.header("Access-Control-Allow-Origin", "*");

            return pool.request()

                .query(
                    'select modelname from iteminfo group by modelname order by modelname asc'
                )
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish

    // **** start material combobox group 쿼리      
    sql.connect(config).then(pool => {
        app.post('/api/housegroup', function (req, res) {

            res.header("Access-Control-Allow-Origin", "*");

            return pool.request()

                .query(
                    'select housename from house group by housename'
                )
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish

    // **** start material combobox group 쿼리      
    sql.connect(config).then(pool => {
        app.post('/api/modelnamegroup', function (req, res) {

            res.header("Access-Control-Allow-Origin", "*");

            return pool.request()

                .query(
                    'select modelname from iteminfo group by modelname'
                )
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish

    // **** start material combobox group 쿼리      
    sql.connect(config).then(pool => {
        app.post('/api/modelnameitemname', function (req, res) {

            res.header("Access-Control-Allow-Origin", "*");

            return pool.request()
                .input('modelname', sql.NVarChar, req.body.modelname)

                .query(
                    'select itemname from iteminfo where modelname=@modelname'
                )
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish

    // **** start material combobox group 쿼리      

    // **** finish


    // **** start itemname변수로 materialwidth combobox group 쿼리      
    sql.connect(config).then(pool => {
        app.post('/api/itemnamematerialwidthgroup', function (req, res) {

            res.header("Access-Control-Allow-Origin", "*");

            return pool.request()
                .input('itemname', sql.NVarChar, req.body.itemname)


                .query(
                    " Select" +
                    "  materialwidth" +
                    "  from materialinfo" +
                    "  WHERE itemname=@itemname" +
                    "  group by materialwidth " +
                    " order by materialwidth asc "
                )
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish

    // **** start material combobox search 쿼리      
    sql.connect(config).then(pool => {
        app.post('/api/itemnamesearch', function (req, res) {

            res.header("Access-Control-Allow-Origin", "*");

            return pool.request()
                .input('itemname', sql.NVarChar, req.body.itemname)
                .query(
                    'select TOP (10)' +
                    'id,' +
                    'codenumber,' +
                    'itemname,' +
                    'classfication,' +
                    'materialwidth,' +
                    'fullwidth,' +
                    'length,' +
                    'koreancustomer,' +
                    'sqmprice,' +
                    'rollprice,' +
                    'widthclassfication,' +
                    'chk,' +
                    'day' +
                    ' from materialinfo' +
                    ' Where itemname=@itemname'
                )
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish

    // **** start itemname,materialwidth변수로  tablerow(0) 쿼리      
    sql.connect(config).then(pool => {
        app.post('/api/materialwidthtablerow', function (req, res) {

            res.header("Access-Control-Allow-Origin", "*");

            return pool.request()
                .input('itemname', sql.NVarChar, req.body.itemname)
                .input('materialwidth', sql.Int, req.body.materialwidth)

                .query(
                    " Select" +
                    "  codenumber," +
                    "  classfication," +
                    "  fullwidth," +
                    "  length," +
                    "  koreancustomer," +
                    "  sqmprice," +
                    "  rollprice," +
                    "  widthclassfication," +
                    "  day" +
                    "  from materialinfo" +
                    "  WHERE itemname=@itemname and materialwidth=@materialwidth"
                )
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish

    // **** start material combobox search 쿼리      
    sql.connect(config).then(pool => {
        app.post('/api/itemnamematerialwidthsearch', function (req, res) {

            res.header("Access-Control-Allow-Origin", "*");

            return pool.request()
                .input('itemname', sql.NVarChar, req.body.itemname)
                .input('materialwidth', sql.Int, req.body.materialwidth)
                .query(
                    'select TOP (10)' +
                    'id,' +
                    'codenumber,' +
                    'itemname,' +
                    'classfication,' +
                    'materialwidth,' +
                    'fullwidth,' +
                    'length,' +
                    'koreancustomer,' +
                    'sqmprice,' +
                    'rollprice,' +
                    'widthclassfication,' +
                    'chk,' +
                    'day' +
                    ' from materialinfo' +
                    ' Where itemname=@itemname and materialwidth=@materialwidtrh '
                )
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish
    // **** start  원자재입고등록쿼리    
    sql.connect(config).then(pool => {
        app.post('/api/materialinputsave', function (req, res) {

            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()
                //.input('변수',값 형식, 값)


                .input('date', sql.NVarChar, req.body.date)
                .input('materialname', sql.NVarChar, req.body.materialname)
                .input('codenumber', sql.NVarChar, req.body.codenumber)
                .input('lotno', sql.NVarChar, req.body.lotno)
                .input('manufacturedate', sql.NVarChar, req.body.manufacturedate)
                .input('expirationdate', sql.NVarChar, req.body.expirationdate)
                .input('materialwidth', sql.Int, req.body.materialwidth)
                .input('quantity', sql.NVarChar, req.body.quantity)
                .input('roll', sql.NVarChar, req.body.roll)
                .input('sum', sql.NVarChar, req.body.sum)
                .input('price', sql.NVarChar, req.body.price)
                .input('input', sql.NVarChar, req.body.input)
                .input('customer', sql.NVarChar, req.body.customer)
                .input('part', sql.NVarChar, req.body.part)
                .input('house', sql.NVarChar, req.body.house)
                .input('classification', sql.NVarChar, req.body.classification)
                .input('sqmprice', sql.Float, req.body.sqmprice)


                .query(
                    'insert into materialinput(date,materialname,codenumber,lotno,manufacturedate,expirationdate,materialwidth,quantity,roll,sum,price,input,part,classification,sqmprice,house,customer)' +
                    ' values(@date,@materialname,@codenumber,@lotno,@manufacturedate,@expirationdate,@materialwidth,@quantity,@roll,@sum,@price,@input,@part,@classification,@sqmprice,@house,@customer)'
                )
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish
    // **** start  원자재입고등록쿼리    
    sql.connect(config).then(pool => {
        app.post('/api/slimdeletematerial', function (req, res) {

            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()
                //.input('변수',값 형식, 값)


                .input('slitingdate', sql.NVarChar, req.body.slitingdate)
                .input('part', sql.NVarChar, req.body.part)
                .input('materialname', sql.NVarChar, req.body.materialname)
                .input('classification', sql.NVarChar, req.body.classification)
                .input('materialwidth', sql.Float, req.body.materialwidth)
                .input('m', sql.Float, req.body.m)
                .input('roll', sql.Float, req.body.roll)
                .input('total', sql.Float, req.body.total)
                .input('aftermaterialwidth', sql.Float, req.body.aftermaterialwidth)
                .input('afterm', sql.Float, req.body.afterm)
                .input('afterroll', sql.Float, req.body.afterroll)
                .input('aftertotal', sql.Float, req.body.aftertotal)
                .input('trash', sql.NVarChar, req.body.trash)


                .query(
                    'insert into slitingplan(slitingdate,part,materialname,classification,materialwidth,m,roll,total,aftermaterialwidth,afterm,afterroll,aftertotal,trash)' +
                    ' values(@slitingdate,@part,@materialname,@classification,@materialwidth,@m,@roll,@total,@aftermaterialwidth,@afterm,@afterroll,@aftertotal,@trash)'
                )
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish

    // **** start  원자재입고등록쿼리    
    sql.connect(config).then(pool => {
        app.post('/api/shipmentinsert', function (req, res) {

            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()
                //.input('변수',값 형식, 값)


                .input('shipmentdate', sql.NVarChar, req.body.shipmentdate)
                .input('customer', sql.NVarChar, req.body.customer)
                .input('modelname', sql.NVarChar, req.body.modelname)
                .input('itemname', sql.NVarChar, req.body.itemname)
                .input('shipmentcount', sql.NVarChar, req.body.shipmentcount)


                .query(
                    'insert into shipment(shipmentdate,customer,modelname,itemname,shipmentcount)' +
                    ' values(@shipmentdate,@customer,@modelname,@itemname,@shipmentcount)'
                )
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish


    // **** start 수입검사등록쿼리    
    sql.connect(config).then(pool => {
        app.post('/api/inspection', function (req, res) {

            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()
                //.input('변수',값 형식, 값)


                .input('inputdate', sql.NVarChar, req.body.inputdate)
                .input('materialname', sql.NVarChar, req.body.materialname)
                .input('lotno', sql.NVarChar, req.body.lotno)
                .input('manufacturedate', sql.NVarChar, req.body.manufacturedate)
                .input('expirationdate', sql.NVarChar, req.body.expirationdate)
                .input('materialwidth', sql.Int, req.body.materialwidth)
                .input('quantity', sql.Float, req.body.quantity)
                // .input('final', sql.NVarChar, req.body.fianl)




                .query(
                    "insert into inspection(inputdate,materialname,lotno,manufacturedate,expirationdate,materialwidth,quantity,final)" +
                    " values(@inputdate,@materialname,@lotno,@manufacturedate,@expirationdate,@materialwidth,@quantity,'수입검사대기')"
                )
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish


    // **** start  파일등록쿼리    
    sql.connect(config).then(pool => {
        app.post('/api/inputfile', function (req, res) {

            res.header("Access-Control-Allow-Origin", "*");
            console.log("req", req)
            console.log("res", res)
            return pool.request()
                //.input('변수',값 형식, 값)




                .input('filenamed', sql.NVarChar, req.body.filenamed)
                // .input('fileone', sql.VarBinary(sql.MAX), req.body.fileone)




                .query(
                    'insert into ttt(filenamed,fileone) values(@filenamed,@fileone)'
                )
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish

    // **** start itemname,materialwidth변수로  chk확인 쿼리      
    sql.connect(config).then(pool => {
        app.post('/api/materialinputchk', function (req, res) {

            res.header("Access-Control-Allow-Origin", "*");

            return pool.request()
                .input('itemname', sql.NVarChar, req.body.itemname)
                .input('materialwidth', sql.Int, req.body.materialwidth)

                .query(
                    " Select" +
                    "  chk" +
                    "  from materialinfo" +
                    "  WHERE itemname=@itemname and materialwidth=@materialwidth and materialwidth not in ('Null','')"
                )
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish
    // **** start itemname,materialwidth변수로  chk확인 쿼리      
    sql.connect(config).then(pool => {
        app.post('/api/duplication', function (req, res) {

            res.header("Access-Control-Allow-Origin", "*");

            return pool.request()
                .input('lotno', sql.NVarChar, req.body.lotno)

                .query(
                    " Select" +
                    "  lotno" +
                    "  from materialinput" +
                    "  WHERE lotno=@lotno"
                )
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish
    // **** start itemname,materialwidth변수로  chk확인 쿼리      
    sql.connect(config).then(pool => {
        app.post('/api/selectslitingplan', function (req, res) {

            res.header("Access-Control-Allow-Origin", "*");

            return pool.request()
                .input('itemname', sql.NVarChar, req.body.itemname)
                .input('materialwidth', sql.Int, req.body.materialwidth)

                .query(
                    "select " +
                    " * " +
                    " from " +
                    " slitingplan "
                )
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** start itemname,materialwidth변수로  chk확인 쿼리      
    sql.connect(config).then(pool => {
        app.post('/api/selectlot', function (req, res) {

            res.header("Access-Control-Allow-Origin", "*");

            return pool.request()
                .input('itemname', sql.NVarChar, req.body.itemname)
                .input('materialwidth', sql.Int, req.body.materialwidth)

                .query(
                    "select " +
                    " * " +
                    " from " +
                    " slitingplan "
                )
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish
    // **** start itemname,materialwidth변수로  chk확인 쿼리      
    sql.connect(config).then(pool => {
        app.post('/api/slitingsiljok3', function (req, res) {

            res.header("Access-Control-Allow-Origin", "*");

            return pool.request()
                .input('id', sql.Int, req.body.id)
                .input('finalm', sql.Float, req.body.finalm)
                .input('finalmaterialwidth', sql.Float, req.body.finalmaterialwidth)
                .input('finalroll', sql.Float, req.body.finalroll)
                .input('finaltotal', sql.Float, req.body.finaltotal)
                .input('finaltrash', sql.NVarChar, req.body.finaltrash)


                .query(
                    "update slitingplan set  finalm=@finalm,finalmaterialwidth=@finalmaterialwidth,finalroll=@finalroll,finaltotal=@finaltotal,finaltrash=@finaltrash where id=@id"
                )
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish
    // **** start itemname,materialwidth변수로  chk확인 쿼리      
    sql.connect(config).then(pool => {
        app.post('/api/updateslitingplan', function (req, res) {

            res.header("Access-Control-Allow-Origin", "*");

            return pool.request()
                .input('id', sql.Int, req.body.id)
                .input('finalmaterialwidth', sql.Int, req.body.finalmaterialwidth)
                .input('fianlm', sql.Float, req.body.fianlm)
                .input('finalroll', sql.Float, req.body.finalroll)
                .input('finaltotal', sql.Float, req.body.finaltotal)
                .input('finaltrash', sql.NVarChar, req.body.finaltrash)


                .query(
                    " update slitingplan set finalmaterialwidth=@finalmaterialwidth,fianlm=@finalm,finalroll=@finalroll,finaltotal=@finaltotal,finaltrash=@finaltrash where id=@id  "
                )
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish
    // **** start itemname,materialwidth변수로  chk확인 쿼리      
    sql.connect(config).then(pool => {
        app.post('/api/shipmentplan', function (req, res) {

            res.header("Access-Control-Allow-Origin", "*");

            return pool.request()


                .query(
                    " select " +
                    " bomno, " +
                    " modelname, " +
                    " itemname, " +
                    " customer, " +
                    " quantity, " +
                    " price " +
                    " from " +
                    " accountinput"
                )
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish

    // **** start itemname,materialwidth변수로  chk확인 쿼리      
    sql.connect(config).then(pool => {
        app.post('/api/inspectionset', function (req, res) {

            res.header("Access-Control-Allow-Origin", "*");

            return pool.request()


                .query(
                    " Select" +
                    "  *" +
                    "  from inspection order by final asc"
                )
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish

    // **** start itemname,materialwidth변수로  chk확인 쿼리      
    sql.connect(config).then(pool => {
        app.post('/api/selectalltest', function (req, res) {

            res.header("Access-Control-Allow-Origin", "*");

            return pool.request()


                .query(
                    " Select" +
                    "  *" +
                    "  from allteststatus where status='검사대기'"
                )
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish

    // **** start itemname,materialwidth변수로  chk확인 쿼리      
    sql.connect(config).then(pool => {
        app.post('/api/selectalltesting', function (req, res) {

            res.header("Access-Control-Allow-Origin", "*");

            return pool.request()


                .query(
                    " Select" +
                    "  *" +
                    "  from allteststatus where status='검사중'"
                )
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish

    // **** start  품질검사 등록 쿼리    
    sql.connect(config).then(pool => {
        app.post('/api/quality', function (req, res) {

            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()
                //.input('변수',값 형식, 값)


                .input('date', sql.NVarChar, req.body.date)
                .input('materialname', sql.NVarChar, req.body.materialname)
                .input('status', sql.NVarChar, req.body.status)


                .query(
                    'insert into quality(date,materialname,status)' +
                    ' values(@date,@materialname,@status)'
                )
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish

    // **** start  품질검사 등록 쿼리    
    sql.connect(config).then(pool => {
        app.post('/api/inputalltest', function (req, res) {

            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()
                //.input('변수',값 형식, 값)


                .input('bomno', sql.NVarChar, req.body.bomno)
                .input('modelname', sql.NVarChar, req.body.modelname)
                .input('itemname', sql.NVarChar, req.body.itemname)
                .input('lotno', sql.NVarChar, req.body.lotno)
                .input('startdate', sql.NVarChar, req.body.startdate)
                .input('quantity', sql.NVarChar, req.body.quantity)


                .query(
                    "insert into allteststatus(bomno,modelname,itemname,lotno,startdate,quantity,status)" +
                    " values(@bomno,@modelname,@itemname,@lotno,@startdate,@quantity,'검사대기')"
                )
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish

    var express = require('express');


    /* GET users listing. */
    module.exports = app => {
        var router = express.Router();

        app.use('/order', router);

        router.get('/', function (req, res, next) {
            app.db.models.partner.findAll({}).then((result) => {
                res.render('order', { title: 'Order', partner_list: result });
            });

        });

        router.post('/house', (req, res, next) => {

            let param = {};

            if (req.body.partner_id !== '' && req.body.partner_id !== '-1') {
                param.partnerId = req.body.partner_id;
            }

            if (req.body.order_number !== '') {
                param.order_id = req.body.order_number;
            }

            if (req.body.order_from_date !== '') {
                param.order_date = {
                    [app.db.Sequelize.Op.gte]: req.body.order_from_date
                }
                //param.order_date = req.body.search.order_from_date;
            }

            if (req.body.order_to_date !== '') {
                param.order_date = {
                    [app.db.Sequelize.Op.lte]: req.body.order_to_date
                }
            }

            app.db.models.order.findAndCountAll({
                where: param,
                include: [
                    {
                        model: app.db.models.partner,
                        as: 'partner'
                    }
                ],
                offset: Number(req.body.start),
                limit: Number(req.body.length)
            }).then((result) => {

                obj = {
                    "draw": req.body.draw,
                    "recordsTotal": result.count,
                    "recordsFiltered": result.count,
                    "data": result.rows
                }

                res.send(obj);
            });
        });

        router.post('/search', (req, res, next) => {
            res.send('1');
        });

        router.post('/status', (req, res, next) => {
            const status_code = req.body.status_code;
            const order_id_list = req.body.order_id_list;
            console.log(order_id_list);
            console.log(typeof (Object.entries(order_id_list)));

            let ids = [];
            for (let id in order_id_list) {
                console.log(id);
                ids.push(id);
            }


            app.db.models.order.update(
                { status: status_code },
                {
                    where: {
                        id: {
                            [app.db.Sequelize.Op.in]: order_id_list
                        }
                    }
                    //where : {id : 1 }
                }).then(result => {
                    console.log(result);
                    res.send('OK');
                });
        });


    }
}


