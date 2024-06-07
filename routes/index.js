const multer = require('multer');
const xlsx = require('xlsx');
const fs = require('fs');
const cors = require('cors');
const express = require('express');
const app = express();


module.exports = function (app) {
    const sql = require('mssql');
    const config = {
        user: 'pswel1',
        password: '1234',
        server: '118.46.215.214',
        database: 'Techon',
        options: {
            encrypt: false,
            enableArithAbort: true
        }
    };
    const pool = new sql.ConnectionPool(config);
    const poolConnect = pool.connect();

    // Configure multer for file uploads
    const storage = multer.memoryStorage(); // Store files in memory
    const upload = multer({ storage: storage });

    // Route handler for inserting data into the 'house' table
    app.post('/api/houseinsertdata', upload.single('filedata'), function (req, res) {
        res.header("Access-Control-Allow-Origin", "*");

        const { housecode, housename, part, partname } = req.body;
        const filedata = req.file.buffer;

        poolConnect.then(() => {
            return pool.request()
                .input('housecode', sql.NVarChar, housecode)
                .input('housename', sql.NVarChar, housename)
                .input('part', sql.NVarChar, part)
                .input('partname', sql.NVarChar, partname)
                .input('filedata', sql.VarBinary, filedata)
                .query(
                    'INSERT INTO house (housecode, housename, part, partname, filedata)' +
                    ' VALUES (@housecode, @housename, @part, @partname, @filedata)'
                );
        }).then(result => {
            console.log('Server Response:', result); // Log the response
            res.json(result.recordset);
            res.end();
        })
            .catch(error => {
                console.error('Error inserting into database:', error);
                res.status(500).send('Internal Server Error');
            });
    });

    module.exports = app;
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

    // const upload = multer({ dest: 'uploads/' });

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


    app.post('/api/insertimage', upload.single('imageFile'), (req, res) => {
        const { filename } = req.body;
        const buffer = fs.readFileSync(req.file.path);

        sql.connect(config)
            .then(() => {
                const request = new sql.Request();
                request.input('filename', sql.NVarChar(sql.MAX), filename);
                request.input('filedata', sql.VarBinary(sql.MAX), buffer);
                request.query('INSERT INTO filesave (filename, filedata) VALUES (@filename, @filedata)', (err, result) => {
                    if (err) {
                        console.error('Error inserting image into the database:', err);
                        res.status(500).send('이미지 삽입 중 오류가 발생했습니다.');
                    } else {
                        console.log('Image inserted successfully!');
                        // Delete the uploaded image file
                        fs.unlink(req.file.path, (unlinkErr) => {
                            if (unlinkErr) console.log('Error deleting image file:', unlinkErr);
                            else console.log('Image file deleted successfully!');
                        });

                        res.send('이미지 업로드 및 삽입 완료');
                    }
                });
            })
            .catch((connectErr) => {
                console.error('Error connecting to the database:', connectErr);
                res.status(500).send('서버 오류');
            });
    });

    // const downloadPath = '/Users/cjh/Downloads/Techon/sshkey_1'; // 다운로드 받을 경로
    // **** start
    sql.connect(config).then(pool => {
        app.post('/api/insertimg', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");

            const img = req.files.img; // Assuming you are using Express and multer for file upload

            if (!img) {
                return res.status(400).send('No file uploaded.');
            }

            const imgBuffer = img.buffer; // Assuming your img object has a 'buffer' property

            return pool.request()
                .input('filename', sql.VarBinary, req.body.filename)
                .query(
                    'INSERT INTO filesave (filename) VALUES (@filename)'
                )
                .then(result => {
                    res.json(result.recordset);
                })
                .catch(error => {
                    console.error(error);
                    res.status(500).send('Internal Server Error');
                });
        });
    });

    // **** finish

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
        app.post('/api/houseinformation', function (req, res) {
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
        app.post('/api/selectshipmentinput', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()

                .query(
                    " SELECT " +
                    " *  " +
                    " FROM shipmentinput where revnum='1' order by month asc")

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
        app.post('/api/selectsampleorder', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()
                .input('start', sql.NVarChar, req.body.start)
                .input('finish', sql.NVarChar, req.body.finish)
                .query(
                    "select " +
                    "insertdate, " +
                    "orderdate, " +
                    "outdate, " +
                    "bomno, " +
                    "customer, " +
                    "modelname, " +
                    "itemname, " +
                    "materialname, " +
                    "rev, " +
                    "pcs, " +
                    "pcscount, " +
                    "ordercount, " +
                    "productcount, " +
                    "inspectioncount, " +
                    "part, " +
                    "status, " +
                    "outtime, " +
                    "specification, " +
                    "chung, " +
                    "itemprice, " +
                    "(itemprice*ordercount)'sumitemprice', " +
                    " purchaseprice, " +
                    " (purchaseprice*productcount)'purchprice', " +
                    "deadline, " +
                    "employee, " +
                    "etc " +
                    "from " +
                    "sampleorderinput where insertdate between @start and @finish")

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
        app.post('/api/searchpinacle', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()
                .input('bomno', sql.NVarChar, req.body.bomno)

                .query(
                    'SELECT ' +
                    '* ' +
                    'FROM iteminfo where bomno=@bomno')

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
        app.post('/api/selectbomnoonepid', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()
                .input('bomno', sql.NVarChar, req.body.bomno)

                .query(
                    " SELECT " +
                    " *  " +
                    " FROM bommanagement where bomno=@bomno and status='true' and main='메인자재' order by num asc ")

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
    // **** start       
    sql.connect(config).then(pool => {
        app.post('/api/selectcategorycode', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()

                .query(
                    'SELECT ' +
                    '* ' +
                    'FROM categorycode')

                .then(result => {



                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** finish
    // **** start       
    sql.connect(config).then(pool => {
        app.post('/api/selectcategorycode1', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()

                .query(
                    'SELECT ' +
                    '* ' +
                    'FROM categorycode1')

                .then(result => {



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
    // **** start  최종검사 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/stocksearching', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()

                .query(
                    " SELECT " +
                    "    joined.bomno, " +
                    "    joined.model, " +
                    "    joined.itemname, " +
                    "    joined.materialname, " +
                    "    joined.codenumber, " +
                    "    joined.materialwidth, " +
                    "    joined.typecategory, " +
                    "    COALESCE(materialinput.sum_quantity, 0) AS sumquantity, " +
                    "    joined.sqmprice * joined.materialwidth / 1000 * COALESCE(materialinput.sum_quantity, 0) AS calculated " +
                    " FROM " +
                    "    ( " +
                    "        SELECT " +
                    "            bm.bomno, " +
                    "            bm.model, " +
                    "            bm.itemname, " +
                    "            bm.materialname, " +
                    "            bm.codenumber, " +
                    "            bm.materialwidth, " +
                    "            mi.typecategory, " +
                    "            mi.sqmprice, " +
                    "			bm.num " +
                    "        FROM " +
                    "            bommanagement bm  " +
                    "        JOIN " +
                    "            materialinfoinformation mi ON bm.codenumber = mi.codenumber " +
                    "        WHERE " +
                    "            bm.status = 'true' " +
                    "        GROUP BY " +
                    "            bm.bomno, bm.model, bm.itemname, bm.materialname, bm.codenumber, bm.materialwidth, mi.typecategory, mi.sqmprice ,bm.num " +
                    "    ) AS joined " +
                    " LEFT JOIN " +
                    "    ( " +
                    "        SELECT " +
                    "            codenumber, " +
                    "            materialwidth, " +
                    "            SUM(quantity) AS sum_quantity " +
                    "        FROM " +
                    "            materialinput " +
                    "        GROUP BY " +
                    "            codenumber, materialwidth " +
                    "    ) AS materialinput ON joined.codenumber = materialinput.codenumber AND joined.materialwidth = materialinput.materialwidth " +
                    "	ORDER BY " +
                    "    joined.bomno,joined.num ASC;")

                .then(result => {
                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish
    // **** start  최종검사 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/materialstock', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()

                .query(
                    " SELECT " +
                    "     mi.*, " +
                    "     m.*, " +
                    "     mi.sqmprice * m.materialwidth / 1000 * COALESCE(m.sumquantity, 0) AS calculated " +
                    " FROM " +
                    "     materialinfoinformation mi " +
                    " JOIN " +
                    "     ( " +
                    "         SELECT " +
                    "             codenumber, " +
                    "             materialname, " +
                    "             lotno, " +
                    "             manufacturedate, " +
                    "             expirationdate, " +
                    "             materialwidth, " +
                    "             house, " +
                    "             SUM(quantity) AS sumquantity, " +
                    "             SUM(roll) AS sumroll " +
                    "         FROM " +
                    "             materialinput " +
                    "         GROUP BY " +
                    "             codenumber, materialname, lotno, manufacturedate, expirationdate, materialwidth,house " +
                    "     ) AS m ON mi.codenumber = m.codenumber;                ")

                .then(result => {
                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish
    // **** start  최종검사 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/productstock', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()

                .query(
                    "SELECT " +
                    "     bom.bomno, " +
                    "     bom.model, " +
                    "     bom.itemname, " +
                    "     MAX(item.modelname) AS modelname, " +
                    "     MAX(item.customer) AS customer, " +
                    "     MAX(item.itemcode) AS itemcode, " +
                    "     MAX(item.itemprice) AS itemprice, " +
                    "     max(ii.quantity) as quantity, " +
                    "     COALESCE(SUM(ii.quantity * item.itemprice), 0) AS total_amount " +
                    " FROM " +
                    "     bommanagement bom " +
                    " JOIN " +
                    "     iteminfo item ON bom.bomno = item.bomno AND bom.model = item.modelname AND bom.itemname = item.itemname " +
                    " LEFT JOIN " +
                    "     iteminput ii ON bom.bomno = ii.bomno  " +
                    " GROUP BY " +
                    "     bom.bomno, bom.model, bom.itemname;                          ")

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
        app.post('/api/selectbomnowhereorderno', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()
                .input('orderno', sql.NVarChar, req.body.orderno)
                .query(
                    " select " +
                    " * " +
                    " from " +
                    " produceplan " +
                    " where " +
                    " orderno=@orderno ")

                .then(result => {
                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish
    // **** start  거래처정보 조회 쿼리  
    sql.connect(config).then(pool => {
        app.post('/api/insertmaterialbase', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()


                .input('codenumber', sql.NVarChar, req.body.codenumber)
                .input('materialname', sql.NVarChar, req.body.materialname)
                .input('width', sql.NVarChar, req.body.width)
                .input('length', sql.NVarChar, req.body.length)
                .input('usewidth', sql.NVarChar, req.body.usewidth)
                .input('sqmprice', sql.NVarChar, req.body.sqmprice)
                .input('rollprice', sql.NVarChar, req.body.rollprice)
                .input('unit', sql.NVarChar, req.body.unit)
                .input('num', sql.NVarChar, req.body.num)
                .input('manufacterer', sql.NVarChar, req.body.manufacterer)
                .input('supplier', sql.NVarChar, req.body.supplier)
                .input('usagecategory', sql.NVarChar, req.body.usagecategory)
                .input('typecategory', sql.NVarChar, req.body.typecategory)
                .input('companycategory', sql.NVarChar, req.body.companycategory)
                .input('materialtype', sql.NVarChar, req.body.materialtype)
                .input('color', sql.NVarChar, req.body.color)
                .input('thickness', sql.NVarChar, req.body.thickness)
                .input('adhesionstrength', sql.NVarChar, req.body.adhesionstrength)
                .input('adhesive', sql.NVarChar, req.body.adhesive)
                .input('fabricweight', sql.NVarChar, req.body.fabricweight)
                .input('requester', sql.NVarChar, req.body.requester)
                .input('modificationdate', sql.NVarChar, req.body.modificationdate)
                .input('registrationreason', sql.NVarChar, req.body.registrationreason)
                .input('customer', sql.NVarChar, req.body.customer)
                .input('modelname', sql.NVarChar, req.body.modelname)
                .input('inspection', sql.NVarChar, req.body.inspection)
                .input('lifetime', sql.NVarChar, req.body.lifetime)
                .query(
                    " INSERT INTO materialinfoinformation (codenumber, materialname, width, length, usewidth, sqmprice, rollprice, unit, num, manufacterer, supplier, usagecategory, typecategory, companycategory, materialtype, color, thickness, adhesionstrength, adhesive, fabricweight, requester, modificationdate, registrationreason, customer, modelname, inspection, lifetime) " +
                    " VALUES (@codenumber, @materialname, @width, @length, @usewidth, @sqmprice, @rollprice, @unit, @num, @manufacterer, @supplier, @usagecategory, @typecategory, @companycategory, @materialtype, @color, @thickness, @adhesionstrength, @adhesive, @fabricweight, @requester, @modificationdate, @registrationreason, @customer, @modelname, @inspection, @lifetime)")

                .then(result => {
                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish
    // **** start  거래처정보 조회 쿼리  
    sql.connect(config).then(pool => {
        app.post('/api/inserthouse', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()


                .input('housecode', sql.NVarChar, req.body.housecode)
                .input('housename', sql.NVarChar, req.body.housename)
                .input('part', sql.NVarChar, req.body.part)
                .input('partname', sql.NVarChar, req.body.partname)

                .query(
                    " INSERT INTO house (housecode,housename,part,partname)" +
                    " VALUES (@housecode,@housename,@part,@partname)")
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
    // **** start 영업수주조회창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/selectbommateriallist', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()
                // .input('start', sql.NVarChar, req.body.orderdate)
                // .input('finish', sql.NVarChar, req.body.deliverydate)

                .query(
                    "select " +
                    " bomno, " +
                    " model, " +
                    " itemname, " +
                    " main, " +
                    " materialname, " +
                    " materialwidth, " +
                    " onepid, " +
                    " twopid, " +
                    " cavity, " +
                    " chk1, " +
                    " chk2, " +
                    " chk3 " +
                    " from " +
                    " bommanagement " +
                    " where status='true'                        ")

                .then(result => {


                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** finish
    // **** start 영업수주조회창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/selectbommateriallistwherebomno', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()
                .input('bomno', sql.NVarChar, req.body.bomno)

                .query(
                    "select " +
                    " bomno, " +
                    " model, " +
                    " itemname, " +
                    " main, " +
                    " materialname, " +
                    " materialwidth, " +
                    " onepid, " +
                    " twopid, " +
                    " cavity, " +
                    " chk1, " +
                    " chk2, " +
                    " chk3 " +
                    " from " +
                    " bommanagement " +
                    " where status='true'    and bomno=@bomno                    ")

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
                    "    SELECT  " +
                    "     i.bomno,  " +
                    "     i.part,  " +
                    "     i.modelname,  " +
                    "     i.itemname,  " +
                    "     i.itemprice,  " +
                    "      COALESCE(SUM(ROUND(mi.rollprice/FLOOR((mi.length * 1000 * (FLOOR(mi.usewidth / bm.materialwidth)) * bm.cavity * (1 - (bm.costloss / 100)) / ((bm.onepid + bm.talength + bm.twopid) / bm.allta))),2)), 2) as cost,   " +
                    "     CASE  " +
                    "         WHEN i.itemprice = 0 THEN 0  " +
                    "         ELSE ROUND((SUM(ROUND((mi.rollprice / (mi.length * 1000 * (FLOOR(mi.usewidth / bm.materialwidth)) * bm.cavity * (1 - (bm.costloss / 100)) / ((bm.onepid + bm.talength + bm.twopid) / bm.allta))), 2)) / i.itemprice) * 100, 2)  " +
                    "     END AS costPriceRatio,  " +
                    "     i.customer,  " +
                    "     i.itemcode,  " +
                    "     i.working,  " +
                    "     i.pcs,  " +
                    "     i.cavity,  " +
                    "     i.direction,  " +
                    "     i.workpart,  " +
                    "     i.additionalnotes,  " +
                    "     i.class,  " +
                    "     i.type, " +
                    "     bm.bomid, " +
                    "     COUNT(mi.materialname) as materialcount " +
                    " FROM  " +
                    "     iteminfo i  " +
                    " LEFT JOIN  " +
                    "     bommanagement bm ON i.bomno = bm.bomno  " +
                    " LEFT JOIN  " +
                    "     materialinfoinformation2 mi ON bm.codenumber = mi.codenumber  " +
                    " WHERE  " +
                    "    bm.status = 'true'  " +
                    " GROUP BY  " +
                    "     i.bomno,  " +
                    "     i.part,  " +
                    "     i.modelname,  " +
                    "     i.itemname,  " +
                    "     i.itemprice,  " +
                    "     i.customer,  " +
                    "     i.itemcode,  " +
                    "     i.working,  " +
                    "     i.pcs,  " +
                    "     i.cavity,  " +
                    "     i.direction,  " +
                    "     i.workpart,  " +
                    "     i.additionalnotes,  " +
                    "     i.class,  " +
                    "     i.type," +
                    "     bm.bomid," +
                    "     i.workpart;                      ")
                .then(result => {


                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** finish
    // **** start  BOM창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/iteminfobom1', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()

                .query(
                    "    SELECT  " +
                    "     i.bomno,  " +
                    "     i.part,  " +
                    "     i.modelname,  " +
                    "     i.itemname,  " +
                    "     i.itemprice,  " +
                    "      COALESCE(SUM(ROUND(mi.rollprice/FLOOR((mi.length * 1000 * (FLOOR(mi.usewidth / bm.materialwidth)) * bm.cavity * (1 - (bm.costloss / 100)) / ((bm.onepid + bm.talength + bm.twopid) / bm.allta))),2)), 2) as cost,   " +
                    "     CASE  " +
                    "         WHEN i.itemprice = 0 THEN 0  " +
                    "         ELSE ROUND((SUM(ROUND((mi.rollprice / (mi.length * 1000 * (FLOOR(mi.usewidth / bm.materialwidth)) * bm.cavity * (1 - (bm.costloss / 100)) / ((bm.onepid + bm.talength + bm.twopid) / bm.allta))), 2)) / i.itemprice) * 100, 2)  " +
                    "     END AS costPriceRatio,  " +
                    "     i.customer,  " +
                    "     i.itemcode,  " +
                    "     i.working,  " +
                    "     i.pcs,  " +
                    "     i.cavity,  " +
                    "     i.direction,  " +
                    "     i.workpart,  " +
                    "     i.additionalnotes,  " +
                    "     i.class,  " +
                    "     i.type, " +
                    "     bm.bomid, " +
                    "     COUNT(mi.materialname) as materialcount " +
                    " FROM  " +
                    "     vntiteminfo i  " +
                    " LEFT JOIN  " +
                    "     vntbommanagement bm ON i.bomno = bm.bomno  " +
                    " LEFT JOIN  " +
                    "     vetnammaterialinfo mi ON bm.codenumber = mi.codenumber  " +
                    " WHERE  " +
                    "    bm.status = 'true'  " +
                    " GROUP BY  " +
                    "     i.bomno,  " +
                    "     i.part,  " +
                    "     i.modelname,  " +
                    "     i.itemname,  " +
                    "     i.itemprice,  " +
                    "     i.customer,  " +
                    "     i.itemcode,  " +
                    "     i.working,  " +
                    "     i.pcs,  " +
                    "     i.cavity,  " +
                    "     i.direction,  " +
                    "     i.workpart,  " +
                    "     i.additionalnotes,  " +
                    "     i.class,  " +
                    "     i.type," +
                    "     bm.bomid," +
                    "     i.workpart;                      ")
                .then(result => {


                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** finish
    // **** start  BOM창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/iteminfobom11', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");

            return pool.request()
                .input('bomno', sql.NVarChar, '%' + req.body.input + '%')
                .input('part', sql.NVarChar, '%' + req.body.input + '%')
                .input('modelname', sql.NVarChar, '%' + req.body.input + '%')
                .input('itemname', sql.NVarChar, '%' + req.body.input + '%')
                .input('customer', sql.NVarChar, '%' + req.body.input + '%')
                .input('class', sql.NVarChar, '%' + req.body.input + '%')

                .query(
                    "SELECT  " +
                    "    i.bomno,  " +
                    "    i.part,  " +
                    "    i.modelname,  " +
                    "    i.itemname,  " +
                    "    i.itemprice,  " +
                    "    COALESCE(SUM(ROUND(mi.rollprice/FLOOR((mi.length * 1000 * (FLOOR(mi.usewidth / bm.materialwidth)) * bm.cavity * (1 - (bm.costloss / 100)) / ((bm.onepid + bm.talength + bm.twopid) / bm.allta))),2)), 2) as cost,   " +
                    "    CASE  " +
                    "        WHEN i.itemprice = 0 THEN 0  " +
                    "        ELSE ROUND((SUM(ROUND((mi.rollprice / (mi.length * 1000 * (FLOOR(mi.usewidth / bm.materialwidth)) * bm.cavity * (1 - (bm.costloss / 100)) / ((bm.onepid + bm.talength + bm.twopid) / bm.allta))), 2)) / i.itemprice) * 100, 2)  " +
                    "    END AS costPriceRatio,  " +
                    "    i.customer,  " +
                    "    i.itemcode,  " +
                    "    i.working,  " +
                    "    i.pcs,  " +
                    "    i.cavity,  " +
                    "    i.direction,  " +
                    "    i.workpart,  " +
                    "    i.additionalnotes,  " +
                    "    i.class,  " +
                    "    i.type, " +
                    "    bm.bomid, " +
                    "    COUNT(mi.materialname) as materialcount " +
                    "FROM  " +
                    "    iteminfo i  " +
                    "LEFT JOIN  " +
                    "    bommanagement bm ON i.bomno = bm.bomno " +
                    "LEFT JOIN  " +
                    "    materialinfoinformation mi ON bm.codenumber = mi.codenumber " +
                    "WHERE " +
                    " bm.status = 'true' and" +
                    "    (i.bomno like @bomno " +
                    "    or i.part like @part " +
                    "    or i.modelname like @modelname " +
                    "    or bm.itemname like @itemname " +
                    "    or i.customer like @customer " +
                    "    or i.class like @class) " +
                    "GROUP BY  " +
                    "    i.bomno,  " +
                    "    i.part,  " +
                    "    i.modelname,  " +
                    "    i.itemname,  " +
                    "    i.itemprice,  " +
                    "    i.customer,  " +
                    "    i.itemcode,  " +
                    "    i.working,  " +
                    "    i.pcs,  " +
                    "    i.cavity,  " +
                    "    i.direction,  " +
                    "    i.workpart,  " +
                    "    i.additionalnotes,  " +
                    "    i.class,  " +
                    "    i.type, " +
                    "    bm.bomid, " +
                    "    i.workpart;"
                )
                .then(result => {
                    res.json(result.recordset);
                    res.end();
                })
                .catch(err => {
                    console.error('SQL error', err);
                    res.status(500).send('Server error');
                });
        });
    });

    // **** finish

    // **** finish
    // **** start  BOM창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/iteminfobomsample', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()

                .query(
                    "    SELECT  " +
                    "     i.bomno,  " +
                    "     i.part,  " +
                    "     i.modelname,  " +
                    "     i.itemname,  " +
                    "     i.itemprice,  " +
                    "     COALESCE(SUM(ROUND((mi.rollprice / (mi.length * 1000 * (FLOOR(mi.usewidth / bm.materialwidth)) * bm.cavity * (1 + (bm.loss / 100)) / ((bm.onepid + bm.talength + bm.twopid) / bm.allta)) ), 2)), 5) as cost,    " +
                    "     CASE  " +
                    "         WHEN i.itemprice = 0 THEN 0  " +
                    "         ELSE ROUND((SUM(ROUND((mi.rollprice / (mi.length * 1000 * (FLOOR(mi.usewidth / bm.materialwidth)) * bm.cavity * (1 + (bm.loss / 100)) / ((bm.onepid + bm.talength + bm.twopid) / bm.allta))), 2)) / i.itemprice) * 100, 2)  " +
                    "     END AS costPriceRatio,  " +
                    "     i.customer,  " +
                    "     i.itemcode,  " +
                    "     i.working,  " +
                    "     i.pcs,  " +
                    "     i.cavity,  " +
                    "     i.direction,  " +
                    "     i.workpart,  " +
                    "     i.additionalnotes,  " +
                    "     i.class,  " +
                    "     i.type, " +
                    "     bm.bomid, " +
                    "     COUNT(mi.materialname) as materialcount " +
                    " FROM  " +
                    "     iteminfo i  " +
                    " LEFT JOIN  " +
                    "     bommanagementsample bm ON i.bomno = bm.bomno  " +
                    " LEFT JOIN  " +
                    "     materialinfoinformation mi ON bm.codenumber = mi.codenumber  " +
                    " WHERE  " +
                    "   i.part='샘플' and  bm.status = 'true'  " +
                    " GROUP BY  " +
                    "     i.bomno,  " +
                    "     i.part,  " +
                    "     i.modelname,  " +
                    "     i.itemname,  " +
                    "     i.itemprice,  " +
                    "     i.customer,  " +
                    "     i.itemcode,  " +
                    "     i.working,  " +
                    "     i.pcs,  " +
                    "     i.cavity,  " +
                    "     i.direction,  " +
                    "     i.workpart,  " +
                    "     i.additionalnotes,  " +
                    "     i.class,  " +
                    "     i.type," +
                    "     bm.bomid," +
                    "     i.workpart;                      ")
                .then(result => {


                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** finish
    // **** start  BOM창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/bomfinalsheet', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()

                .query(
                    "SELECT " +
                    "     madecustomer, " +

                    "     SUM(CASE WHEN part2 = '양산' THEN (ordercount * orderprice) * 1.1 ELSE 0 END) AS 'final1', " +
                    "     SUM(CASE WHEN part2 = '샘플' THEN (ordercount * orderprice) * 1.1 ELSE 0 END) AS 'final2' " +

                    " FROM " +
                    "     bomtoolorder " +
                    " GROUP BY " +
                    "     madecustomer")


                .then(result => {


                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** finish
    // **** start  BOM창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/bomfinalsheet2', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()

                .query(
                    "SELECT " +
                    "     madecustomer, " +

                    "     SUM(CASE WHEN sheet2 = '청구' THEN (ordercount * orderprice) * 1.1 ELSE 0 END) AS 'final1', " +
                    "     SUM(CASE WHEN sheet2 = '미청구' THEN (ordercount * orderprice) * 1.1 ELSE 0 END) AS 'final2' " +

                    " FROM " +
                    "     bomtoolorder " +
                    " GROUP BY " +
                    "     madecustomer")


                .then(result => {


                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** finish
    // **** start  BOM창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/bomtoolorder', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()
                .input('start', sql.NVarChar, req.body.start)
                .input('finish', sql.NVarChar, req.body.finish)
                .query(
                    " SELECT " +
                    " id, " +
                    " orderdate, " +
                    " inputdate, " +
                    " madecustomer, " +
                    " toolcode, " +
                    " bomno, " +
                    " customer, " +
                    " itemname, " +
                    " char, " +
                    " part, " +
                    " ordercount, " +
                    " orderprice, " +
                    " (ordercount*orderprice)'a1', " +
                    " (ordercount*orderprice)*0.1'a2', " +
                    " (ordercount*orderprice)*1.1'a3', " +
                    " part2," +
                    " sheet2,  " +
                    " ordercause, " +
                    " deadline, " +
                    " employee " +
                    " from " +
                    " bomtoolorder where inputdate between @start and @finish")


                .then(result => {


                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** finish
    // **** start  BOM창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/iteminfobomselect', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()
                .input('bomno', sql.NVarChar, req.body.bomno)
                .input('savedate', sql.NVarChar, req.body.savedate)
                .query(
                    "SELECT TOP (1000) [id] " +
                    "      ,[savedate]" +
                    "      ,[bomno]" +
                    "      ,[model]" +
                    "      ,[itemname]" +
                    "      ,[status]" +
                    "      ,[num]" +
                    "      ,[char]" +
                    "      ,[main]" +
                    "      ,[materialname]" +
                    "      ,[codenumber]" +
                    "      ,[materialwidth]" +
                    "      ,[cavity]" +
                    "      ,[etc]" +
                    "      ,[using]" +
                    "      ,[onepid]" +
                    "      ,[twopid]" +
                    "      ,[ta]" +
                    "      ,[allta]" +
                    "      ,[talength]" +
                    "      ,[loss]" +
                    "      ,[useable]" +
                    "      ,[dpid]" +
                    "      ,[productcode]" +
                    "      ,[swidth]" +
                    "      ,[mwidth]" +
                    "      ,[classification]" +
                    "      ,[customernumber]" +
                    "      ,[cost]" +
                    "      ,[rlcut]" +
                    "      ,[rlproduct]" +
                    "      ,[width]" +
                    "      ,[usewidth]" +
                    "      ,[length]" +
                    "      ,[sqmprice]" +
                    "      ,[rollprice]" +
                    "      ,[unit]" +
                    "      ,[manufacterer]" +
                    "      ,[supplier]" +
                    "      ,[additionalnotes]" +
                    "      ,[materialclassification]" +
                    "      ,[soyo]" +
                    "      ,[bomid]" +
                    "      ,[costloss]" +
                    "      ,[hapji]" +
                    "  FROM [Techon].[dbo].[bommanagement]" +
                    "  where bomno='HHE-3-002' and savedate=@savedate")


                .then(result => {


                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** finish
    // **** start  BOM창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/revisonselect', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()
                .input('bomno', sql.NVarChar, req.body.bomno)
                .query(
                    "select " +
                    " savedate " +
                    " from " +
                    " bommanagement " +
                    " where  " +
                    " bomno='HHE-3-002' " +
                    " GROUP BY SAVEDATE order by savedate desc")


                .then(result => {


                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** finish
    // **** start  BOM창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/deficiency', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()
                .input('start', sql.NVarChar, req.body.start)
                .input('finish', sql.NVarChar, req.body.finish)
                .query(
                    "SELECT " +
                    " modelname," +
                    " itemname," +
                    " sum(quantity) as sumquantity" +
                    " FROM" +

                    " SHIPMENTPLAN" +
                    " where" +
                    " shipmentdate between @start and @finish  " +
                    " group by" +
                    " modelname," +
                    " itemname "
                )


                .then(result => {


                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** finish
    // **** start  BOM창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/deficiencyshipmentplan', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()
                .input('bomno', sql.NVarChar, req.body.bomno)
                .query(
                    "select * from shipmentplan "
                )


                .then(result => {


                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** finish
    // **** start  BOM창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/deficiencyproduct', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()
                .input('part', sql.NVarChar, req.body.part)
                .query(
                    "select * from iteminput where part=@part "
                )


                .then(result => {


                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** finish
    // **** start  BOM창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/selectpinacle', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()
                .input('bomno', sql.NVarChar, req.body.bomno)
                .query(
                    "SELECT " +
                    "     id," +
                    "     partcustomer," +
                    "     toolcode," +
                    "     bomno," +
                    "     customer," +
                    "     modelname," +
                    "     itemname," +
                    "     char," +
                    "     part," +
                    "         ABS(CHECKSUM(NEWID())) % (129000 - 50000 + 1) + 50000 AS ta                    " +
                    " FROM " +
                    "     sampleorder" +
                    " where part ='피나클'")


                .then(result => {


                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** finish
    // **** start  BOM창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/selectmold', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()
                .input('bomno', sql.NVarChar, req.body.bomno)
                .query(
                    "SELECT " +
                    "     id," +
                    "     partcustomer," +
                    "     toolcode," +
                    "     bomno," +
                    "     customer," +
                    "     modelname," +
                    "     itemname," +
                    "     char," +
                    "     part," +
                    "         ABS(CHECKSUM(NEWID())) % (129000 - 50000 + 1) + 50000 AS ta                    " +
                    " FROM " +
                    "     sampleorder" +
                    " where part ='금형'")


                .then(result => {


                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** finish
    // **** start  BOM창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/selecttree', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()
                .input('bomno', sql.NVarChar, req.body.bomno)
                .query(
                    "SELECT " +
                    "     id," +
                    "     partcustomer," +
                    "     toolcode," +
                    "     bomno," +
                    "     customer," +
                    "     modelname," +
                    "     itemname," +
                    "     char," +
                    "     part," +
                    "         ABS(CHECKSUM(NEWID())) % (129000 - 50000 + 1) + 50000 AS ta                    " +
                    " FROM " +
                    "     sampleorder" +
                    " where part ='목형'")


                .then(result => {


                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** finish
    // **** start  BOM창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/bomsheet2', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()

                .query(
                    "SELECT " +
                    "     a.customer, " +
                    "     COALESCE(a.B, '0') AS B, " +
                    "     COALESCE(a.D, '0') AS D, " +
                    "     COALESCE(b.E, '0') AS E, " +
                    "     COALESCE((a.D + b.E - a.B), '0') AS F, " +
                    "     COALESCE(b.G, '0') AS G, " +
                    "     COALESCE(a.H, '0') AS H " +

                    " FROM " +
                    "     (SELECT  " +
                    "         customer, " +
                    "         SUM(CASE WHEN part2 = '양산' OR part2 = '샘플' THEN (ordercount * orderprice) * 1.1 ELSE 0 END) AS 'B', " +
                    "         SUM(CASE WHEN sheet2 = '청구' THEN (ordercount * orderprice) * 1.1 ELSE 0 END) AS 'D', " +
                    "         SUM(CASE WHEN deadline = '이월' THEN (ordercount * orderprice) * 1.1 ELSE 0 END) AS 'H' " +
                    "     FROM " +
                    "         bomtoolorder " +
                    "     GROUP BY " +
                    "         customer) a " +
                    " LEFT JOIN " +
                    "     (SELECT  " +
                    "         customer, " +
                    "         SUM(CASE WHEN chung = '청구' THEN (ordercount * itemprice) * 1.1 ELSE 0 END) AS 'E', " +
                    "         SUM(CASE WHEN deadline = '이월' THEN (productcount * itemprice) * 1.1 ELSE 0 END) AS 'G' " +
                    "     FROM " +
                    "         sampleorderinput " +
                    "     GROUP BY " +
                    "         customer) b " +
                    " ON a.customer = b.customer " +
                    " ORDER BY " +
                    "     a.B DESC")


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
        app.post('/api/mr1equipment', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()

                .query(
                    "SELECT " +
                    "    e.codenumber, " +
                    "    e.equipmentname, " +
                    "    e.eqname,  " +
                    "    e.num, " +
                    "    e.customer, " +
                    "    e.serialno, " +
                    "    e.manudate, " +
                    "    e.position, " +
                    "    COALESCE(COUNT(mr1.codenumber), 0) AS mr1count, " +
                    "    DATEDIFF(DAY, e.manudate, GETDATE()) AS days  " +
                    "FROM " +
                    "    equipment e " +
                    "LEFT JOIN " +
                    "    mr1 ON e.codenumber = mr1.codenumber " +
                    "GROUP BY " +
                    "    e.codenumber, e.equipmentname, e.eqname, e.num, e.customer, e.serialno, e.manudate, e.position;                ")

                .then(result => {


                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** finish
    // **** start  생산설비창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/selectinspection', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");



            return pool.request()
                .input('start', sql.NVarChar, req.body.start)
                .input('finish', sql.NVarChar, req.body.finish)
                .query(
                    "SELECT " +
                    "     MI.id, " +
                    "     MII.typecategory, " +
                    "     MI.inspectiondate, " +
                    "     MI.employee, " +
                    "     MI.materialname, " +
                    "     MI.lotno, " +
                    "     MII.supplier, " +
                    "     MII.manufacterer, " +
                    "     MI.roll, " +
                    "     MI.inspectionroll, " +
                    "     MI.exterior1, " +
                    "     MI.exterior2, " +
                    "     MI.exterior3, " +
                    "     MI.exterior4, " +
                    "     MI.data11, " +
                    "     MI.data12, " +
                    "     MI.data13, " +
                    "     MI.data14, " +
                    "     MI.data15, " +
                    "     MI.data1result, " +
                    "     MI.data21, " +
                    "     MI.data22, " +
                    "     MI.data23, " +
                    "     MI.data24, " +
                    "     MI.data25, " +
                    "     CASE " +
                    "         WHEN MI.data21 IS NULL OR MI.data21 = '' THEN 'N/A' " +
                    "         ELSE MI.data2result " +
                    "     END AS data2result, " +
                    "     MI.data31, " +
                    "     MI.data32, " +
                    "     MI.data33, " +
                    "     MI.data34, " +
                    "     MI.data35, " +
                    "    CASE " +
                    "         WHEN MI.data31 IS NULL OR MI.data31 = '' THEN 'N/A' " +
                    "         ELSE MI.data3result " +
                    "     END AS data3result, " +
                    "     MI.data41, " +
                    "     MI.data42, " +
                    "     MI.data43, " +
                    "     MI.data44, " +
                    "     MI.data45, " +
                    "     CASE " +
                    "         WHEN MI.data41 IS NULL OR MI.data41 = '' THEN 'N/A' " +
                    "         ELSE MI.data4result " +
                    "     END AS data4result " +
                    " FROM " +
                    "     MATERIALINSPECTION MI " +
                    " INNER JOIN " +
                    "     materialinfoinformation MII ON MI.MATERIALNAME = MII.MATERIALNAME " +
                    "    where inspectiondate between @start and @finish " +
                    " ORDER BY  " +
                    "     MI.inspectiondate desc;                                         ")

                .then(result => {


                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** finish
    // **** start  생산설비창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/selectcodenumber', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");



            return pool.request()
                .input('materialname', sql.NVarChar, req.body.materialname)
                .input('width', sql.Float, req.body.width)
                .input('length', sql.Float, req.body.length)
                .query(
                    " select " +
                    "  * " +
                    "  from " +
                    "  materialinfoinformation " +
                    "  where " +
                    " materialname=@materialname  and length=@length")

                .then(result => {


                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** finish
    // **** start  생산설비창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/selectcodenumber1', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");



            return pool.request()
                .input('materialname', sql.NVarChar, req.body.materialname)
                .input('width', sql.Float, req.body.width)
                .input('length', sql.Float, req.body.length)
                .query(
                    " select " +
                    "  * " +
                    "  from " +
                    "  materialinfoinformation " +
                    "  where " +
                    " materialname=@materialname  and length=@length and width=@width")

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
    // **** start  생산설비창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/selectcustomerinformation', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()

                .query(
                    "SELECT " +
                    "*" +
                    " FROM customerinformation ")

                .then(result => {


                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** finish
    // **** start  생산설비창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/selectcustomerinformationwhere', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()
                .input('customerinitial', sql.NVarChar, req.body.customerinitial)

                .query(
                    "SELECT " +
                    "customername" +
                    " FROM customerinformation where customerinitial=@customerinitial")

                .then(result => {


                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** finish
    // **** start  생산설비창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/selectmaterialinformation1', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()
                .input('customerinitial', sql.NVarChar, req.body.customerinitial)

                .query(
                    "SELECT " +
                    "     id,codenumber,materialname, " +
                    "     width,length,usewidth, " +
                    "     CASE  " +
                    "         WHEN unit = '￦' THEN CEILING(rollprice / width / length * 1000)  " +
                    "         WHEN unit = '$' THEN FORMAT(rollprice / width / length * 1000, 'N4') " +
                    "         WHEN unit = '￥' THEN CEILING(rollprice / width / length * 1000)  " +
                    "     END AS sqmprice, " +
                    "     rollprice, " +
                    "     unit,num,manufacterer,supplier,usagecategory,typecategory,companycategory,materialtype,color,thickness,adhesionstrength,adhesive,fabricweight,requester,modificationdate,registrationreason,customer,modelname " +
                    " FROM " +
                    "     materialinfoinformation")

                .then(result => {


                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** finish
    // **** start  생산설비창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/selectmaterialinformation2', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()
                .input('customerinitial', sql.NVarChar, req.body.customerinitial)

                .query(

                    "SELECT   " +
                    "     id, " +
                    "     codenumber,  " +
                    "     materialname,   " +
                    "     width,  " +
                    "     length,  " +
                    "     usewidth,   " +
                    "     CASE    " +
                    "         WHEN unit = '￦' THEN CEILING(rollprice / width / length * 1000)    " +
                    "         WHEN unit = '$' THEN FORMAT(rollprice / width / length * 1000, 'N4')   " +
                    "         WHEN unit = '￥' THEN CEILING(rollprice / width / length * 1000)   " +
                    "     END AS sqmprice,  " +
                    "     rollprice,  " +
                    "     unit, " +
                    "     num, " +
                    "     manufacterer, " +
                    "     supplier, " +
                    "     usagecategory, " +
                    "     typecategory, " +
                    "     companycategory, " +
                    "     materialtype, " +
                    "     color, " +
                    "     thickness, " +
                    "     adhesionstrength, " +
                    "     adhesive, " +
                    "     fabricweight, " +
                    "     requester, " +
                    "     modificationdate, " +
                    "     registrationreason, " +
                    "     customer, " +
                    "     modelname, " +
                    "     adhesionstrength1, " +
                    "     adhesionstrength2, " +
                    "     thickness11, " +
                    "     thickness12, " +
                    "     thickness13,  " +
                    "     adhesionstrength11, " +
                    "     adhesionstrength12, " +
                    "     adhesionstrength13, " +
                    "     adhesionstrength21, " +
                    "     adhesionstrength22, " +
                    "     adhesionstrength23, " +
                    "     adhesionstrength31, " +
                    "     adhesionstrength32, " +
                    "     adhesionstrength33, " +
                    "     resistance11, " +
                    "     resistance12, " +
                    "     resistance21, " +
                    "     resistance22 " +
                    " FROM  " +
                    "     materialinfoinformation " +
                    " WHERE " +
                    "     inspection = 'y'                 ")

                .then(result => {


                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** finish
    // **** start  생산설비창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/updatematerialinfo', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()
                .input('materialname', sql.NVarChar, req.body.materialname)
                .input('width', sql.Float, req.body.width)
                .input('length', sql.Float, req.body.length)
                .input('usewidth', sql.Float, req.body.usewidth)
                .input('rollprice', sql.Float, req.body.rollprice)
                .input('unit', sql.NVarChar, req.body.unit)
                .input('num', sql.Float, req.body.num)
                .input('manufacterer', sql.NVarChar, req.body.manufacterer)
                .input('supplier', sql.NVarChar, req.body.supplier)
                .input('usagecategory', sql.NVarChar, req.body.usagecategory)
                .input('typecategory', sql.NVarChar, req.body.typecategory)
                .input('companycategory', sql.NVarChar, req.body.companycategory)
                .input('materialtype', sql.NVarChar, req.body.materialtype)
                .input('color', sql.NVarChar, req.body.color)
                .input('thickness', sql.NVarChar, req.body.thickness)
                .input('adhesionstrength', sql.NVarChar, req.body.adhesionstrength)
                .input('adhesive', sql.NVarChar, req.body.adhesive)
                .input('fabricweight', sql.NVarChar, req.body.fabricweight)
                .input('requester', sql.NVarChar, req.body.requester)
                .input('modificationdate', sql.NVarChar, req.body.modificationdate)
                .input('registrationreason', sql.NVarChar, req.body.registrationreason)
                .input('customer', sql.NVarChar, req.body.customer)
                .input('modelname', sql.NVarChar, req.body.modelname)
                .input('id', sql.Int, req.body.id)

                .query(
                    " update " +
                    " materialinfoinformation " +
                    " set  " +
                    " materialname=@materialname, " +
                    " width=@width, " +
                    " length=@length, " +
                    " usewidth=@usewidth, " +
                    " rollprice=@rollprice, " +
                    " unit=@unit, " +
                    " num=@num, " +
                    " manufacterer=@manufacterer, " +
                    " supplier=@supplier, " +
                    " usagecategory=@usagecategory, " +
                    " typecategory=@typecategory, " +
                    " companycategory=@companycategory, " +
                    " materialtype=@materialtype, " +
                    " color=@color, " +
                    " thickness=@thickness, " +
                    " adhesionstrength=@adhesionstrength, " +
                    " adhesive=@adhesive, " +
                    " fabricweight=@fabricweight, " +
                    " requester=@requester, " +
                    " modificationdate=@modificationdate, " +
                    " registrationreason=@registrationreason, " +
                    " customer=@customer, " +
                    " modelname=@modelname where id=@id")

                .then(result => {


                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** finish
    // **** start  생산설비창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/updatematerialinfo1', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()

                .input('color', sql.NVarChar, req.body.color)
                .input('thickness11', sql.NVarChar, req.body.thickness11)
                .input('thickness12', sql.NVarChar, req.body.thickness12)
                .input('thickness13', sql.NVarChar, req.body.thickness13)
                .input('adhesionstrength11', sql.NVarChar, req.body.adhesionstrength11)
                .input('adhesionstrength12', sql.NVarChar, req.body.adhesionstrength12)
                .input('adhesionstrength13', sql.NVarChar, req.body.adhesionstrength13)
                .input('adhesionstrength21', sql.NVarChar, req.body.adhesionstrength21)
                .input('adhesionstrength22', sql.NVarChar, req.body.adhesionstrength22)
                .input('adhesionstrength23', sql.NVarChar, req.body.adhesionstrength23)
                .input('adhesionstrength31', sql.NVarChar, req.body.adhesionstrength31)
                .input('adhesionstrength32', sql.NVarChar, req.body.adhesionstrength32)
                .input('adhesionstrength33', sql.NVarChar, req.body.adhesionstrength33)
                .input('resistance11', sql.NVarChar, req.body.resistance11)
                .input('resistance21', sql.NVarChar, req.body.resistance21)

                .input('id', sql.Int, req.body.id)

                .query(
                    " UPDATE materialinfoinformation  " +
                    " SET  " +
                    "     color = @color, " +
                    "     thickness11 = @thickness11, " +
                    "     thickness12 = @thickness12, " +
                    "     thickness13 = @thickness13, " +
                    "     adhesionstrength11 = @adhesionstrength11, " +
                    "     adhesionstrength12 = @adhesionstrength12, " +
                    "     adhesionstrength13 = @adhesionstrength13, " +
                    "     adhesionstrength21 = @adhesionstrength21, " +
                    "     adhesionstrength22 = @adhesionstrength22, " +
                    "     adhesionstrength23 = @adhesionstrength23, " +
                    "     adhesionstrength31 = @adhesionstrength31, " +
                    "     adhesionstrength32 = @adhesionstrength32, " +
                    "     adhesionstrength33 = @adhesionstrength33, " +
                    "     resistance11 = @resistance11, " +
                    "     resistance21 = @resistance21 " +
                    " WHERE " +
                    "     id = @id")
                .then(result => {


                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** finish
    // **** start  생산설비창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/insertintomaterialinspection', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()

                .input('inspectiondate', sql.NVarChar, req.body.inspectiondate)
                .input('inputdate', sql.NVarChar, req.body.inputdate)
                .input('employee', sql.NVarChar, req.body.employee)
                .input('materialname', sql.NVarChar, req.body.materialname)
                .input('materilaltype', sql.NVarChar, req.body.materilaltype)
                .input('lotno', sql.NVarChar, req.body.lotno)
                .input('color', sql.NVarChar, req.body.color)
                .input('roll', sql.NVarChar, req.body.roll)
                .input('exterior1', sql.NVarChar, req.body.exterior1)
                .input('exterior2', sql.NVarChar, req.body.exterior2)
                .input('exterior3', sql.NVarChar, req.body.exterior3)
                .input('exterior4', sql.NVarChar, req.body.exterior4)
                .input('data11', sql.NVarChar, req.body.data11)
                .input('data12', sql.NVarChar, req.body.data12)
                .input('data13', sql.NVarChar, req.body.data13)
                .input('data14', sql.NVarChar, req.body.data14)
                .input('data15', sql.NVarChar, req.body.data15)
                .input('data1result', sql.NVarChar, req.body.data1result)
                .input('data21', sql.NVarChar, req.body.data21)
                .input('data22', sql.NVarChar, req.body.data22)
                .input('data23', sql.NVarChar, req.body.data23)
                .input('data24', sql.NVarChar, req.body.data24)
                .input('data25', sql.NVarChar, req.body.data25)
                .input('data2result', sql.NVarChar, req.body.data2result)
                .input('data31', sql.NVarChar, req.body.data31)
                .input('data32', sql.NVarChar, req.body.data32)
                .input('data33', sql.NVarChar, req.body.data33)
                .input('data34', sql.NVarChar, req.body.data34)
                .input('data35', sql.NVarChar, req.body.data35)
                .input('data3result', sql.NVarChar, req.body.data3result)
                .input('data41', sql.NVarChar, req.body.data41)
                .input('data42', sql.NVarChar, req.body.data42)
                .input('data43', sql.NVarChar, req.body.data43)
                .input('data44', sql.NVarChar, req.body.data44)
                .input('data45', sql.NVarChar, req.body.data45)
                .input('data4result', sql.NVarChar, req.body.data4result)
                .input('etc', sql.NVarChar, req.body.etc)
                .input('inspectionroll', sql.NVarChar, req.body.inspectionroll)




                .query(
                    "INSERT INTO materialinspection ( " +

                    " inspectiondate, " +
                    " employee, " +
                    " materialname, " +
                    " materilaltype, " +
                    " lotno, " +
                    " color, " +
                    " roll, " +
                    " exterior1,  " +
                    " exterior2, " +
                    " exterior3, " +
                    " exterior4, " +
                    " data11, " +
                    " data12, " +
                    " data13, " +
                    " data14, " +
                    " data15, " +
                    " data1result, " +
                    " data21, " +
                    " data22, " +
                    " data23, " +
                    " data24, " +
                    " data25, " +
                    " data2result, " +
                    " data31, " +
                    " data32, " +
                    " data33, " +
                    " data34, " +
                    " data35, " +
                    " data3result, " +
                    " data41, " +
                    " data42, " +
                    " data43, " +
                    " data44, " +
                    " data45, " +
                    " data4result, " +
                    " inspectionroll, " +
                    " inputdate, " +
                    " etc ) " +
                    " VALUES ( " +
                    " @inspectiondate, " +
                    " @employee, " +
                    " @materialname, " +
                    " @materilaltype, " +
                    " @lotno, " +
                    " @color, " +
                    " @roll, " +
                    " @exterior1, " +
                    " @exterior2, " +
                    " @exterior3, " +
                    " @exterior4, " +
                    " @data11, " +
                    " @data12, " +
                    " @data13, " +
                    " @data14, " +
                    " @data15, " +
                    " @data1result, " +
                    " @data21, " +
                    " @data22, " +
                    " @data23, " +
                    " @data24, " +
                    " @data25, " +
                    " @data2result, " +
                    " @data31, " +
                    " @data32, " +
                    " @data33, " +
                    " @data34, " +
                    " @data35, " +
                    " @data3result, " +
                    " @data41, " +
                    " @data42, " +
                    " @data43, " +
                    " @data44, " +
                    " @data45, " +
                    " @data4result, " +
                    " @inspectionroll, " +
                    " @inputdate, " +
                    " @etc)")
                .then(result => {


                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** finish
    // **** start  생산설비창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/selectwaitinspection', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()



                .query(
                    "     SELECT   " +
                    "     MI.date,   " +
                    "     MI.materialname,   " +
                    "     MI.lotno,   " +
                    "     MI.manufacturedate,   " +
                    "     MI.expirationdate,   " +
                    "     MI.materialwidth,   " +
                    "     SUM(MI.roll) AS roll,   " +
                    "     MII.inspection," +
                    "     MII.adhesionstrength," +
                    "     MII.adhesionstrength1," +
                    "     MII.thickness," +
                    "     MII.supplier," +
                    "     MII.manufacterer," +
                    "     MII.materialtype," +
                    "     MII.color," +
                    "     MII.thickness11," +
                    "     MII.thickness12," +
                    "     MII.thickness13," +
                    "     MII.adhesionstrength11," +
                    "     MII.adhesionstrength12," +
                    "     MII.adhesionstrength13," +
                    "     MII.adhesionstrength21," +
                    "     MII.adhesionstrength22," +
                    "     MII.adhesionstrength23," +
                    "     MII.adhesionstrength31," +
                    "     MII.adhesionstrength32," +
                    "     MII.adhesionstrength33 " +
                    " FROM    " +
                    "     materialinput MI    " +
                    " JOIN    " +
                    "     materialinfoinformation MII ON MI.materialname = MII.materialname    " +
                    "     	WHERE INSPECTION='Y' and MI.input ='수입검사대기'  " +
                    " GROUP BY   " +
                    "     MI.materialname,    " +
                    "     MII.inspection,   " +
                    "     MI.lotno,   " +
                    "     MI.manufacturedate,   " +
                    "     MI.expirationdate,   " +
                    "     MI.date,   " +
                    "     MI.materialwidth,   " +
                    "     MII.adhesionstrength,   " +
                    "     MII.adhesionstrength1, " +
                    "     MII.thickness, " +
                    "     MII.supplier, " +
                    "     MII.manufacterer," +
                    "     MII.materialtype, " +
                    "     MII.color, " +
                    "     MII.thickness11, " +
                    "     MII.thickness12, " +
                    "     MII.thickness13, " +
                    "     MII.adhesionstrength11, " +
                    "     MII.adhesionstrength12, " +
                    "     MII.adhesionstrength13, " +
                    "     MII.adhesionstrength21, " +
                    "     MII.adhesionstrength22, " +
                    "     MII.adhesionstrength23, " +
                    "     MII.adhesionstrength31, " +
                    "     MII.adhesionstrength32, " +
                    "     MII.adhesionstrength33")

                .then(result => {


                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** finish
    // **** start  생산설비창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/insertmaterialinfo', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()
                .input('materialname', sql.NVarChar, req.body.materialname)
                .input('width', sql.Float, req.body.width)
                .input('length', sql.Float, req.body.length)
                .input('usewidth', sql.Float, req.body.usewidth)
                .input('rollprice', sql.Float, req.body.rollprice)
                .input('unit', sql.NVarChar, req.body.unit)
                .input('num', sql.Float, req.body.num)
                .input('manufacterer', sql.NVarChar, req.body.manufacterer)
                .input('supplier', sql.NVarChar, req.body.supplier)
                .input('usagecategory', sql.NVarChar, req.body.usagecategory)
                .input('typecategory', sql.NVarChar, req.body.typecategory)
                .input('companycategory', sql.NVarChar, req.body.companycategory)
                .input('materialtype', sql.NVarChar, req.body.materialtype)
                .input('color', sql.NVarChar, req.body.color)
                .input('thickness', sql.NVarChar, req.body.thickness)
                .input('adhesionstrength', sql.NVarChar, req.body.adhesionstrength)
                .input('adhesive', sql.NVarChar, req.body.adhesive)
                .input('fabricweight', sql.NVarChar, req.body.fabricweight)
                .input('requester', sql.NVarChar, req.body.requester)
                .input('modificationdate', sql.NVarChar, req.body.modificationdate)
                .input('registrationreason', sql.NVarChar, req.body.registrationreason)
                .input('customer', sql.NVarChar, req.body.customer)
                .input('modelname', sql.NVarChar, req.body.modelname)

                .query(
                    " INSERT INTO materialinfoinformation ( " +
                    "   materialname, " +
                    "   width, " +
                    "   length, " +
                    "   usewidth, " +
                    "   rollprice, " +
                    "   unit, " +
                    "   num, " +
                    "   manufacterer, " +
                    "   supplier, " +
                    "   usagecategory, " +
                    "   typecategory, " +
                    "   companycategory, " +
                    "   materialtype, " +
                    "   color, " +
                    "   thickness, " +
                    "   adhesionstrength, " +
                    "   adhesive, " +
                    "   fabricweight, " +
                    "   requester, " +
                    "   modificationdate, " +
                    "   registrationreason, " +
                    "   customer, " +
                    "   modelname " +
                    ") VALUES ( " +
                    "   @materialname, " +
                    "   @width, " +
                    "   @length, " +
                    "   @usewidth, " +
                    "   @rollprice, " +
                    "   @unit, " +
                    "   @num, " +
                    "   @manufacterer, " +
                    "   @supplier, " +
                    "   @usagecategory, " +
                    "   @typecategory, " +
                    "   @companycategory, " +
                    "   @materialtype, " +
                    "   @color, " +
                    "   @thickness," +
                    "   @adhesionstrength," +
                    "   @adhesive, " +
                    "   @fabricweight, " +
                    "   @requester, " +
                    "   @modificationdate, " +
                    "   @registrationreason, " +
                    "   @customer, " +
                    "   @modelname) ")

                .then(result => {


                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** finish
    // **** start  생산설비창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/selectmaterialinformation', function (req, res) {
            res.setHeader('Access-Control-Allow-Origin', '*');
            const { page, per_page } = req.body;

            // 전체 레코드 수 가져오기
            pool.request().query(`
                SELECT COUNT(*) AS totalRows FROM materialinfoinformation
            `).then(countResult => {
                const totalRows = countResult.recordset[0].totalRows;

                // 페이지네이션을 위한 쿼리 실행
                pool.request().query(`
                    SELECT * FROM materialinfoinformation 
                    ORDER BY typecategory, materialname ASC 
                    OFFSET ${(page - 1) * per_page} ROWS
                    FETCH NEXT ${per_page} ROWS ONLY
                `).then(result => {
                    res.json({
                        data: result.recordset,
                        total_pages: Math.ceil(totalRows / per_page)
                    });
                }).catch(err => {
                    console.error(err);
                    res.status(500).json({ error: 'Internal Server Error' });
                });
            }).catch(err => {
                console.error(err);
                res.status(500).json({ error: 'Internal Server Error' });
            });
        });

    });


    // **** start  생산설비창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/selectpurchaseorder', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()
                .input('orderdate', sql.NVarChar, req.body.orderdate)
                .input('suppliername', sql.NVarChar, req.body.suppliername)

                .query(
                    "SELECT " +
                    "*" +
                    " FROM purchaseorder where orderdate=@orderdate and suppliername=@suppliername order by itemname,cutting asc ")

                .then(result => {


                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** finish
    // **** start  생산설비창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/selectpurchaseorder1', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()
                .input('orderdate', sql.NVarChar, req.body.orderdate)
                .input('suppliername', sql.NVarChar, req.body.suppliername)

                .query(
                    "SELECT " +
                    " po.*, " +

                    " mi.width as materialwidth " +
                    " FROM " +
                    " purchaseorder po " +
                    " JOIN materialinfoinformation mi  " +
                    " ON po.codenumber = mi.codenumber " +
                    "WHERE " +
                    "    po.orderdate = @orderdate AND po.suppliername =@suppliername;")

                .then(result => {


                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** finish
    // **** start  생산설비창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/selectpurchaseordering', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()


                .query(
                    "SELECT " +
                    "     po.orderno, " +
                    "     po.orderdate, " +
                    "     po.itemname, " +
                    "     po.codenumber, " +
                    "     mi.width, " +
                    "     po.length, " +
                    "     po.quantity, " +
                    "     po.unitprice, " +
                    "     po.supplyamount, " +
                    "     po.suppliername, " +
                    "     po.bomno, " +
                    "     '양산' AS part, " +
                    "     ii.customer, " +
                    "     po.confirmed, " +
                    "     po.cutting  " +
                    " FROM " +
                    "     purchaseorder po " +
                    " JOIN  " +
                    "     materialinfoinformation mi ON po.codenumber = mi.codenumber " +
                    " JOIN " +
                    "     iteminfo ii ON po.bomno = ii.bomno                ")

                .then(result => {


                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** finish
    // **** start  생산설비창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/selectpurchaseordering1', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()
                .input('orderno', sql.NVarChar, req.body.orderno)


                .query(
                    "SELECT " +
                    "     po.orderno," +
                    "     po.orderdate, " +
                    "     po.itemname, " +
                    "     po.quantity - ISNULL(SUM(mi.roll), 0) AS remaining, " +
                    "     po.codenumber, " +
                    "     po.length, " +
                    "     po.quantity, " +
                    "     mii.width " +
                    " FROM  " +
                    "     purchaseorder po " +
                    " LEFT JOIN  " +
                    "     materialinput mi ON po.itemname = mi.materialname AND po.orderno = mi.orderid " +
                    " JOIN " +
                    "     materialinfoinformation mii ON po.codenumber = mii.codenumber where orderno=@orderno" +
                    " GROUP BY  " +
                    "     po.orderno, po.orderdate, po.itemname, po.codenumber, po.length, po.quantity, mii.width " +
                    " HAVING  " +
                    "     po.quantity - ISNULL(SUM(mi.roll), 0) > 0;                            ")

                .then(result => {


                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** finish
    // **** start  생산설비창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/selectpurchaseordering2', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()
                .input('suppliername', sql.NVarChar, req.body.suppliername)


                .query(
                    "SELECT " +
                    "     po.orderno," +
                    "     po.orderdate, " +
                    "     po.itemname, " +
                    "     po.quantity - ISNULL(SUM(mi.roll), 0) AS remaining, " +
                    "     po.codenumber, " +
                    "     po.length, " +
                    "     po.quantity, " +
                    "     mii.width " +
                    " FROM  " +
                    "     purchaseorder po " +
                    " LEFT JOIN  " +
                    "     materialinput mi ON po.itemname = mi.materialname AND po.orderno = mi.orderid " +
                    " JOIN " +
                    "     materialinfoinformation mii ON po.codenumber = mii.codenumber where suppliername=@suppliername" +
                    " GROUP BY  " +
                    "     po.orderno, po.orderdate, po.itemname, po.codenumber, po.length, po.quantity, mii.width " +
                    " HAVING  " +
                    "     po.quantity - ISNULL(SUM(mi.roll), 0) > 0;           ")

                .then(result => {


                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** finish
    // **** start  생산설비창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/selectpaper', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()
                .input('orderno', sql.NVarChar, req.body.orderno)


                .query(
                    "SELECT  " +
                    "     ii.bomno, " +
                    "     ii.modelname, " +
                    "     ii.itemname, " +
                    "     ii.customer, " +
                    "     ii.cavity, " +
                    "     ii.pcs,  " +
                    "     ii.working, " +
                    "     ii.direction, " +
                    "     ii.itemcode, " +
                    "     pp.lotno, " +
                    "     pp.part, " +
                    "     pp.pono " +
                    "      " +
                    " FROM iteminfo ii " +
                    " JOIN  " +
                    "     produceplan pp ON ii.bomno = pp.bomno " +
                    " where orderno=@orderno " +

                    "  " +
                    "     group by " +
                    "         ii.bomno, " +
                    "     ii.modelname, " +
                    "     ii.itemname," +
                    "     ii.customer," +
                    "     ii.cavity," +
                    "     ii.pcs," +
                    "     ii.working," +
                    "     ii.direction," +
                    "     ii.itemcode," +
                    "     pp.lotno," +
                    "     pp.part," +
                    "     pp.pono")




                .then(result => {


                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** finish
    // **** start  생산설비창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/selectequip', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()
                .input('orderno', sql.NVarChar, req.body.orderno)


                .query(
                    "select * from produceplan where orderno=@orderno")




                .then(result => {


                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** finish
    // **** start  생산설비창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/selectimg', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()
                .input('orderno', sql.NVarChar, req.body.orderno)


                .query(
                    "select * from img where id='2'")




                .then(result => {


                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** finish
    // **** start  생산설비창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/selecttool', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()
                .input('bomno', sql.NVarChar, req.body.bomno)


                .query(
                    "SELECT " +
                    "   toolcode" +
                    " FROM " +
                    " bomtoolcode" +
                    " where " +
                    " bomno=@bomno and status='true' and part='금형' ")




                .then(result => {


                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** finish
    // **** start  생산설비창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/selectpaperoutputmaterial', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()
                .input('productlot', sql.NVarChar, req.body.productlot)
                .query(
                    "select " +
                    " materialname,lotno,materialwidth,quantity,sum(roll)'roll' " +
                    " from  " +
                    " materialinput " +
                    " where " +
                    " productlot=@productlot " +
                    " and " +
                    " input='원자재출고대기' " +
                    " group by materialname,lotno,materialwidth,quantity " +
                    " order by materialname asc ")
                .then(result => {
                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** finish
    // **** start  생산설비창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/selectsuppliername', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()
                .input('orderno', sql.NVarChar, req.body.orderno)


                .query(
                    "select " +
                    " suppliername " +
                    " from " +
                    " purchaseorder " +
                    " where  " +
                    " status='입고대기' " +
                    " group by suppliername        ")

                .then(result => {


                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** finish
    // **** start  생산설비창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/selectpurchaseordersupplier', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()
                .input('suppliername', sql.NVarChar, req.body.suppliername)
                .input('orderdate', sql.NVarChar, req.body.orderdate)

                .query(
                    "SELECT " +
                    "     purchaseorder.*, " +
                    "     materialinfoinformation.sqmprice ,materialinfoinformation.lifetime" +
                    " FROM " +
                    "     purchaseorder " +
                    " JOIN " +
                    "     materialinfoinformation ON purchaseorder.codenumber = materialinfoinformation.codenumber " +
                    " WHERE " +
                    "     purchaseorder.suppliername = @suppliername and purchaseorder.orderdate = @orderdate")

                .then(result => {


                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** finish
    // **** start  생산설비창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/updateinput', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()
                .input('materialname', sql.NVarChar, req.body.materialname)
                .input('lotno', sql.NVarChar, req.body.lotno)

                .query(
                    "UPDATE " +
                    " MATERIALINPUT " +
                    " SET " +
                    " INPUT='원자재입고' , house='원자재창고' " +
                    " WHERE  " +
                    " materialname=@materialname " +
                    " AND  " +
                    " lotno=@lotno "
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
        app.post('/api/selectmaterialinputinformation', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()

                .query(
                    "SELECT " +
                    "     date, " +
                    "     input, " +
                    "     materialname, " +
                    "     codenumber, " +
                    "     lotno, " +
                    "     manufacturedate, " +
                    "     expirationdate, " +
                    "     materialwidth, " +
                    "     SUM(quantity) AS total_quantity," +
                    "     SUM(roll) AS total_roll, " +
                    "     sqmprice, " +
                    "     SUM(rollprice) AS total_rollprice, " +
                    "     bomno, " +
                    "     customer, " +
                    "     SUM(roll * rollprice) AS total_price " +
                    " FROM " +
                    "     materialinput where input='원자재입고' or input='수입검사대기' " +
                    " GROUP BY " +
                    "     date, " +
                    "     input, " +
                    "     materialname, " +
                    "     codenumber, " +
                    "     lotno, " +
                    "     manufacturedate, " +
                    "     expirationdate, " +
                    "     materialwidth, " +
                    "     sqmprice, " +
                    "     bomno, " +
                    "     customer;                             ")

                .then(result => {


                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** finish
    // **** start  생산설비창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/selectmaterialinputinformation11', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()

                .query(
                    "SELECT " +
                    "     date, " +
                    "     input, " +
                    "     materialname, " +
                    "     codenumber, " +
                    "     lotno, " +
                    "     manufacturedate, " +
                    "     expirationdate, " +
                    "     materialwidth, " +
                    "     SUM(quantity) AS total_quantity," +
                    "     SUM(roll) AS total_roll, " +
                    "     sqmprice, " +
                    "     SUM(rollprice) AS total_rollprice, " +
                    "     bomno, " +
                    "     customer, " +
                    "     SUM(roll * rollprice) AS total_price " +
                    " FROM " +
                    "     materialinput where input='원자재출고' or input='원자재출고대기' " +
                    " GROUP BY " +
                    "     date, " +
                    "     input, " +
                    "     materialname, " +
                    "     codenumber, " +
                    "     lotno, " +
                    "     manufacturedate, " +
                    "     expirationdate, " +
                    "     materialwidth, " +
                    "     sqmprice, " +
                    "     bomno, " +
                    "     customer;                             ")

                .then(result => {


                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** finish
    // **** start  생산설비창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/selectmaterialinputinformation123', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");

            return pool.request()
                .input('start', sql.NVarChar, req.body.start)
                .input('finish', sql.NVarChar, req.body.finish)
                .query(
                    "   SELECT " +
                    "        date, " +
                    "        input, " +
                    "        materialname, " +
                    "        codenumber, " +
                    "        lotno, " +
                    "        manufacturedate, " +
                    "        expirationdate, " +
                    "        materialwidth, " +
                    "        SUM(quantity) AS total_quantity," +
                    "        SUM(roll) AS total_roll, " +
                    "        sqmprice, " +
                    "        SUM(rollprice) AS total_rollprice, " +
                    "        bomno, " +
                    "        customer, " +
                    "        SUM(roll * rollprice) AS total_price " +
                    "    FROM " +
                    "        materialinput " +
                    "    WHERE " +
                    "        (input='원자재입고' OR input='원자재입고대기') AND date BETWEEN @start AND @finish " +
                    "    GROUP BY " +
                    "        date, " +
                    "        input, " +
                    "        materialname, " +
                    "        codenumber, " +
                    "        lotno, " +
                    "        manufacturedate, " +
                    "        expirationdate, " +
                    "        materialwidth, " +
                    "        sqmprice, " +
                    "        bomno, " +
                    "     customer;"
                )
                .then(result => {
                    res.json(result.recordset);
                    res.end();
                })
                .catch(err => {
                    console.error('SQL error', err);
                    res.status(500).send('Internal server error');
                });
        });
    });

    // **** finish
    // **** start  생산설비창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/selectmaterialinputinformation1', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()

                .query(
                    "SELECT  " +
                    "     date,  " +
                    "     input,  " +
                    "     materialname,  " +
                    "     codenumber,  " +
                    "     lotno,  " +
                    "     manufacturedate,  " +
                    "     expirationdate,  " +
                    "     materialwidth,  " +
                    "     (quantity) AS quantity, " +
                    "     (roll) AS roll,  " +
                    "     sqmprice,  " +
                    "     (rollprice) AS rollprice, " +
                    "     bomno,  " +
                    "     customer,  " +
                    "     roll * rollprice AS price  " +
                    " FROM  " +
                    "     materialinput  where input='원자재입고' or input='수입검사대기'                 ")

                .then(result => {


                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** finish
    // **** start  생산설비창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/selectmaterialinputinformation12', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()


                .query(
                    "SELECT  " +
                    "     date,  " +
                    "     input,  " +
                    "     materialname,  " +
                    "     codenumber,  " +
                    "     lotno,  " +
                    "     manufacturedate,  " +
                    "     expirationdate,  " +
                    "     materialwidth,  " +
                    "     (quantity) AS quantity, " +
                    "     (roll) AS roll,  " +
                    "     sqmprice,  " +
                    "     (rollprice) AS rollprice, " +
                    "     bomno,  " +
                    "     customer,  " +
                    "     roll * rollprice AS price  " +
                    " FROM  " +
                    "     materialinput  where input='원자재출고' or input='원자재출고대기'                 ")

                .then(result => {


                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** finish
    // **** start  생산설비창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/selectpurchaseordermodel', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()
                .input('revnum', sql.Float, req.body.revnum)

                .query(

                    "WITH PriceChangeWithRowNumber AS ( " +
                    "     SELECT " +
                    "         bomno, " +
                    "         modelname, " +
                    "         itemname, " +
                    "         customer, " +
                    "         savedate, " +
                    "         price, " +
                    "         ROW_NUMBER() OVER (PARTITION BY bomno ORDER BY savedate ASC) AS row_num_asc, " +
                    "         ROW_NUMBER() OVER (PARTITION BY bomno ORDER BY savedate DESC) AS row_num_desc " +
                    "     FROM " +
                    "         pricechange " +
                    " ), " +
                    " BomCostSummary AS ( " +
                    "     SELECT " +
                    "         bomno, " +
                    "         model, " +
                    "         itemname, " +
                    "         SUM(cost) AS total_cost " +
                    "     FROM " +
                    "         bommanagement " +
                    "     GROUP BY " +
                    "         bomno, model, itemname " +
                    " ), " +
                    " ShipmentInputSummary AS ( " +
                    "     SELECT " +
                    "         bomno, " +
                    "         SUM(CASE WHEN revnum = @revnum THEN revcount ELSE 0 END) AS totalrevcount, " +
                    "         SUM(CASE WHEN revnum = @revnum THEN revprice ELSE 0 END) AS totalrevprice, " +
                    "         SUM(CASE WHEN revnum = '1' THEN revprice ELSE 0 END) AS totalrevpricesiljok " +
                    "     FROM " +
                    "         shipmentinput " +
                    "     WHERE " +
                    "         month BETWEEN '2023-12-01' AND '2023-12-31' " +
                    "     GROUP BY " +
                    "         bomno " +
                    " ), " +
                    " ItemInputSummary AS ( " +
                    "     SELECT " +
                    "         bomno, " +
                    "         SUM(quantity) AS total_quantity " +
                    "     FROM " +
                    "         iteminput " +
                    "     GROUP BY " +
                    "         bomno " +
                    " ), " +
                    " ProductionOrderSummary AS ( " +
                    "     SELECT " +
                    "         bomno, " +
                    "         SUM(quantity) AS total_production_quantity " +
                    "     FROM " +
                    "         orderlist " +
                    "     WHERE " +
                    "         orderstatus = '생산확정' " +
                    "     GROUP BY " +
                    "         bomno " +
                    " ), " +
                    " RollPriceSummary AS ( " +
                    "     SELECT " +
                    "         ol.bomno, " +
                    "         SUM(COALESCE(mi.rollprice, 0)) AS total_rollprice " +
                    "     FROM " +
                    "         orderlist ol " +
                    "     JOIN " +
                    "         bommanagement bm ON ol.bomno = bm.bomno " +
                    "     LEFT JOIN " +
                    "         Materialinfoinformation mi ON bm.materialname = mi.materialname " +
                    "     WHERE " +
                    "         ol.orderstatus = '생산확정' " +
                    "     GROUP BY " +
                    "         ol.bomno " +
                    " ) " +
                    " SELECT " +
                    "     bm.bomno, " +
                    "     pc_first.customer, " +
                    "     COUNT(bm.bomno) AS bomnocount, " +
                    "     pc_first.price AS firstprice, " +
                    "     ROUND(bcs.total_cost / pc_first.price * 100, 1) AS 'firstpercent', " +
                    "     pc_last.price AS nowprice, " +
                    "     bcs.total_cost AS 'nowcost', " +
                    "     ROUND(bcs.total_cost / pc_last.price * 100, 1) AS 'nowpercent', " +
                    "     sis.totalrevcount, " +
                    "     sis.totalrevprice, " +
                    "     sis.totalrevpricesiljok, " +
                    "     ROUND((sis.totalrevpricesiljok / sis.totalrevprice) * 100, 1) AS achievementrate, " +
                    "     COALESCE(sis.totalrevcount - COALESCE(iis.total_quantity, 0), 0) AS adjustedtotalrevcount, " +
                    "     COALESCE(iis.total_quantity, 0) AS totalquantityfromiteminput, " +
                    "     COALESCE(pos.total_production_quantity, 0) AS totalproductionquantity, " +
                    "     COALESCE(rps.total_rollprice, 0) AS total_rollprice " +
                    " FROM " +
                    "     bommanagement bm " +
                    " LEFT JOIN " +
                    "     PriceChangeWithRowNumber pc_first ON bm.bomno = pc_first.bomno AND pc_first.row_num_asc = 1 " +
                    " LEFT JOIN " +
                    "     PriceChangeWithRowNumber pc_last ON bm.bomno = pc_last.bomno AND pc_last.row_num_desc = 1 " +
                    " LEFT JOIN " +
                    "     BomCostSummary bcs ON bm.bomno = bcs.bomno " +
                    " LEFT JOIN " +
                    "     ShipmentInputSummary sis ON bm.bomno = sis.bomno " +
                    " LEFT JOIN " +
                    "     ItemInputSummary iis ON bm.bomno = iis.bomno " +
                    " LEFT JOIN " +
                    "     ProductionOrderSummary pos ON bm.bomno = pos.bomno " +
                    " LEFT JOIN " +
                    "     RollPriceSummary rps ON bm.bomno = rps.bomno " +
                    " GROUP BY " +
                    "     bm.bomno, pc_first.customer, bcs.total_cost, pc_first.price, pc_last.price, sis.totalrevcount, sis.totalrevprice, sis.totalrevpricesiljok, iis.total_quantity, pos.total_production_quantity, rps.total_rollprice               ")

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
                .input('bomno', sql.NVarChar, req.body.bomno)
                .input('sqmprice', sql.Float, req.body.sqmprice)
                .input('rollprice', sql.Float, req.body.rollprice)
                .input('customer', sql.NVarChar, req.body.customer)
                .input('orderid', sql.NVarChar, req.body.orderid)
                .input('house', sql.NVarChar, req.body.house)

                .query(
                    'insert into materialinput(customer,bomno,rollprice,date,input,materialname,codenumber,lotno,manufacturedate,expirationdate,materialwidth,quantity,roll,sum,price,accountnumber,contents,part,sqmprice,orderid,house)' +
                    ' values(@customer,@bomno,@rollprice,@date,@input,@materialname,@codenumber,@lotno,@manufacturedate,@expirationdate,@materialwidth,@quantity,@roll,@sum,@price,@accountnumber,@contents,@part,@sqmprice,@orderid,@house)'
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
        app.post('/api/materialoutputinsertdata', function (req, res) {

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
                .input('bomno', sql.NVarChar, req.body.bomno)
                .input('sqmprice', sql.Float, req.body.sqmprice)
                .input('rollprice', sql.Float, req.body.rollprice)
                .input('customer', sql.NVarChar, req.body.customer)
                .input('orderid', sql.NVarChar, req.body.orderid)
                .input('house', sql.NVarChar, req.body.house)

                .query(
                    'insert into materialinput(customer,bomno,rollprice,date,input,materialname,codenumber,lotno,manufacturedate,expirationdate,materialwidth,quantity,roll,sum,price,accountnumber,contents,part,sqmprice,orderid,house)' +
                    ' values(@customer,@bomno,@rollprice,@date,@input,@materialname,@codenumber,@lotno,@manufacturedate,@expirationdate,@materialwidth,@quantity,@roll,@sum,@price,@accountnumber,@contents,@part,@sqmprice,@orderid,@house)'
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
        app.post('/api/mimi', function (req, res) {

            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()
                //.input('변수',값 형식, 값)
                // .input('date', sql.NVarChar, req.body.date)


                .query(
                    "select " +
                    " * " +
                    " from " +
                    " materialinput " +
                    " where " +
                    " input ='잔단폐기'"
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
        app.post('/api/inserttoolbom', function (req, res) {

            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()
                //.input('변수',값 형식, 값)
                .input('bomno', sql.NVarChar, req.body.bomno)
                .input('part', sql.NVarChar, req.body.part)
                .input('toolcode', sql.NVarChar, req.body.toolcode)
                .input('char', sql.Float, req.body.char)
                .input('bomid', sql.NVarChar, req.body.bomid)
                .input('status', sql.NVarChar, req.body.status)

                .query(
                    'insert into bomtoolcode(bomno,part,toolcode,char,bomid,status)' +
                    ' values(@bomno,@part,@toolcode,@char,@bomid,@status)'
                )
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish
    // **** start       
    // app.post('/api/insertimage', function (req, res) {
    //     res.header("Access-Control-Allow-Origin", "*");

    //     // 파일 이름 및 데이터 추출
    //     const filename = req.body.filename;
    //     const filedata = req.body.filedata;

    //     // SQL 쿼리 실행
    //     return pool.request()
    //         .input('filename', sql.NVarChar, filename)
    //         // .input('filedata', sql.VarBinary, filedata)
    //         .query(
    //             'INSERT INTO filesave (filename) VALUES (@filename)'
    //         )
    //         .then(result => {
    //             console.log(result); // 콘솔에 .query의 결과 출력
    //             res.json({ success: true, message: '이미지가 성공적으로 삽입되었습니다.' });
    //         })
    //         .catch(error => {
    //             console.error(error);
    //             res.status(500).json({ success: false, message: '이미지 삽입 중 오류가 발생했습니다.' });
    //         });

    // });
    // **** finish


    // **** start       

    // **** finish


    // **** start       
    sql.connect(config).then(pool => {
        app.post('/api/insertbomtoolorder', function (req, res) {

            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()

                .input('orderdate', sql.NVarChar, req.body.orderdate)
                .input('inputdate', sql.NVarChar, req.body.inputdate)
                .input('madecustomer', sql.NVarChar, req.body.madecustomer)
                .input('toolcode', sql.NVarChar, req.body.toolcode)
                .input('bomno', sql.NVarChar, req.body.bomno)
                .input('customer', sql.NVarChar, req.body.customer)
                .input('itemname', sql.NVarChar, req.body.itemname)
                .input('char', sql.NVarChar, req.body.char)
                .input('part', sql.NVarChar, req.body.part)
                .input('ordercount', sql.Float, req.body.ordercount)
                .input('orderprice', sql.Float, req.body.orderprice)
                .input('sheet2', sql.NVarChar, req.body.sheet2)
                .input('part2', sql.NVarChar, req.body.part2)
                .input('ordercause', sql.NVarChar, req.body.ordercause)
                .input('deadline', sql.NVarChar, req.body.deadline)

                .query(
                    'insert into bomtoolorder(orderdate,inputdate,madecustomer,toolcode,bomno,customer,itemname,char,part,ordercount,orderprice,sheet2,part2,ordercause,deadline)' +
                    ' values(@orderdate,@inputdate,@madecustomer,@toolcode,@bomno,@customer,@itemname,@char,@part,@ordercount,@orderprice,@sheet2,@part2,@ordercause,@deadline)'
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
        app.post('/api/insertsampleorderinput', function (req, res) {

            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()

                .input('insertdate', sql.NVarChar, req.body.insertdate)
                .input('orderdate', sql.NVarChar, req.body.orderdate)
                .input('outdate', sql.NVarChar, req.body.outdate)
                .input('bomno', sql.NVarChar, req.body.bomno)
                .input('customer', sql.NVarChar, req.body.customer)
                .input('modelname', sql.NVarChar, req.body.modelname)
                .input('itemname', sql.NVarChar, req.body.itemname)
                .input('rev', sql.NVarChar, req.body.rev)
                .input('pcs', sql.NVarChar, req.body.pcs)
                .input('pcscount', sql.Float, req.body.pcscount)
                .input('ordercount', sql.Float, req.body.ordercount)
                .input('productcount', sql.NVarChar, req.body.productcount)
                .input('inspectioncount', sql.NVarChar, req.body.inspectioncount)
                .input('part', sql.NVarChar, req.body.part)
                .input('status', sql.NVarChar, req.body.status)
                .input('outtime', sql.NVarChar, req.body.outtime)
                .input('specification', sql.NVarChar, req.body.specification)
                .input('chung', sql.NVarChar, req.body.chung)
                .input('itemprice', sql.NVarChar, req.body.itemprice)
                .input('purchaseprice', sql.NVarChar, req.body.purchaseprice)
                .input('deadline', sql.NVarChar, req.body.deadline)

                .query(
                    'insert into sampleorderinput(insertdate,orderdate,outdate,bomno,customer,modelname,itemname,rev,pcs,pcscount,ordercount,productcount,inspectioncount,part,status,outtime,specification,chung,itemprice,purchaseprice,deadline)' +
                    ' values(@insertdate,@orderdate,@outdate,@bomno,@customer,@modelname,@itemname,@rev,@pcs,@pcscount,@ordercount,@productcount,@inspectioncount,@part,@status,@outtime,@specification,@chung,@itemprice,@purchaseprice,@deadline)'
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
    // **** start       
    sql.connect(config).then(pool => {
        app.post('/api/inserteqdata', function (req, res) {

            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()
                .input('codenumber', sql.NVarChar, req.body.codenumber)
                .input('equipmentname', sql.NVarChar, req.body.equipmentname)
                .input('eqname', sql.NVarChar, req.body.eqname)
                .input('part', sql.NVarChar, req.body.part)
                .input('size', sql.NVarChar, req.body.size)
                .input('num', sql.NVarChar, req.body.num)
                .input('customer', sql.NVarChar, req.body.customer)
                .input('serialno', sql.NVarChar, req.body.serialno)
                .input('manudate', sql.NVarChar, req.body.manudate)
                .input('position', sql.NVarChar, req.body.position)


                .query(
                    'insert into equipment(codenumber,equipmentname,eqname,part,size,num,customer,serialno,manudate,position)' +
                    ' values(@codenumber,@equipmentname,@eqname,@part,@size,@num,@customer,@serialno,@manudate,@position)'
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
        app.post('/api/selectbomsoyo', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()
                .input('bomno', sql.NVarChar, req.body.bomno)
                // .input('status', sql.NVarChar, req.body.status)

                .query(
                    "SELECT " +
                    "    bm.char, " +
                    "    bm.main, " +
                    "    bm.materialname, " +
                    "    mi.typecategory, " +
                    "    bm.etc, " +
                    "    bm.materialwidth, " +
                    "    bm.useable, " +
                    "    bm.onepid, " +
                    "    bm.twopid, " +
                    "    ROUND(bm.ta * ((bm.onepid + bm.talength + bm.twopid) / bm.allta) * 0.001 * (1 + (bm.loss / 100)),4) as soyo, " +
                    "    bm.ta, " +
                    "    bm.allta, " +
                    "    bm.talength, " +
                    "    bm.loss, " +
                    "    ROUND((mi.rollprice / (mi.length * 1000 * (FLOOR(mi.usewidth / bm.materialwidth)) * bm.cavity * (1 + (bm.loss / 100)) / ((bm.onepid + bm.talength + bm.twopid) / bm.allta))), 2) as cost, " +
                    "    FLOOR(mi.usewidth / bm.materialwidth) AS rlcut, " +
                    "    FLOOR((mi.length * 1000 * (FLOOR(mi.usewidth / bm.materialwidth)) * bm.cavity * (1 + (bm.loss / 100)) / ((bm.onepid + bm.talength + bm.twopid) / bm.allta))) as prdouctcount, " +
                    "    mi.width, " +
                    "    mi.usewidth, " +
                    "    mi.length, " +
                    "    mi.sqmprice, " +
                    "    mi.rollprice, " +
                    "    mi.unit, " +
                    "    mi.manufacterer, " +
                    "    mi.supplier, " +
                    "    bm.cavity, " +
                    "    mi.codenumber, " +
                    "    bm.num " +
                    "FROM " +
                    "    bommanagement bm " +
                    "JOIN " +
                    "    materialinfoinformation mi ON bm.codenumber = mi.codenumber " +
                    "WHERE " +
                    "    bm.bomno = @bomno and bm.status='true' and bm.main='메인자재'" +
                    "ORDER BY bm.num ASC; ")

                .then(result => {


                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** finish
    // **** start  생산설비창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/selectbomsoyo1', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()
                .input('bomno', sql.NVarChar, req.body.bomno)
                // .input('status', sql.NVarChar, req.body.status)

                .query(
                    "SELECT " +
                    "     bm.char, " +
                    "     bm.main, " +
                    "     bm.materialname, " +
                    "     mi.typecategory, " +
                    "     bm.etc, " +
                    "     bm.materialwidth, " +
                    "     bm.useable, " +
                    "     bm.onepid, " +
                    "     bm.twopid, " +
                    "     ROUND( " +
                    "         bm.ta * ((bm.onepid + bm.talength + bm.twopid) / bm.allta) * 0.001 * (1 + (bm.loss / 100)), " +
                    "         4 " +
                    "     ) as soyo,  " +
                    "     bm.ta,  " +
                    "     bm.allta,  " +
                    "     bm.talength,  " +
                    "     bm.loss,  " +
                    "     ROUND( " +
                    "         ( " +
                    "             mi.rollprice / ( " +
                    "                 mi.length * 1000 * (FLOOR(mi.usewidth / bm.materialwidth)) * bm.cavity * (1 + (bm.loss / 100)) " +
                    "             ) / ((bm.onepid + bm.talength + bm.twopid) / bm.allta) " +
                    "         ),  " +
                    "         2 " +
                    "     ) as cost,  " +
                    "     FLOOR(mi.usewidth / bm.materialwidth) AS rlcut,  " +
                    "     FLOOR( " +
                    "         ( " +
                    "             mi.length * 1000 * (FLOOR(mi.usewidth / bm.materialwidth)) * bm.cavity * (1 + (bm.loss / 100)) " +
                    "         ) / ((bm.onepid + bm.talength + bm.twopid) / bm.allta) " +
                    "     ) as productcount,  " +
                    "     mi.width,  " +
                    "     mi.usewidth,  " +
                    "     mi.length,  " +
                    "     mi.sqmprice,  " +
                    "     mi.rollprice,  " +
                    "     mi.unit,  " +
                    "     mi.manufacterer,  " +
                    "     mi.supplier,  " +
                    "     bm.cavity,  " +
                    "     mi.codenumber,  " +
                    "     bm.num , " +
                    "     mi.LENGTH " +
                    " FROM   " +
                    "     bommanagement bm   " +
                    " JOIN   " +
                    "     materialinfoinformation mi ON bm.codenumber = mi.codenumber   " +
                    " WHERE   " +
                    "     bm.bomno = @bomno " +
                    "     AND bm.status = 'true'  " +
                    "     AND bm.main = '메인자재' " +
                    " ORDER BY " +
                    "     bm.num ASC;                ")

                .then(result => {


                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** finish
    // **** start  생산설비창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/selectbommasssavebommanagement', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()
                .input('bomno', sql.NVarChar, req.body.bomno)
                // .input('status', sql.NVarChar, req.body.status)

                .query(
                    "SELECT " +
                    "    bm.char, " +
                    "    bm.main, " +
                    "    bm.materialname, " +
                    "    mi.typecategory, " +
                    "    bm.etc, " +
                    "    bm.materialwidth, " +
                    "    bm.useable, " +
                    "    bm.onepid, " +
                    "    bm.twopid, " +
                    "    ROUND(bm.ta * ((bm.onepid + bm.talength + bm.twopid) / bm.allta) * 0.001 * (1 + (bm.loss / 100)),4) as soyo, " +
                    "    bm.ta, " +
                    "    bm.allta, " +
                    "    bm.talength, " +
                    "    bm.loss, " +
                    "    ROUND(mi.rollprice/FLOOR((mi.length * 1000 * (FLOOR(mi.usewidth / bm.materialwidth)) * bm.cavity * (1 - (bm.costloss / 100)) / ((bm.onepid + bm.talength + bm.twopid) / bm.allta))),2) as cost, " +
                    "    FLOOR(mi.usewidth / bm.materialwidth) AS rlcut, " +
                    "    FLOOR((mi.length * 1000 * (FLOOR(mi.usewidth / bm.materialwidth)) * bm.cavity * (1 - (bm.costloss / 100)) / ((bm.onepid + bm.talength + bm.twopid) / bm.allta))) as prdouctcount, " +
                    "    mi.width, " +
                    "    mi.usewidth, " +
                    "    mi.length, " +
                    "    mi.sqmprice, " +
                    "    mi.rollprice, " +
                    "    mi.unit, " +
                    "    mi.manufacterer, " +
                    "    mi.supplier, " +
                    "    bm.cavity, " +
                    "    mi.codenumber, " +
                    "    bm.num,bm.chk1,bm.chk2,bm.chk3 " +
                    "FROM " +
                    "    bommanagement bm " +
                    "JOIN " +
                    "    materialinfoinformation2 mi ON bm.codenumber = mi.codenumber " +
                    "WHERE " +
                    "    bm.bomno = @bomno and bm.status='true' " +
                    "ORDER BY bm.num ASC; ")

                .then(result => {


                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** finish
    // **** start  생산설비창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/selectpaperbomno', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()
                .input('bomno', sql.NVarChar, req.body.bomno)
                // .input('status', sql.NVarChar, req.body.status)

                .query(
                    " SELECT " +
                    "     hapji, " +
                    "     etc, " +
                    "     materialwidth, " +
                    "     onepid, " +
                    "     twopid, " +
                    "     ROUND(ROUND(bm.ta * ((bm.onepid + bm.talength + bm.twopid) / bm.allta) * 0.001 * (1 + (bm.loss / 100)), 4) , 0) AS soyo " +
                    " FROM " +
                    "     bommanagement bm " +
                    " WHERE  " +
                    "     bomno = @bomno AND hapji IS NOT NULL " +
                    " GROUP BY " +
                    "     materialwidth, etc, hapji, hapjinum, onepid, twopid, allta, talength, loss, ta " +
                    " ORDER BY " +
                    "     hapjinum ASC" +

                    "ORDER BY bm.num ASC; ")

                .then(result => {


                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** finish
    // **** start  생산설비창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/selectmaxwidthmaterial', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()
                .input('codenumber', sql.NVarChar, req.body.codenumber)
                .input('materialwidth', sql.NVarChar, req.body.materialwidth)
                // .input('status', sql.NVarChar, req.body.status)

                .query(
                    "select" +
                    " * " +
                    " from" +
                    " materialinput" +
                    " where " +
                    " input='원자재입고' and codenumber=@codenumber and materialwidth > @materialwidth +20              ")

                .then(result => {


                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** finish
    // **** start  생산설비창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/selectshipmentinspection', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()
                .query(
                    "SELECT " +
                    "     iteminfo.bomno," +
                    "     iteminfo.modelname," +
                    "     iteminfo.itemname," +
                    "     iteminfo.customer," +
                    "     iteminfo.itemcode," +
                    "     COUNT(shipmentinspection.bomno) AS shipmentinspection" +
                    " FROM " +
                    "     iteminfo" +
                    " LEFT JOIN " +
                    "     shipmentinspection ON iteminfo.bomno = shipmentinspection.bomno" +
                    " GROUP BY " +
                    "     iteminfo.bomno, " +
                    "     iteminfo.modelname," +
                    "     iteminfo.itemname," +
                    "     iteminfo.customer," +
                    "     iteminfo.itemcode;        ")

                .then(result => {


                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** finish
    // **** start  생산설비창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/selectmting', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()
                .input('lotno', sql.NVarChar, req.body.lotno)
                .input('materialname', sql.NVarChar, req.body.materialname)

                .query(
                    "select * from materialinput where lotno=@lotno and materialname=@materialname")

                .then(result => {


                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** finish
    // **** start  생산설비창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/slitingstatus', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()
                .input('lotno', sql.NVarChar, req.body.lotno)
                // .input('status', sql.NVarChar, req.body.status)

                .query(
                    "SELECT " +
                    "     bm.bomno, " +
                    "     bm.model," +
                    "     pp.lotno," +
                    "     bm.itemname," +
                    "     bm.materialname," +
                    "     bm.codenumber," +
                    "     bm.materialwidth," +
                    "     bm.etc," +
                    "     ROUND(SUM(bm.ta * ((bm.onepid + bm.talength + bm.twopid) / bm.allta) * 0.001 * (1 + (bm.loss / 100))), 4) as soyo," +
                    "     pp.pono," +
                    "     CEILING(SUM(bm.ta * ((bm.onepid + bm.talength + bm.twopid) / bm.allta) * 0.001 * (1 + (bm.loss / 100))) * pp.pono / 10) * 10 as allsoyo," +
                    "     bm.hapji," +
                    "     mi.width as width," +
                    "     mi.length as materiallength,mi.usagecategory,mi.rollprice" +
                    " FROM " +
                    "     bommanagement AS bm" +
                    " INNER JOIN " +
                    "     produceplan AS pp ON bm.bomno = pp.bomno" +
                    " LEFT JOIN" +
                    "     materialinfoinformation AS mi ON bm.materialname = mi.materialname" +
                    " WHERE " +
                    "     (bm.hapji IS NOT NULL OR bm.hapji <> '') AND pp.slitingstatus ='슬리팅대기' and pp.lotno=@lotno " +
                    " GROUP BY" +
                    "     bm.bomno," +
                    "     bm.model," +
                    "     bm.itemname," +
                    "     bm.materialname," +
                    "     bm.codenumber," +
                    "     bm.materialwidth," +
                    "     bm.etc," +
                    "     pp.pono," +
                    "     bm.hapji," +
                    "     mi.width," +
                    "     mi.length," +
                    "     pp.lotno,mi.usagecategory,mi.rollprice" +
                    " ORDER BY" +
                    "     bm.hapji ASC;                ")

                .then(result => {


                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** finish
    // **** start  생산설비창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/slitingresult', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()
                .input('lotno', sql.NVarChar, req.body.lotno)
                .input('hapji', sql.NVarChar, req.body.hapji)
                // .input('status', sql.NVarChar, req.body.status)

                .query(
                    "					SELECT " +
                    "     bm.hapji," +
                    "     bm.materialname," +
                    "     bm.codenumber," +
                    "     bm.materialwidth," +
                    "     CEILING(SUM(bm.ta * ((bm.onepid + bm.talength + bm.twopid) / bm.allta) * 0.001 * (1 + (bm.loss / 100))) * pp.pono / 10) * 10 as allsoyo" +
                    " FROM " +
                    "     bommanagement AS bm" +
                    " INNER JOIN " +
                    "     produceplan AS pp ON bm.bomno = pp.bomno" +
                    " LEFT JOIN" +
                    "     materialinfoinformation AS mi ON bm.materialname = mi.materialname" +
                    " WHERE " +
                    "     (bm.hapji IS NOT NULL OR bm.hapji <> '') AND pp.slitingstatus ='슬리팅대기'  and hapji=@hapji" +
                    " GROUP BY" +
                    "     bm.bomno," +
                    "     bm.model," +
                    "     bm.itemname," +
                    "     bm.materialname," +
                    "     bm.codenumber," +
                    "     bm.materialwidth," +
                    "     bm.etc," +
                    "     pp.pono," +
                    "     bm.hapji," +
                    "     mi.width," +
                    "     mi.length," +
                    "     pp.lotno,mi.usagecategory,mi.rollprice" +
                    " ORDER BY" +
                    "     bm.hapji ASC;      ")

                .then(result => {


                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** finish

    // **** start  생산설비창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/slitingstatus1', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()
                .input('lotno', sql.NVarChar, req.body.lotno)
                // .input('status', sql.NVarChar, req.body.status)

                .query(
                    "SELECT " +
                    "     bm.hapji, " +
                    "      bm.materialwidth " +
                    "  FROM  " +
                    "      bommanagement AS bm " +
                    "  INNER JOIN  " +
                    "      produceplan AS pp ON bm.bomno = pp.bomno " +
                    "  LEFT JOIN " +
                    "      materialinfoinformation AS mi ON bm.materialname = mi.materialname " +
                    "  WHERE  " +
                    "      (bm.hapji IS NOT NULL OR bm.hapji <> '') AND pp.slitingstatus ='슬리팅대기' and pp.lotno=@lotno " +
                    "  GROUP BY " +
                    "   " +
                    "      bm.hapji, " +
                    "      bm.materialwidth, " +

                    "      pp.lotno " +
                    "   " +
                    "  ORDER BY " +
                    "      bm.hapji ASC;                     ")

                .then(result => {


                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** finish
    // **** start  생산설비창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/slitinghabjilist', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()
                .input('lotno', sql.NVarChar, req.body.bomno)
                // .input('status', sql.NVarChar, req.body.status)

                .query(
                    "SELECT  " +
                    "     pp.plandate, " +
                    "     pp.part," +
                    "     bm.bomno," +
                    "     bm.model," +
                    "     pp.lotno," +
                    "     bm.itemname," +
                    "     pp.slitingstatus,bm.hapji" +
                    "   " +
                    " FROM " +
                    "     bommanagement AS bm" +
                    " INNER JOIN " +
                    "     produceplan AS pp ON bm.bomno = pp.bomno" +
                    " WHERE " +
                    "     COALESCE(bm.hapji, '') <> ''  AND (pp.slitingstatus ='슬리팅대기' or pp.slitingstatus='슬리팅작업지시완료') " +
                    " GROUP BY" +
                    "     bm.bomno," +
                    "     bm.model," +
                    "     bm.itemname," +
                    "       pp.lotno,pp.plandate,pp.part,pp.slitingstatus ,bm.hapji                        ")

                .then(result => {


                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** finish
    // **** start  생산설비창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/selectbommasssavebommanagement1', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()
                .input('bomno', sql.NVarChar, req.body.bomno)
                // .input('status', sql.NVarChar, req.body.status)

                .query(
                    "SELECT " +
                    "    bm.char, " +
                    "    bm.main, " +
                    "    bm.materialname, " +
                    "    mi.typecategory, " +
                    "    bm.etc, " +
                    "    bm.materialwidth, " +
                    "    bm.useable, " +
                    "    bm.onepid, " +
                    "    bm.twopid, " +
                    "    ROUND(bm.ta * ((bm.onepid + bm.talength + bm.twopid) / bm.allta) * 0.001 * (1 + (bm.loss / 100)),4) as soyo, " +
                    "    bm.ta, " +
                    "    bm.allta, " +
                    "    bm.talength, " +
                    "    bm.loss, " +
                    "    ROUND(mi.rollprice/FLOOR((mi.length * 1000 * (FLOOR(mi.usewidth / bm.materialwidth)) * bm.cavity * (1 - (bm.costloss / 100)) / ((bm.onepid + bm.talength + bm.twopid) / bm.allta))),2) as cost, " +
                    "    FLOOR(mi.usewidth / bm.materialwidth) AS rlcut, " +
                    "    FLOOR((mi.length * 1000 * (FLOOR(mi.usewidth / bm.materialwidth)) * bm.cavity * (1 - (bm.costloss / 100)) / ((bm.onepid + bm.talength + bm.twopid) / bm.allta))) as prdouctcount, " +
                    "    mi.width, " +
                    "    mi.usewidth, " +
                    "    mi.length, " +
                    "    mi.sqmprice, " +
                    "    mi.rollprice, " +
                    "    mi.unit, " +
                    "    mi.manufacterer, " +
                    "    mi.supplier, " +
                    "    bm.cavity, " +
                    "    mi.codenumber, " +
                    "    bm.num " +
                    "FROM " +
                    "    vntbommanagement bm " +
                    "JOIN " +
                    "    vetnammaterialinfo mi ON bm.codenumber = mi.codenumber " +
                    "WHERE " +
                    "    bm.bomno = @bomno and bm.status='true' " +
                    "ORDER BY bm.num ASC; ")

                .then(result => {


                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** finish
    // **** start  생산설비창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/selectbomsamplesavebommanagement', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()
                .input('bomno', sql.NVarChar, req.body.bomno)
                // .input('status', sql.NVarChar, req.body.status)

                .query(
                    "SELECT " +
                    "    bm.char, " +
                    "    bm.main, " +
                    "    bm.materialname, " +
                    "    bm.etc, " +
                    "    bm.materialwidth, " +
                    "    bm.useable, " +
                    "    bm.onepid, " +
                    "    bm.twopid, " +
                    "    ROUND(bm.ta * ((bm.onepid + bm.talength + bm.twopid) / bm.allta) * 0.001 * (1 + (bm.loss / 100)), 4) as soyo, " +
                    "    bm.ta, " +
                    "    bm.allta, " +
                    "    bm.talength, " +
                    "    bm.loss, " +
                    "    bm.cavity, " +
                    "    bm.num " +
                    "    FROM " +
                    "    bommanagementsample bm " +
                    "    WHERE " +
                    "    bm.bomno=@bomno and bm.status='true' " +
                    "ORDER BY " +
                    "    bm.num ASC;                ")

                .then(result => {


                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** finish
    // **** start  생산설비창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/insepectioninformation', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()
                .input('bomno', sql.NVarChar, req.body.bomno)

                .query(
                    "SELECT " +
                    "    m.materialname, " +
                    "    m.codenumber, " +
                    "    m.manufacterer, " +
                    "    m.supplier, " +
                    "    m.typecategory, " +
                    "    m.width, " +
                    "    s.thickness " +
                    "FROM " +
                    "    materialinfoinformation m " +
                    "JOIN " +
                    "    materialinsepctionspec s ON m.materialname = s.materialname " +
                    "WHERE " +
                    "    m.inspection = 'y';")

                .then(result => {


                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** finish
    // **** start  생산설비창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/selecttoolmain', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()
                .input('id', sql.Int, req.body.id)

                .query(
                    "select * from sampleorder where id=@id")

                .then(result => {


                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** finish
    // **** start  생산설비창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/selectbomtoolcode', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()
                .input('bomid', sql.NVarChar, req.body.bomid)

                .query(
                    "select * from bomtoolcode where bomid=@bomid and status='true'")

                .then(result => {


                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** finish
    // **** start  생산설비창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/selectamaterialname', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()
                .input('materialname', sql.NVarChar, req.body.materialname)

                .query(
                    "select * from materialinput where materialname=@materialname  ")

                .then(result => {


                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** finish
    // **** start  생산설비창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/selectbmaterialname', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()
                .input('materialname', sql.NVarChar, req.body.materialname)

                .query(
                    "select * from materialinput where materialname=@materialname  ")

                .then(result => {


                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** finish
    // **** start  생산설비창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/selectbomnobomtoolcode', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()
                .input('bomno', sql.NVarChar, req.body.bomno)

                .query(
                    "SELECT * FROM bomtoolcode " +
                    " WHERE bomno = @bomno " +
                    "   AND status = 'true' " +
                    "   AND toolcode IS NOT NULL " +
                    "   AND toolcode != '' " +
                    " order by part asc ")

                .then(result => {


                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** finish
    // **** start  생산설비창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/updateusewidth', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()
                .input('id', sql.NVarChar, req.body.id)
                .input('usewidth', sql.Float, req.body.usewidth)

                .query(
                    "update materialinfoinformation set usewidth=@usewidth where id=@id")

                .then(result => {


                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** finish
    // **** start  생산설비창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/updatapinacledata', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");

            return pool.request()
                .input('id', sql.Int, req.body.id)
                .input('partcustomer', sql.NVarChar, req.body.partcustomer)
                .input('customer', sql.NVarChar, req.body.customer)
                .input('toolcode', sql.NVarChar, req.body.toolcode)
                .input('bomno', sql.NVarChar, req.body.bomno)
                .input('modelname', sql.NVarChar, req.body.modelname)
                .input('itemname', sql.NVarChar, req.body.itemname)
                .input('char', sql.NVarChar, req.body.char)
                .input('part', sql.NVarChar, req.body.part)
                .input('etc', sql.NVarChar, req.body.etc)
                .input('classification', sql.NVarChar, req.body.classification)
                .input('inputprice', sql.Float, req.body.inputprice)
                .input('outputprice', sql.Float, req.body.outputprice)


                .query(
                    "update sampleorder set bomno=@bomno,classification=@classification,partcustomer=@partcustomer,toolcode=@toolcode,customer=@customer,modelname=@modelname,itemname=@itemname,char=@char,part=@part,inputprice=@inputprice,outputprice=@outputprice,etc=@etc where id=@id")

                .then(result => {


                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** finish
    // **** start  생산설비창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/updatapinacledata', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");

            return pool.request()
                .input('bomid', sql.Int, req.body.id)



                .query(
                    "update bomtoolcode set status='false' where bomid=@bomid")

                .then(result => {


                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** finish
    // **** start  생산설비창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/updatebomtoolcode', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");

            return pool.request()
                .input('bomid', sql.NVarChar, req.body.bomid)
                .input('status', sql.NVarChar, req.body.status)



                .query(
                    "update bomtoolcode set status=@status where bomid=@bomid")

                .then(result => {


                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** finish
    // **** start  생산설비창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/selectequipment', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()

                .query(
                    " select " +
                    " size,customer " +
                    " from equipment where develop='사용' group by size,customer")

                .then(result => {


                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** finish
    // **** start  생산설비창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/selectbompinacle', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()
                .input('bomno', sql.NVarChar, req.body.bomno)

                .query(
                    "SELECT " +
                    "     toolcode, char " +
                    " FROM      sampleorder " +
                    " WHERE     bomno = @bomno AND (part = '피나클' OR part = '실링') " +
                    " GROUP BY   toolcode, char;")

                .then(result => {


                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** finish
    // **** start  생산설비창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/selecttoolcode', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()
                .input('toolcode', sql.NVarChar, req.body.toolcode)

                .query(
                    "select " +
                    " * " +
                    " from  " +
                    " sampleorder where toolcode=@toolcode")

                .then(result => {


                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** finish
    // **** start  생산설비창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/deletetoolcode', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()
                .input('id', sql.Int, req.body.id)
                .query(
                    "delete from sampleorder where id=@id")
                .then(result => {
                    res.json(result.recordset);
                    res.end();

                });
        });

    });
    // **** finish
    // **** start  생산설비창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/deletebomtoolorder', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()
                .input('id', sql.Int, req.body.id)
                .query(
                    "delete from bomtoolorder where id=@id")
                .then(result => {
                    res.json(result.recordset);
                    res.end();

                });
        });

    });
    // **** finish
    // **** start  생산설비창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/selectbommold', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()
                .input('bomno', sql.NVarChar, req.body.bomno)

                .query(
                    "select " +
                    " toolcode,char " +
                    " from  " +
                    " sampleorder where bomno=@bomno and part='금형' group by toolcode,char")

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
                    "SELECT  " +
                    "id, " +
                    "input, " +
                    "date, " +
                    "materialname, " +
                    "classification, " +
                    "customer, " +
                    "lotno, " +
                    "manufacturedate, " +
                    "expirationdate, " +
                    "format(convert(int,Isnull(materialwidth,0)),'##,##0')'materialwidth', " +
                    "format(convert(int,Isnull(quantity,0)),'##,##0')'quantity', " +
                    "format(convert(int,Isnull(roll,0)),'##,##0')'roll',  " +
                    "sum,part,house,codenumber,  " +
                    "format(convert(int,Isnull(sqmprice,0)),'##,##0')'sqmprice'  " +

                    " FROM materialinput  order by materialname,lotno asc ")
                .then(result => {


                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** finish
    // **** start  생산설비창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/capasearching', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()
                .input('start', sql.NVarChar, req.body.start)
                .input('finish', sql.NVarChar, req.body.finish)
                .query(
                    "SELECT " +
                    "      *, " +
                    "      custom_condition_column * 60 AS additional_calculated_column1, " +
                    "      custom_condition_column * 60*8 AS additional_calculated_column2, " +
                    "      custom_condition_column * 60*10.5 AS additional_calculated_column3, " +
                    "      custom_condition_column * 60 *cavity AS cv1,   " +
                    "      custom_condition_column * 480 *cavity AS cv2,   " +
                    "      custom_condition_column * 60*10.5*cavity AS cv3,   " +
                    "    	 custom_condition_column *20*cavity AS cv4, " +
                    "    						 custom_condition_column *160*cavity AS cv5, " +
                    "    						 custom_condition_column *210*cavity AS cv6, " +
                    "    						 custom_condition_column *0.004*cavity AS cv7, " +
                    "    						 custom_condition_column *0.003*cavity AS cv8 " +
                    "  FROM ( " +
                    "      SELECT  " +
                    "          iteminfo.bomno, " +
                    "          iteminfo.customer, " +
                    "          iteminfo.modelname,  " +
                    "          iteminfo.itemname,  " +
                    "          iteminfo.workpart,  " +
                    "          iteminfo.working, " +
                    "          bommanagement.onepid AS onepidding,  " +
                    "          iteminfo.cavity, " +
                    "          '고속' AS additional_column, " +
                    "          iteminfo.working * 30 AS calculated_column, " +
                    "          CASE " +
                    "              WHEN bommanagement.onepid < 90 THEN 100 " +
                    "              WHEN bommanagement.onepid < 150 THEN 83 " +
                    "              WHEN bommanagement.onepid < 190 THEN 50 " +
                    "              ELSE 33   " +
                    "          END AS custom_condition_column " +
                    "      FROM iteminfo " +
                    "      JOIN bommanagement ON iteminfo.bomno = bommanagement.bomno " +
                    "      GROUP BY  " +
                    "          iteminfo.bomno,  " +
                    "          iteminfo.modelname, " +
                    "          iteminfo.itemname,  " +
                    "          iteminfo.workpart,  " +
                    "          iteminfo.working,  " +
                    "          iteminfo.cavity, " +
                    "          iteminfo.customer," +
                    "          bommanagement.onepid,  " +
                    "          iteminfo.onepidding " +
                    "  ) AS subquery_alias;               ")
                .then(result => {


                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** finish
    // **** start  생산설비창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/capasearchingwherebomno', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()
                .input('bomno', sql.NVarChar, req.body.bomno)

                .query(
                    "SELECT " +
                    "      *, " +
                    "      custom_condition_column * 60 AS additional_calculated_column1, " +
                    "       custom_condition_column * 80 AS additional_calculated_column2, " +
                    "        custom_condition_column * 10.5 AS additional_calculated_column3, " +
                    "      custom_condition_column * 60 *cavity AS cv1,   " +
                    "      custom_condition_column * 480 *cavity AS cv2,   " +
                    "      custom_condition_column * 60*10.5*cavity AS cv3   " +
                    "  FROM ( " +
                    "      SELECT  " +
                    "          iteminfo.bomno, " +
                    "          iteminfo.customer, " +
                    "          iteminfo.modelname,  " +
                    "          iteminfo.itemname,  " +
                    "          iteminfo.workpart,  " +
                    "          iteminfo.working, " +
                    "          bommanagement.onepid AS onepidding,  " +
                    "          iteminfo.cavity, " +
                    "          '고속' AS additional_column, " +
                    "          iteminfo.cavity * 0.5 AS calculated_column, " +
                    "          CASE " +
                    "              WHEN bommanagement.onepid < 90 THEN 100 " +
                    "              WHEN bommanagement.onepid < 150 THEN 83 " +
                    "              WHEN bommanagement.onepid < 190 THEN 50 " +
                    "              ELSE 33   " +
                    "          END AS custom_condition_column " +
                    "      FROM iteminfo " +
                    "      JOIN bommanagement ON iteminfo.bomno = bommanagement.bomno " +
                    "      WHERE iteminfo.bomno = @bomno " +
                    "      GROUP BY  " +
                    "          iteminfo.bomno,  " +
                    "          iteminfo.modelname, " +
                    "          iteminfo.itemname,  " +
                    "          iteminfo.workpart,  " +
                    "          iteminfo.working,  " +
                    "          iteminfo.cavity, " +
                    "          iteminfo.customer," +
                    "          bommanagement.onepid,  " +
                    "          iteminfo.onepidding " +
                    "  ) AS subquery_alias;               ")
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
        app.post('/api/selectmaterialinfoinformation', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()
                // .input('start', sql.NVarChar, req.body.start)
                // .input('finish', sql.NVarChar, req.body.finish)
                .query(
                    "SELECT TOP (100) " +
                    "* " +
                    "  FROM materialinfoinformation2 order by materialname asc"
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
        app.post('/api/inspectionfinish', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()

                .query(
                    "SELECT " +
                    "    COALESCE(insp.inspectiondate, '') AS inspectiondate,		  " +
                    "    COALESCE(insp.inspectionpeople, '') AS inspectionpeople,	" +
                    "    combined.typecategory," +
                    "    combined.manufacterer, " +
                    "    combined.supplier, " +
                    "    combined.materialname, " +
                    "    combined.materialinput_codenumber, " +
                    "    combined.lotno, " +
                    "    combined.roll, " +
                    "    COALESCE(insp.inspectionroll, '') AS inspectionroll,		    " +
                    "    COALESCE(spec.thickness, '') AS thickness,		   " +
                    "    COALESCE(insp.thickness1, '') AS thickness1, " +
                    "    COALESCE(insp.thickness2, '') AS thickness2, " +
                    "    COALESCE(insp.thickness3, '') AS thickness3, " +
                    "    COALESCE(insp.thickness4, '') AS thickness4, " +
                    "    COALESCE(insp.thickness5, '') AS thickness5   " +

                    "FROM ( " +
                    "    SELECT " +
                    "        m.materialname, " +
                    "        m.codenumber AS materialinput_codenumber, " +
                    "        i.codenumber AS materialinfoinformation_codenumber, " +
                    "        i.inspection, " +
                    "        i.supplier, " +
                    "        i.manufacterer, " +
                    "        i.typecategory, " +
                    "        m.lotno,m.roll " +

                    "    FROM  " +
                    "        materialinput m " +
                    "    INNER JOIN " +
                    "        materialinfoinformation i ON m.materialname = i.materialname AND m.codenumber = i.codenumber " +
                    "    WHERE " +
                    "        i.inspection = 'y' " +
                    ") AS combined " +
                    "LEFT JOIN " +
                    "    materialinsepctionspec spec ON combined.materialname = spec.materialname " +
                    "LEFT JOIN " +
                    "    materialinsepectioninput insp ON combined.materialname = insp.materialname"
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
        app.post('/api/modelminus', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()

                .query(
                    " select * from modelminus"

                )

                .then(result => {


                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** start  생산설비창 띄우기  
    // **** start  생산설비창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/customerminus', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()

                .query(
                    " select * from customerminus"

                )

                .then(result => {


                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** start  생산설비창 띄우기  
    // **** start  생산설비창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/timeproduction', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()

                .query(
                    " select * from timeproduction"

                )

                .then(result => {


                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** start  생산설비창 띄우기  
    // **** start  생산설비창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/su1', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()

                .query(
                    " select * from su1"

                )

                .then(result => {


                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** start  생산설비창 띄우기  
    // **** start  생산설비창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/su2', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()

                .query(
                    " select * from su2"

                )

                .then(result => {


                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** start  생산설비창 띄우기  
    // **** start  생산설비창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/su3', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()

                .query(
                    " select * from su3"

                )

                .then(result => {


                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** start  생산설비창 띄우기  
    // **** start  생산설비창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/pur6', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()

                .query(
                    " select * from pur6"

                )

                .then(result => {


                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** start  생산설비창 띄우기  
    // **** start  생산설비창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/pur8', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()

                .query(
                    " select * from pur8"

                )

                .then(result => {


                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** start  생산설비창 띄우기  
    // **** start  생산설비창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/mr5', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()

                .query(
                    " select * from mr5 where stay='left'"

                )

                .then(result => {


                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** start  생산설비창 띄우기  
    // **** start  생산설비창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/mr51', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()

                .query(
                    " select * from mr5 where stay='right'"

                )

                .then(result => {


                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** start  생산설비창 띄우기  
    // **** start  생산설비창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/mr2', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()

                .query(
                    " select * from mr2 order by a desc"

                )

                .then(result => {


                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** start  생산설비창 띄우기  
    // **** start  생산설비창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/mr2searching', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()
                .input('start', sql.NVarChar, req.body.start)
                .input('finish', sql.NVarChar, req.body.finish)

                .query(
                    " select * from mr2 where e between  @start and @finish"

                )

                .then(result => {


                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** start  생산설비창 띄우기  
    // **** start  생산설비창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/orderidmaterialinput', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()
                .input('orderid', sql.NVarChar, req.body.orderid)

                .query(
                    " select * from materialinput  where orderid=@orderid and input='원자재출고'"

                )

                .then(result => {


                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** start  생산설비창 띄우기  
    // **** start  생산설비창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/mr1', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()
                .input('codenumber', sql.NVarChar, req.body.codenumber)

                .query(
                    " select id,a,b,c,d from mr1 where codenumber=@codenumber "

                )

                .then(result => {


                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** start  생산설비창 띄우기  
    // **** start  생산설비창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/deletemr1', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()
                .input('id', sql.Int, req.body.id)

                .query(
                    "delete from mr1 where id=@id "

                )

                .then(result => {


                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** start  생산설비창 띄우기  
    // **** start  생산설비창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/deleteshipmentinspection', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()
                .input('id', sql.Int, req.body.id)

                .query(
                    "delete from shipmentinspection where id=@id "

                )

                .then(result => {


                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** start  생산설비창 띄우기  
    // **** start  생산설비창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/selectshipmentinspectionwherebomno', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()
                .input('bomno', sql.NVarChar, req.body.bomno)

                .query(
                    "select * from shipmentinspection where bomno=@bomno order by part asc "

                )

                .then(result => {


                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** start  생산설비창 띄우기  
    // **** start  생산설비창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/selectshipmentwait', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()

                .query(
                    "select * from shipmentwait where status='출하검사대기' "

                )

                .then(result => {


                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** start  생산설비창 띄우기  
    // **** start  생산설비창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/selectshipmentwait', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()

                .query(
                    "select * from customerinspection where status='출하검사대기' "

                )

                .then(result => {


                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** start  생산설비창 띄우기  
    // **** start  생산설비창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/selectcustomerinspection', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()

                .query(
                    "select * from customerinspection  "

                )

                .then(result => {


                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** start  생산설비창 띄우기  
    // **** start  생산설비창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/updateshipmentinspection', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()
                .input('part', sql.NVarChar, req.body.bomno)
                .input('spec', sql.Float, req.body.bomno)
                .input('plus', sql.Float, req.body.bomno)
                .input('minus', sql.Float, req.body.bomno)
                .input('id', sql.Int, req.body.bomno)

                .query(
                    "update shipmentinspection set part=@part,spec=@spec,plus=@plus,minus=@minus where id=@id "

                )

                .then(result => {


                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** start  생산설비창 띄우기  
    // **** start  생산설비창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/updatemr1', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()
                .input('id', sql.Int, req.body.id)
                .input('a', sql.NVarChar, req.body.a)
                .input('b', sql.NVarChar, req.body.b)
                .input('c', sql.NVarChar, req.body.c)
                .input('d', sql.NVarChar, req.body.d)

                .query(
                    "update mr1 set a=@a,b=@b ,c=@c,d=@d where id=@id"
                )

                .then(result => {


                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** start  생산설비창 띄우기  
    // **** start  생산설비창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/su4', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()

                .query(
                    " select * from su4"

                )

                .then(result => {


                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** start  생산설비창 띄우기  
    // **** start  생산설비창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/finalfinal', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()

                .query(
                    " select * from alltest where status='최종검사대기'"

                )

                .then(result => {


                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** start  생산설비창 띄우기  
    // **** start  생산설비창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/saleinfo', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()

                .query(
                    "SELECT " +
                    "     id," +
                    "     saledate," +
                    "     customer," +
                    "     itemcode," +
                    "     modelname," +
                    "     itemname," +
                    "     salecount," +
                    "     itemprice," +
                    "     salecount * itemprice as totalprice," +
                    "     etc," +
                    "     salestatus" +
                    " FROM " +
                    "     saleinfo" +
                    " " +
                    " UNION ALL" +
                    " " +
                    " SELECT " +
                    "     '' AS id," +
                    "     '합계' AS saledate," +
                    "     '' AS customer," +
                    "     '' AS itemcode," +
                    "     '' AS modelname," +
                    "     '' AS itemname," +
                    "     sum(salecount) AS salecount," +
                    "     count(itemprice) AS itemprice," +
                    "     SUM(salecount * itemprice) as totalprice," +
                    "     '' AS etc," +
                    "     '' AS salestatus" +
                    " FROM " +
                    "     saleinfo;                         "


                )

                .then(result => {


                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** start  생산설비창 띄우기  
    // **** start  생산설비창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/insertfinalfinal', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()
                .input('bom', sql.NVarChar, req.body.bom)
                .input('customer', sql.NVarChar, req.body.customer)
                .input('modelname', sql.NVarChar, req.body.modelname)
                .input('itemname', sql.NVarChar, req.body.itemname)
                .input('lotno', sql.NVarChar, req.body.lotno)
                .input('productno', sql.NVarChar, req.body.productno)
                .input('member', sql.NVarChar, req.body.member)
                .input('count', sql.Float, req.body.count)

                .query(
                    " INSERT INTO alltest (bom, customer, modelname, itemname, lotno, productno, member, count)" +
                    " VALUES (@bom, @customer, @modelname, @itemname, @lotno, @productno, @member, @count);                    "

                )

                .then(result => {


                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** start  생산설비창 띄우기  
    // **** start  생산설비창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/updatefinalfinal', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()

                .input('id', sql.Int, req.body.id)
                .input('testdate', sql.NVarChar, req.body.testdate)
                .input('testcount', sql.Float, req.body.testcount)
                .input('okcount', sql.Float, req.body.okcount)
                .input('ngcount', sql.Float, req.body.ngcount)
                .input('ng1', sql.Float, req.body.ng1)
                .input('ng2', sql.Float, req.body.ng2)
                .input('ng3', sql.Float, req.body.ng3)
                .input('ng4', sql.Float, req.body.ng4)
                .input('ng5', sql.Float, req.body.ng5)
                .input('ng6', sql.Float, req.body.ng6)
                .input('ng7', sql.Float, req.body.ng7)
                .input('ng8', sql.Float, req.body.ng8)
                .input('ng9', sql.Float, req.body.ng9)
                .input('ng10', sql.Float, req.body.ng10)
                .input('ng11', sql.Float, req.body.ng11)
                .input('ng12', sql.Float, req.body.ng12)
                .input('ng13', sql.Float, req.body.ng13)
                .input('ng14', sql.Float, req.body.ng14)
                .input('ng15', sql.Float, req.body.ng15)
                .input('ng16', sql.Float, req.body.ng16)
                .input('ng17', sql.Float, req.body.ng17)

                .query(
                    " UPDATE alltest " +
                    " SET " +
                    "     testdate = @testdate, " +
                    "     testcount = @testcount, " +
                    "     okcount = @okcount, " +
                    "     ngcount = @ngcount, " +
                    "     ngpercent = @ngpercent, " +
                    "     ng1 = @ng1, " +
                    "     ng2 = @ng2," +
                    "     ng3 = @ng3," +
                    "     ng4 = @ng4," +
                    "     ng5 = @ng5," +
                    "     ng6 = @ng6," +
                    "     ng7 = @ng7," +
                    "     ng8 = @ng8," +
                    "     ng9 = @ng9," +
                    "     ng10 = @ng10," +
                    "     ng11 = @ng11," +
                    "     ng12 = @ng12," +
                    "     ng13 = @ng13," +
                    "     ng14 = @ng14," +
                    "     ng15 = @ng15," +
                    "     ng16 = @ng16," +
                    "     ng17 = @ng17" +
                    " where id =@id"


                )

                .then(result => {


                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** start  생산설비창 띄우기  
    // **** start  생산설비창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/updateproduction1', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()

                .input('mstatus', sql.Int, req.body.mstatus)


                .query(
                    " UPDATE orderlist " +
                    " SET " +
                    " orderstatus='생산중'   " +
                    " where mstatus =@mstatus "


                )

                .then(result => {


                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** start  생산설비창 띄우기  
    // **** start  생산설비창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/pur1', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()

                .query(
                    " select * from pur1"

                )

                .then(result => {


                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** start  생산설비창 띄우기  
    // **** start  생산설비창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/pur2', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()

                .query(
                    " select * from pur2"

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
    // **** start  생산설비창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/selectbomno', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()
                .input('bomno', sql.NVarChar, req.body.bomno)

                .query(
                    "select bomno from iteminfo where bomno=@bomno"

                )

                .then(result => {


                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** start  생산설비창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/updatestatusaccountinput', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()
                .input('orderid', sql.NVarChar, req.body.orderid)
                .input('status', sql.NVarChar, req.body.status)

                .query(
                    " update accountinput set status=@status where orderid=@orderid"

                )

                .then(result => {


                    res.json(result.recordset);
                    res.end();


                });
        });

    });
    // **** start  품목등록    
    // **** start  생산설비창 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/updatenum', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()
                .input('orderid', sql.NVarChar, req.body.orderid)
                .input('num', sql.Float, req.body.num)

                .query(
                    " update accountinput set num=@num where orderid=@orderid"

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
    // **** start  품목등록    
    sql.connect(config).then(pool => {
        app.post('/api/insertmr1', function (req, res) {

            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()
                //.input('변수',값 형식, 값)
                .input('codenumber', sql.NVarChar, req.body.codenumber)
                .input('a', sql.NVarChar, req.body.a)
                .input('b', sql.NVarChar, req.body.b)
                .input('c', sql.NVarChar, req.body.c)
                .input('d', sql.NVarChar, req.body.d)



                .query(
                    'insert into mr1(codenumber,a,b,c,d)' +
                    ' values(@codenumber,@a,@b,@c,@d)'
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
        app.post('/api/insertshipmentinspection', function (req, res) {

            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()
                //.input('변수',값 형식, 값)
                .input('bomno', sql.NVarChar, req.body.bomno)
                .input('modelname', sql.NVarChar, req.body.modelname)
                .input('itemname', sql.NVarChar, req.body.itemname)
                .input('customer', sql.NVarChar, req.body.customer)
                .input('part', sql.NVarChar, req.body.part)
                .input('spec', sql.Float, req.body.spec)
                .input('plus', sql.Float, req.body.plus)
                .input('minus', sql.Float, req.body.minus)




                .query(
                    'insert into shipmentinspection(bomno,modelname,itemname,customer,part,spec,plus,minus)' +
                    ' values(@bomno,@modelname,@itemname,@customer,@part,@spec,@plus,@minus)'
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
        app.post('/api/insertfilename', function (req, res) {

            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()
                //.input('변수',값 형식, 값)
                .input('filename', sql.NVarChar, req.body.filename)

                .query(
                    'insert into filesave(filename)' +
                    ' values(@filename)'
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
                .input('pcs', sql.NVarChar, req.body.pcs)
                .input('bucakcustomer', sql.NVarChar, req.body.bucakcustomer)
                .input('processname', sql.NVarChar, req.body.processname)
                .input('num', sql.Float, req.body.num)
                .input('part', sql.NVarChar, req.body.part)
                .input('etc', sql.NVarChar, req.body.etc)
                .input('shipmentdate', sql.NVarChar, req.body.shipmentdate)

                .query(
                    'insert into accountinput(num,accountdate,deliverydate,customer,itemcode,bomno,modelname,itemname,size,itemprice,quantity,price,salesorder,contentname,countsum,pricesum,itemcost,ponum,status,ad,pcs,bucakcustomer,processname,part,etc,shipmentdate)' +
                    ' values(@num,@accountdate,@deliverydate,@customer,@itemcode,@bomno,@modelname,@itemname,@size,@itemprice,@quantity,@price,@salesorder,@contentname,@countsum,@pricesum,@itemcost,@ponum,@status,@ad,@pcs,@bucakcustomer,@processname,@part,@etc,@shipmentdate)'
                )
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    sql.connect(config).then(pool => {
        app.post('/api/insertsaleinput', function (req, res) {

            // console.log("11", req)
            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()
                //.input('변수',값 형식, 값)

                .input('saledate', sql.NVarChar, req.body.saledate)
                .input('customer', sql.NVarChar, req.body.customer)
                .input('itemcode', sql.NVarChar, req.body.itemcode)
                .input('bomno', sql.NVarChar, req.body.bomno)
                .input('modelname', sql.NVarChar, req.body.modelname)
                .input('itemname', sql.NVarChar, req.body.itemname)
                .input('itemprice', sql.Float, req.body.itemprice)
                .input('quantity', sql.Float, req.body.quantity)
                .input('etc', sql.NVarChar, req.body.etc)

                .query(
                    'insert into saleinput(saledate,customer,itemcode,bomno,modelname,itemname,itemprice,quantity,etc)' +
                    ' values(@saledate,@customer,@itemcode,@bomno,@modelname,@itemname,@itemprice,@quantity,@etc)'
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
    // **** start   영업수주 네임건 등록
    sql.connect(config).then(pool => {
        app.post('/api/selectorderlistinformation', function (req, res) {

            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()
                .input('supplier', sql.NVarChar, req.body.supplier)


                .query(
                    "  WITH RankedSuppliers AS ( " +
                    "     SELECT " +
                    "         supplier, " +
                    "         ROW_NUMBER() OVER (ORDER BY supplier) AS SupplierRank " +
                    "     FROM  " +
                    "         ( " +
                    "             SELECT DISTINCT supplier FROM Materialinfoinformation " +
                    "         ) AS Suppliers " +
                    " ) " +
                    "  " +
                    " SELECT   " +
                    "     ol.itemname,   " +
                    "     ol.modelname,   " +
                    "     bm.materialname,    " +
                    "     bm.materialwidth,   " +
                    "     CEILING(SUM(ol.quantity * bm.onepid * 0.001 * 1.03)/bm.cavity) AS totalquantity1,   " +
                    "     CASE   " +
                    "         WHEN ROW_NUMBER() OVER (PARTITION BY bm.materialname ORDER BY bm.materialname) = 1   " +
                    "         THEN COALESCE((SELECT SUM(quantity) FROM materialinput WHERE materialname = bm.materialname AND materialwidth = bm.materialwidth), 0)  " +
                    "         ELSE 0  " +
                    "     END AS sumquantity,  " +
                    "     CASE  " +
                    "         WHEN EXISTS (  " +
                    "             SELECT 1  " +
                    "             FROM materialinput  " +
                    "             WHERE materialname = bm.materialname AND materialwidth > bm.materialwidth  " +
                    "         ) THEN 'Y'  " +
                    "         ELSE 'N'  " +
                    "     END AS has,  " +
                    "     FLOOR(COALESCE(mi.usewidth, 0) / bm.materialwidth) AS calculatedvalue,  " +
                    "     (CEILING(SUM(ol.quantity * bm.onepid * 0.001 * 1.03)) / (COALESCE(mi.usewidth, 0) / bm.materialwidth) * mi.length) AS calculated_column,  " +
                    "     CEILING(SUM(ol.quantity * bm.onepid * 0.001 * 1.03)/bm.cavity) AS soyo,  " +
                    "     FLOOR((COALESCE(mi.usewidth, 0) / bm.materialwidth)) AS cut,  " +
                    "     FLOOR((COALESCE(mi.usewidth, 0) / bm.materialwidth)) * mi.length AS test,  " +
                    "     ROUND(CEILING(SUM(ol.quantity * bm.onepid * 0.001 * 1.03)-COALESCE((SELECT SUM(quantity) FROM materialinput WHERE materialname = bm.materialname AND materialwidth = bm.materialwidth), 0)  ) / (FLOOR((COALESCE(mi.usewidth, 0) / bm.materialwidth)) * mi.length)/bm.cavity, 2) AS a,  " +
                    "     CEILING((SUM(ol.quantity * bm.onepid * 0.001 * 1.03)-COALESCE((SELECT SUM(quantity) FROM materialinput WHERE materialname = bm.materialname AND materialwidth = bm.materialwidth), 0)  ) / (FLOOR((COALESCE(mi.usewidth, 0) / bm.materialwidth)) * mi.length)/bm.cavity) AS roundedResult,   " +
                    "     mi.width,  " +
                    "     mi.length,  " +
                    "     mi.sqmprice,  " +
                    "     SUM(mi.rollprice) AS rollprice,  " +
                    "     mi.supplier,  " +
                    "     SUM(ol.quantity) AS quantity_sum,  " +
                    "     mi.codenumber," +
                    "     i.customer,  " +
                    "     mi.rollprice as a1,  " +
                    "     bm.bomno,  " +
                    "     ol.qrno," +
                    "     bm.etc,   " +
                    "     bm.cavity, " +
                    " CONCAT(left(CAST(SupplierRank AS VARCHAR(8)), 8), REPLACE(CONVERT(varchar, GETDATE(), 112), '-', '')) AS orderno " +
                    " FROM   " +
                    "     orderlist ol   " +
                    " JOIN  " +
                    "     bommanagement bm ON ol.bomno = bm.bomno  " +
                    " LEFT JOIN  " +
                    "     Materialinfoinformation mi ON bm.codenumber = mi.codenumber  " +
                    " LEFT JOIN  " +
                    "     iteminfo i ON i.bomno = bm.bomno  " +
                    " LEFT JOIN  " +
                    "     RankedSuppliers rs ON mi.supplier = rs.supplier" +
                    " WHERE   " +
                    "     ol.orderstatus = '생산확정'   " +
                    "    AND bm.codenumber IS NOT NULL  " +
                    "    AND bm.codenumber <> ''  " +
                    " GROUP BY   " +
                    "     ol.modelname, ol.itemname, bm.materialname, bm.materialwidth, mi.usewidth, mi.length, mi.width, mi.sqmprice, mi.supplier, mi.codenumber ,i.customer ,mi.rollprice ,ol.modelname ,bm.bomno ,ol.qrno,bm.etc ,bm.cavity, SupplierRank " +
                    " ORDER BY   " +
                    "     bm.materialname ASC;                     ")
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish
    // **** start   영업수주 네임건 등록
    sql.connect(config).then(pool => {
        app.post('/api/selectorderlistinformation2', function (req, res) {

            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()


                .query(
                    "SELECT  " +

                    "    bm.materialname,  " +
                    "    bm.materialwidth,     " +
                    "    CEILING(SUM(ol.quantity * bm.onepid * 0.001 * 1.03)) AS totalquantity1,  " +
                    "    COALESCE((SELECT SUM(quantity) FROM materialinput WHERE materialname = bm.materialname AND materialwidth = bm.materialwidth), 0) AS sum_quantity," +
                    "     CASE " +
                    "        WHEN EXISTS (" +
                    "            SELECT 1" +
                    "            FROM materialinput" +
                    "            WHERE materialname = bm.materialname AND materialwidth > bm.materialwidth" +
                    "        ) THEN 'Y'" +
                    "        ELSE 'N'" +
                    "    END AS has," +
                    "    FLOOR(COALESCE(mi.usewidth, 0) / bm.materialwidth) AS calculatedvalue,  " +
                    "    CEILING(  " +
                    "        (CEILING(SUM(ol.quantity * bm.onepid * 0.001 * 1.03)) - (  " +
                    "            SELECT COALESCE(SUM(quantity), 0)   " +
                    "            FROM materialinput   " +
                    "            WHERE materialname = bm.materialname  " +
                    "        )) / (COALESCE(mi.usewidth, 0) / bm.materialwidth) / mi.length  " +
                    "    ) AS calculated_column, " +
                    "FLOOR( " +
                    "    (CEILING(SUM(ol.quantity * bm.onepid * 0.001 * 1.03)) - ( " +
                    "        SELECT COALESCE(SUM(quantity), 0)    " +
                    "        FROM materialinput    " +
                    "        WHERE materialname = bm.materialname   " +
                    "    )) / (COALESCE(mi.usewidth, 0) / bm.materialwidth) / mi.length * 10 " +
                    ") / 10 AS calculated_column1, " +
                    "      MIN(ol.lotno) AS min_lotno,  " +
                    "      MAX(ol.lotno) AS max_lotno " +
                    " FROM  " +
                    "     orderlist ol  " +
                    " JOIN  " +
                    "     bommanagement bm ON ol.bomno = bm.bomno  " +
                    " LEFT JOIN  " +
                    "     Materialinfoinformation mi ON bm.materialname = mi.materialname  " +
                    " WHERE  " +
                    "     ol.orderstatus = '생산확정'  " +
                    " GROUP BY  " +
                    "     bm.materialname, bm.materialwidth, mi.usewidth, mi.length  " +
                    " ORDER BY  " +
                    "     bm.materialwidth ASC ;                  "
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
        app.post('/api/insertpurchaseorder', function (req, res) {

            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()
                //.input('변수',값 형식, 값)

                .input('orderdate', sql.NVarChar, req.body.orderdate)
                .input('itemname', sql.NVarChar, req.body.itemname)
                .input('codenumber', sql.NVarChar, req.body.codenumber)
                .input('width', sql.Float, req.body.width)
                .input('length', sql.Float, req.body.length)
                .input('quantity', sql.Float, req.body.quantity)
                .input('unitprice', sql.Float, req.body.unitprice)
                .input('supplyamount', sql.Float, req.body.supplyamount)
                .input('suppliername', sql.NVarChar, req.body.suppliername)
                .input('bomno', sql.NVarChar, req.body.bomno)
                .input('ordertype', sql.NVarChar, req.body.ordertype)
                .input('cutting', sql.NVarChar, req.body.cutting)
                .input('confirmed', sql.NVarChar, req.body.confirmed)
                .input('manufacterer', sql.NVarChar, req.body.manufacterer)
                .input('productid', sql.NVarChar, req.body.productid)
                .input('etc', sql.NVarChar, req.body.etc)
                .input('orderno', sql.NVarChar, req.body.orderno)
                .input('inputcode', sql.NVarChar, req.body.inputcode)
                .input('status', sql.NVarChar, req.body.status)


                .query(
                    'insert into purchaseorder(orderno,productid,orderdate,itemname,codenumber,width,length,quantity,unitprice,supplyamount,suppliername,bomno,ordertype,cutting,confirmed,manufacterer,etc,inputcode,status)' +
                    ' values(@orderno,@productid,@orderdate,@itemname,@codenumber,@width,@length,@quantity,@unitprice,@supplyamount,@suppliername,@bomno,@ordertype,@cutting,@confirmed,@manufacterer,@etc,@inputcode,@status)'
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
        app.post('/api/bucakcustomer', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()
                .query(
                    'SELECT * FROM bucakcustomer')
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish


    // **** start다시손 봐야할것   
    // sql.connect(config).then(pool => {
    //     app.post('/api/productorderlist', function (req, res) {
    //         res.header("Access-Control-Allow-Origin", "*");

    //         return pool.request()
    //             .query(
    //                 "SELECT   " +
    //                 "ol.itemname,  " +
    //                 "ol.customer,  " +
    //                 "ol.part,  " +
    //                 "bm.char,  " +
    //                 "MAX(ol.id) AS id,  " +
    //                 "MAX(ol.bomno) AS bomno,  " +
    //                 "MAX(ol.productdate) AS productdate,  " +
    //                 "MAX(ol.modelname) AS modelname,  " +
    //                 "MAX(ol.lotno) AS lotno,  " +
    //                 "ol.quantity,  " +
    //                 "MAX(ol.qrno) AS qrno,  " +
    //                 "MAX(ol.orderstatus) AS orderstatus  , " +
    //                 " CASE " +
    //                 "WHEN bm.onepid < 90 THEN 100 " +
    //                 "WHEN bm.onepid < 150 THEN 83 " +
    //                 "WHEN bm.onepid < 190 THEN 50 " +
    //                 "ELSE 33 " +
    //                 "END AS capa " +
    //                 "FROM   " +
    //                 "    orderlist ol   " +
    //                 "JOIN   " +
    //                 "    bommanagement bm ON ol.itemname = bm.itemname and ol.modelname = bm.model    " +
    //                 "WHERE   " +
    //                 "    ol.orderstatus = '생산확정'  and  ol.planstatus is null   " +
    //                 "GROUP BY   " +
    //                 "    ol.itemname,bm.char,ol.quantity ,bm.onepid ,ol.customer,ol.part ,ol.lotno  " +
    //                 "ORDER BY   " +
    //                 "   ol.lotno asc;               ")
    //             .then(result => {

    //                 res.json(result.recordset);
    //                 res.end();
    //             });
    //     });

    // });
    // **** start  

    sql.connect(config).then(pool => {
        app.post('/api/productorderlist', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");

            return pool.request()
                .query(
                    "    select * from planproduct where orderstatus='생산확정'        ")
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** start       
    // **** start  

    sql.connect(config).then(pool => {
        app.post('/api/updateorderstatus1', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");

            return pool.request()
                .input('id', sql.Int, req.body.id)

                .query(
                    "      update  " +
                    " planproduct " +
                    " set  " +
                    " orderstatus='생산계획확정' " +
                    " where id=@id  ")
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** start       
    sql.connect(config).then(pool => {
        app.post('/api/updateorderstatustrue', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");

            return pool.request()

                .input('id', sql.Int, req.body.id)
                .input('lotno', sql.NVarChar, req.body.lotno)

                .query(
                    "update orderlist set planstatus='true' where lotno=@lotno")
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** start       
    // **** start       
    sql.connect(config).then(pool => {
        app.post('/api/selectproduceplan', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");

            return pool.request()

                .input('id', sql.Int, req.body.id)
                .input('lotno', sql.NVarChar, req.body.lotno)

                .query(
                    "select " +
                    " plandate, " +
                    " bomno, " +
                    " customer, " +
                    " modelname, " +
                    " itemname, " +
                    " part, " +
                    " lotno, " +
                    " pono, " +
                    " bompart, " +
                    " materialstatus,orderno " +
                    " from " +
                    " produceplan " +
                    " group by " +
                    " plandate, " +
                    " bomno, " +
                    " customer, " +
                    " modelname, " +
                    " itemname, " +
                    " part, " +
                    " lotno, " +
                    " pono, " +
                    " bompart, " +
                    " materialstatus,orderno")
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** start       
    // **** start       
    sql.connect(config).then(pool => {
        app.post('/api/selectiteminfo', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");

            return pool.request()

                .input('bomno', sql.NVarChar, req.body.bomno)

                .query(
                    "select * from iteminfo where bomno=@bomno")
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
                    " customer,part, " +
                    " modelname, " +
                    " itemname, " +
                    " lotno, " +
                    " quantity, " +
                    " orderid,marchine,a,b,c,d,qrno,orderstatus " +
                    " from  " +
                    " orderlist where status='true' order by orderstatus,productdate,modelname,itemname,lotno asc ")
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish
    // **** start       
    sql.connect(config).then(pool => {
        app.post('/api/selectpurchasecount', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");

            return pool.request()
                .input('itemname', sql.NVarChar, req.body.itemname)

                .query(
                    "select " +
                    " modelname,itemname,sum(quantity)'sumquantity' " +
                    " from " +
                    " orderlist   where orderstatus='생산확정' and itemname=@itemname group by modelname,itemname")
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish
    // **** start       
    sql.connect(config).then(pool => {
        app.post('/api/productorderlist31', function (req, res) {
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
                    " orderlist where status='true' and orderstatus='생산확정' order by orderstatus,productdate,modelname,itemname,lotno asc ")
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish
    // **** start       
    sql.connect(config).then(pool => {
        app.post('/api/selectwon', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");

            return pool.request()
                .query(
                    "select * from won ")
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
                    "select " +
                    " codenumber,equipmentname,part,size,num " +
                    " from " +
                    " equipment where product='사용' and eqname='타발기-1' or eqname ='유압타발기'")
                .then(result => {
                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish
    // **** start       
    sql.connect(config).then(pool => {
        app.post('/api/equipmentnamesolt', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");

            return pool.request()
                .query(
                    "select " +
                    " codenumber,equipmentname,part,size,num " +
                    " from " +
                    " equipment where product='사용' and eqname='타발기-1' or eqname ='유압타발기'")
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
    // **** start       
    // **** start       
    sql.connect(config).then(pool => {
        app.post('/api/searchnum', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");

            return pool.request()
                .input('orderid', sql.NVarChar, req.body.orderid)
                .query("select num from accountinput where orderid=@orderid")
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** start       
    sql.connect(config).then(pool => {
        app.post('/api/selectmaterialnamelength', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");

            return pool.request()
                .input('materialname', sql.NVarChar, req.body.materialname)

                .query("select length from materialinfoinformation where materialname=@materialname")
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** start       
    sql.connect(config).then(pool => {
        app.post('/api/selectmaterialinfo', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");

            return pool.request()
                .input('materialname', sql.NVarChar, req.body.materialname)

                .query("select length from materialinfoinformation")
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
                .query(
                    " WITH LastCharCTE AS ( " +
                    "    SELECT " +
                    "        p.bomno, " +
                    "        ( " +
                    "            SELECT TOP(1) " +
                    "                char " +
                    "            FROM " +
                    "                bommanagement " +
                    "            WHERE " +
                    "                bomno = p.bomno " +
                    "            ORDER BY " +
                    "                num DESC " +
                    "        ) AS last_char " +
                    "    FROM " +
                    "        [Techon].[dbo].[produceplan] p " +
                    "    WHERE  " +
                    "        plandate = @plandate " +
                    ") " +
                    "SELECT   " +
                    "    p.id,   " +
                    "    p.plandate,   " +
                    "    p.equipmentname,   " +
                    "    p.bomno,   " +
                    "    p.customer,   " +
                    "    p.modelname,   " +
                    "    p.itemname,   " +
                    "    p.part,  " +
                    "    p.linepart,  " +
                    "    p.lotno,  " +
                    "    p.pono,  " +
                    "    p.accumulate,  " +
                    "    p.remaining,  " +
                    "    p.planone,  " +
                    "    p.siljokone,   " +
                    "    p.plantwo,  " +
                    "    p.siljoktwo,  " +
                    "    p.num, " +
                    "    p.capa,   " +
                    "    p.plantime,p.materialstatus,p.productstatus,p.people,  " +
                    "    CEILING(480 / (subquery.cv2 / NULLIF(mainquery.totalPono, 0))) AS ratio,  " +
                    "    CEILING(630 / (subquery.cv3 / NULLIF(mainquery.totalPono, 0))) AS ratio1, " +
                    "    lastcharcte.last_char AS lastchar, " +
                    "        CASE WHEN lastcharcte.last_char = p.part THEN '완제품' ELSE '반제품' END AS producttype, " +
                    "    p.bompart  " +
                    "FROM   " +
                    "    [Techon].[dbo].[produceplan] p  " +
                    "JOIN (   " +
                    "    SELECT   " +
                    "        pono   " +
                    "        AS totalPono   " +
                    "    FROM   " +
                    "        [Techon].[dbo].[produceplan] " +
                    "    GROUP BY  " +
                    "        pono  " +
                    ") mainquery ON p.pono = mainquery.totalPono   " +
                    "JOIN (   " +
                    "                         SELECT   " +
                    "                             bomno,  " +
                    "                             customer,  " +
                    "                             modelname,  " +
                    "                             itemname,  " +
                    "                             workpart,  " +
                    "                             working,  " +
                    "                             onepidding,  " +
                    "                             cavity,  " +
                    "                             '고속' AS additional_column,  " +
                    "                             cavity * 0.5 AS calculated_column, " +
                    "                             CASE  " +
                    "                                 WHEN onepidding < 90 THEN 100  " +
                    "                                 WHEN onepidding < 150 THEN 83  " +
                    "                                 WHEN onepidding < 190 THEN 50  " +
                    "                                 ELSE 33  " +
                    "                             END AS custom_condition_column,   " +
                    "                             custom_condition_column * 60 * 8 * cavity AS cv2,  " +
                    "                             custom_condition_column * 60 * 8 * cavity AS cv3  " +
                    "                         FROM  " +
                    "                             (  " +
                    "                                 SELECT  " +
                    "                                     iteminfo.bomno,  " +
                    "                                     iteminfo.customer,  " +
                    "                                     iteminfo.modelname,  " +
                    "                                     iteminfo.itemname,  " +
                    "                                     iteminfo.workpart,  " +
                    "                                     iteminfo.working,  " +
                    "                                     bommanagement.onepid AS onepidding,  " +
                    "                                     iteminfo.cavity,  " +
                    "                                     CASE  " +
                    "                                         WHEN bommanagement.onepid < 90 THEN 100  " +
                    "                                         WHEN bommanagement.onepid < 150 THEN 83  " +
                    "                                         WHEN bommanagement.onepid < 190 THEN 50  " +
                    "                                         ELSE 33  " +
                    "                                     END AS custom_condition_column  " +
                    "                                 FROM   " +
                    "                                     iteminfo  " +
                    "                                 JOIN bommanagement ON iteminfo.bomno = bommanagement.bomno  " +
                    "                                 GROUP BY  " +
                    "                                     iteminfo.bomno,  " +
                    "                                     iteminfo.customer,  " +
                    "                                     iteminfo.modelname,  " +
                    "                                     iteminfo.itemname,  " +
                    "                                     iteminfo.workpart,  " +
                    "                                     iteminfo.working,  " +
                    "                                     iteminfo.cavity,  " +
                    "                                     bommanagement.onepid  " +
                    "                             ) AS subquery_alias  " +
                    "                    " +
                    ") subquery ON p.bomno = subquery.bomno   " +
                    "LEFT JOIN LastCharCTE lastcharcte ON p.bomno = lastcharcte.bomno -- 마지막 char 값을 가져오기 " +
                    "WHERE  " +
                    "    plandate=@plandate " +
                    "GROUP BY  " +
                    "    p.id,  " +
                    "    p.plandate,  " +
                    "    p.equipmentname,  " +
                    "    p.bomno,  " +
                    "    p.customer, " +
                    "    p.modelname, " +
                    "    p.itemname, " +
                    "    p.part, " +
                    "    p.linepart, " +
                    "    p.lotno, " +
                    "    p.pono, " +
                    "    p.accumulate, " +
                    "    p.remaining, " +
                    "    p.planone, " +
                    "    p.siljokone, " +
                    "    p.plantwo, " +
                    "    p.siljoktwo, " +
                    "    p.num, " +
                    "    p.capa, " +
                    "    p.plantime,p.materialstatus,p.productstatus,p.people, " +
                    "    480 / (subquery.cv2 / NULLIF(mainquery.totalPono, 0)),  " +
                    "    630 / (subquery.cv3 / NULLIF(mainquery.totalPono, 0)), " +
                    "    lastcharcte.last_char,p.bompart,  " +
                    "        CASE WHEN lastcharcte.last_char = p.part THEN '완제품' ELSE '반제품' END; ")


                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    sql.connect(config).then(pool => {
        app.post('/api/plansearchAll1', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");

            return pool.request()
                .input('orderno', sql.NVarChar, req.body.orderno)

                .query(
                    " WITH LastCharCTE AS ( " +
                    "    SELECT " +
                    "        p.bomno, " +
                    "        ( " +
                    "            SELECT TOP(1) " +
                    "                char " +
                    "            FROM " +
                    "                bommanagement " +
                    "            WHERE " +
                    "                bomno = p.bomno " +
                    "            ORDER BY " +
                    "                num DESC " +
                    "        ) AS last_char " +
                    "    FROM " +
                    "        [Techon].[dbo].[produceplan] p " +
                    " where orderno=@orderno " +
                    ") " +
                    "SELECT   " +
                    "    p.id,   " +
                    "    p.plandate,   " +
                    "    p.equipmentname,   " +
                    "    p.bomno,   " +
                    "    p.customer,   " +
                    "    p.modelname,   " +
                    "    p.itemname,   " +
                    "    p.part,  " +
                    "    p.linepart,  " +
                    "    p.lotno,  " +
                    "    p.pono,  " +
                    "    p.accumulate,  " +
                    "    p.remaining,  " +
                    "    p.planone,  " +
                    "    p.siljokone,   " +
                    "    p.plantwo,  " +
                    "    p.siljoktwo,  " +
                    "    p.num, " +
                    "    p.capa,   " +
                    "    p.plantime,p.materialstatus,p.productstatus,p.people,  " +
                    "    CEILING(480 / (subquery.cv2 / NULLIF(mainquery.totalPono, 0))) AS ratio,  " +
                    "    CEILING(630 / (subquery.cv3 / NULLIF(mainquery.totalPono, 0))) AS ratio1, " +
                    "    lastcharcte.last_char AS lastchar, " +
                    "        CASE WHEN lastcharcte.last_char = p.part THEN '완제품' ELSE '반제품' END AS producttype, " +
                    "    p.bompart  " +
                    "FROM   " +
                    "    [Techon].[dbo].[produceplan] p  " +
                    "JOIN (   " +
                    "    SELECT   " +
                    "        pono   " +
                    "        AS totalPono   " +
                    "    FROM   " +
                    "        [Techon].[dbo].[produceplan] " +
                    "    GROUP BY  " +
                    "        pono  " +
                    ") mainquery ON p.pono = mainquery.totalPono   " +
                    "JOIN (   " +
                    "                         SELECT   " +
                    "                             bomno,  " +
                    "                             customer,  " +
                    "                             modelname,  " +
                    "                             itemname,  " +
                    "                             workpart,  " +
                    "                             working,  " +
                    "                             onepidding,  " +
                    "                             cavity,  " +
                    "                             '고속' AS additional_column,  " +
                    "                             cavity * 0.5 AS calculated_column, " +
                    "                             CASE  " +
                    "                                 WHEN onepidding < 90 THEN 100  " +
                    "                                 WHEN onepidding < 150 THEN 83  " +
                    "                                 WHEN onepidding < 190 THEN 50  " +
                    "                                 ELSE 33  " +
                    "                             END AS custom_condition_column,   " +
                    "                             custom_condition_column * 60 * 8 * cavity AS cv2,  " +
                    "                             custom_condition_column * 60 * 8 * cavity AS cv3  " +
                    "                         FROM  " +
                    "                             (  " +
                    "                                 SELECT  " +
                    "                                     iteminfo.bomno,  " +
                    "                                     iteminfo.customer,  " +
                    "                                     iteminfo.modelname,  " +
                    "                                     iteminfo.itemname,  " +
                    "                                     iteminfo.workpart,  " +
                    "                                     iteminfo.working,  " +
                    "                                     bommanagement.onepid AS onepidding,  " +
                    "                                     iteminfo.cavity,  " +
                    "                                     CASE  " +
                    "                                         WHEN bommanagement.onepid < 90 THEN 100  " +
                    "                                         WHEN bommanagement.onepid < 150 THEN 83  " +
                    "                                         WHEN bommanagement.onepid < 190 THEN 50  " +
                    "                                         ELSE 33  " +
                    "                                     END AS custom_condition_column  " +
                    "                                 FROM   " +
                    "                                     iteminfo  " +
                    "                                 JOIN bommanagement ON iteminfo.bomno = bommanagement.bomno  " +
                    "                                 GROUP BY  " +
                    "                                     iteminfo.bomno,  " +
                    "                                     iteminfo.customer,  " +
                    "                                     iteminfo.modelname,  " +
                    "                                     iteminfo.itemname,  " +
                    "                                     iteminfo.workpart,  " +
                    "                                     iteminfo.working,  " +
                    "                                     iteminfo.cavity,  " +
                    "                                     bommanagement.onepid  " +
                    "                             ) AS subquery_alias  " +
                    "                    " +
                    ") subquery ON p.bomno = subquery.bomno   " +
                    "LEFT JOIN LastCharCTE lastcharcte ON p.bomno = lastcharcte.bomno -- 마지막 char 값을 가져오기 " +
                    "WHERE  " +
                    "   orderno=@orderno  " +
                    "GROUP BY  " +
                    "    p.id,  " +
                    "    p.plandate,  " +
                    "    p.equipmentname,  " +
                    "    p.bomno,  " +
                    "    p.customer, " +
                    "    p.modelname, " +
                    "    p.itemname, " +
                    "    p.part, " +
                    "    p.linepart, " +
                    "    p.lotno, " +
                    "    p.pono, " +
                    "    p.accumulate, " +
                    "    p.remaining, " +
                    "    p.planone, " +
                    "    p.siljokone, " +
                    "    p.plantwo, " +
                    "    p.siljoktwo, " +
                    "    p.num, " +
                    "    p.capa, " +
                    "    p.plantime,p.materialstatus,p.productstatus,p.people, " +
                    "    480 / (subquery.cv2 / NULLIF(mainquery.totalPono, 0)),  " +
                    "    630 / (subquery.cv3 / NULLIF(mainquery.totalPono, 0)), " +
                    "    lastcharcte.last_char,p.bompart,  " +
                    "        CASE WHEN lastcharcte.last_char = p.part THEN '완제품' ELSE '반제품' END; ")


                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });



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
    sql.connect(config).then(pool => {
        app.post('/api/plansearch2', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()
                .input('plandate', sql.NVarChar, req.body.plandate)

                .query(
                    "select * from produceplan where plandate=@plandate")
                .then(result => {
                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish
    // **** finish
    sql.connect(config).then(pool => {
        app.post('/api/selectcategory', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()
                .input('materialname', sql.NVarChar, req.body.materialname)

                .query(
                    "SELECT " +
                    " C.CONTENTS" +
                    " FROM " +
                    " MATERIALINFOINFORMATION M" +
                    " JOIN categorycode C ON M.USAGECATEGORY = C.CATEGORYCODE" +
                    " WHERE " +
                    " M.MATERIALNAME = @materialname;")
                .then(result => {
                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish
    // **** finish
    sql.connect(config).then(pool => {
        app.post('/api/selectproductplan', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()
                .input('materialname', sql.NVarChar, req.body.materialname)

                .query(
                    "select" +
                    "  plandate," +
                    "  equipmentname," +
                    "  bomno," +
                    "  customer," +
                    "  modelname," +
                    "  itemname," +
                    "  part," +
                    "  lotno," +
                    "  materialstatus," +
                    "  productstatus," +
                    "  slitingstatus,orderno,pono,moldstatus" +
                    "  from" +
                    "  produceplan where materialstatus='자재출고대기' or materialstatus='자재출고완료' ")
                .then(result => {
                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish
    // **** finish
    sql.connect(config).then(pool => {
        app.post('/api/updateproduceplanwherematerialstatus', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()
                .input('orderno', sql.NVarChar, req.body.orderno)

                .query(
                    "update produceplan set materialstatus='자재출고완료' where orderno=@orderno and capa is not null")
                .then(result => {
                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish
    // **** finish
    sql.connect(config).then(pool => {
        app.post('/api/produceplanselectmaterialoutput', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()
                .input('orderid', sql.NVarChar, req.body.orderid)

                .query(
                    "select * from materialinput where input='원자재출고' and orderid=@orderid")
                .then(result => {
                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish
    // **** finish
    sql.connect(config).then(pool => {
        app.post('/api/updatematerialstatus', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()
                .input('orderno', sql.NVarChar, req.body.orderno)

                .query(
                    "update produceplan set moldstatus='금형리딩대기' where  orderno=@orderno")
                .then(result => {
                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish
    // **** finish
    sql.connect(config).then(pool => {
        app.post('/api/selectproductionpeople', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()
                .input('orderno', sql.NVarChar, req.body.orderno)

                .query(
                    "select * from productionpeople where team='생산' order by people asc")
                .then(result => {
                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish
    // **** finish
    sql.connect(config).then(pool => {
        app.post('/api/selectproductionpeople1', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()
                .input('orderno', sql.NVarChar, req.body.orderno)

                .query(
                    "select * from productionpeople where team='검사' order by people asc")
                .then(result => {
                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish
    // **** finish
    sql.connect(config).then(pool => {
        app.post('/api/updateproductionpeople', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()
                .input('people', sql.NVarChar, req.body.people)
                .input('position', sql.NVarChar, req.body.position)
                .input('id', sql.NVarChar, req.body.id)

                .query(
                    "update productionpeople set people=@people,position=@position where id=@id")
                .then(result => {
                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish
    // **** finish
    sql.connect(config).then(pool => {
        app.post('/api/deleteproductionpeople', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()
                .input('id', sql.NVarChar, req.body.id)

                .query(
                    "delete from productionpeople where id=@id")
                .then(result => {
                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish
    // **** finish
    sql.connect(config).then(pool => {
        app.post('/api/insertproductionpeople', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()
                .input('people', sql.NVarChar, req.body.people)
                .input('position', sql.NVarChar, req.body.position)
                .input('team', sql.NVarChar, req.body.team)

                .query(
                    "insert into productionpeople (people,position,team)" +
                    " values(@people,@position,@team)")
                .then(result => {
                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish
    // **** finish
    sql.connect(config).then(pool => {
        app.post('/api/insertwon', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()
                .input('startdate', sql.NVarChar, req.body.startdate)
                .input('finishdate', sql.NVarChar, req.body.finishdate)
                .input('currencycode', sql.NVarChar, req.body.currencycode)
                .input('currencyname', sql.NVarChar, req.body.currencyname)
                .input('currencyprice', sql.NVarChar, req.body.currencyprice)
                .query(
                    "insert into won (startdate,finishdate,currencycode,currencyname,currencyprice)" +
                    " values(@startdate,@finishdate,@currencycode,@currencyname,@currencyprice)")
                .then(result => {
                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish
    // **** finish
    sql.connect(config).then(pool => {
        app.post('/api/plansearch3', function (req, res) {
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
    // **** finish
    sql.connect(config).then(pool => {
        app.post('/api/searchorderno', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()
                .input('orderno', sql.NVarChar, req.body.orderno)

                .query(
                    "select * from produceplan where orderno=@orderno")
                .then(result => {
                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish
    sql.connect(config).then(pool => {
        app.post('/api/purchaseordernoinput', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");


            return pool.request()
                .input('suppliername', sql.NVarChar, req.body.suppliername)

                .query(
                    "SELECT  " +
                    "   orderdate, " +
                    " CAST(COUNT(*) AS  NVARCHAR(10)) + '건의 미입고 현황이 존재합니다' AS orderSummary " +
                    " FROM " +
                    "    purchaseorder where status is null and suppliername=@suppliername" +
                    " GROUP BY  " +
                    "     orderdate " +
                    " ORDER BY  " +
                    "     orderdate")
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
        app.post('/api/purchaseorderload', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");

            return pool.request()
                .query(
                    "WITH OrderedOrders AS (  " +
                    "     SELECT  " +
                    "         orderno, " +
                    "         orderdate,  " +
                    "         suppliername,  " +
                    "         COUNT(*) AS orderCount,  " +
                    "         SUM(supplyamount) AS totalSupplyAmount  " +
                    "     FROM  " +
                    "         purchaseorder  " +

                    "     GROUP BY  " +
                    "         orderdate, suppliername  ,orderno " +
                    " )   " +
                    " SELECT  " +
                    "     orderno,  " +
                    "     orderdate,  " +
                    "     suppliername,  " +
                    "     CAST(orderCount AS NVARCHAR(10)) + '건의 발주건이 있습니다' AS orderSummary,  " +
                    "     totalSupplyAmount  " +
                    " FROM  " +
                    "     OrderedOrders  " +
                    " ORDER BY  " +
                    "     suppliername, orderno;                       "
                ).then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish
    // **** start       
    sql.connect(config).then(pool => {
        app.post('/api/selectorderno', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");

            return pool.request()
                .input('suppliername', sql.NVarChar, req.body.suppliername)


                .query(
                    "select " +
                    "orderno " +
                    "from " +
                    "purchaseorder where suppliername=@suppliername     " +
                    "group by " +
                    "orderno                   ").then(result => {

                        res.json(result.recordset);
                        res.end();
                    });
        });

    });
    // **** finish
    // **** start       
    sql.connect(config).then(pool => {
        app.post('/api/selectordernopurchaseorder', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");

            return pool.request()
                .input('orderno', sql.NVarChar, req.body.orderno)
                .query(
                    "select " +
                    "* " +
                    "from " +
                    "purchaseorder where orderno=@orderno").then(result => {

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
                .input('qrno', sql.NVarChar, req.body.qrno)
                .input('lotdate', sql.NVarChar, req.body.lotdate)
                .input('inserttime', sql.NVarChar, req.body.inserttime)
                .input('customer', sql.NVarChar, req.body.customer)
                .input('part', sql.NVarChar, req.body.part)

                .query(
                    "insert into orderlist(inserttime,lotdate,qrno,modelname,itemname,lotno,marchine,quantity,productdate,status,contentname,bomno,orderid,materialstatus,a,b,c,d,orderstatus,customer,part)" +
                    " values(@inserttime,@lotdate,@qrno,@modelname,@itemname,@lotno,@marchine,@quantity,@productdate,@status,@contentname,@bomno,@orderid,@materialstatus,@a,@b,@c,@d,@orderstatus,@customer,@part)"
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
                .input('equipmentname', sql.NVarChar, req.body.equipmentname)
                .input('customer', sql.NVarChar, req.body.customer)
                .input('num', sql.Int, req.body.num)
                .input('capa', sql.Int, req.body.capa)
                .input('part', sql.NVarChar, req.body.part)
                .input('pono', sql.Float, req.body.pono)
                .input('plantime', sql.Float, req.body.plantime)
                .input('bompart', sql.NVarChar, req.body.bompart)
                .input('slitingstatus', sql.NVarChar, req.body.slitingstatus)
                .input('orderno', sql.NVarChar, req.body.orderno)
                .input('materialstatus', sql.NVarChar, req.body.materialstatus)
                .query(
                    'insert into produceplan(plandate,bomno,modelname,itemname,lotno,pono,equipmentname,num,customer,capa,part,plantime,bompart,slitingstatus,orderno,materialstatus)' +
                    ' values(@plandate,@bomno,@modelname,@itemname,@lotno,@pono,@equipmentname,@num,@customer,@capa,@part,@plantime,@bompart,@slitingstatus,@orderno,@materialstatus)'
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
        app.post('/api/polist', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");

            return pool.request()

                .query(
                    "SELECT " +
                    "    ai.deliverydate, " +
                    "    ai.customer, " +
                    "    ol.lotdate, " +
                    "    ol.bomno, " +
                    "    ol.lotno, " +
                    "    ol.modelname, " +
                    "    ol.itemname,ol.qrno, " +
                    "    ai.quantity AS accountinput_quantity, " +
                    "    ol.quantity AS orderlist_quantity, " +
                    "    COALESCE(ii_fast.quantity, 0) AS stock " +
                    "FROM " +
                    "    orderlist ol " +
                    "JOIN " +
                    "    accountinput ai ON ol.qrno = ai.orderid " +
                    "LEFT JOIN ( " +
                    "    SELECT " +
                    "        ii.itemname, " +
                    "        SUM(ii.quantity) AS quantity " +
                    "    FROM " +
                    "        iteminput ii " +
                    "    JOIN ( " +
                    "        SELECT " +
                    "            itemname, " +
                    "            MAX(CONCAT(productdate, ' ', producttime)) AS latest_datetime " +
                    "        FROM " +
                    "            iteminput " +
                    "        GROUP BY " +
                    "            itemname " +
                    "    ) latest ON ii.itemname = latest.itemname AND CONCAT(ii.productdate, ' ', ii.producttime) = latest.latest_datetime " +
                    "    GROUP BY " +
                    "        ii.itemname " +
                    ") ii_fast ON ol.itemname = ii_fast.itemname " +
                    "ORDER BY " +
                    "    ol.lotno ASC;                "
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
        app.post('/api/updateplan', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");

            return pool.request()
                .input('plantime', sql.Float, req.body.plantime)
                .input('id', sql.Int, req.body.id)
                .query(

                    'update produceplan set plantime=@plantime where id=@id'

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
                .input('orderno', sql.NVarChar, req.body.orderno)
                .query(

                    'insert into slitingplan(slitingdate,part,materialname,classification,materialwidth,m,roll,total,aftermaterialwidth,afterm,afterroll,aftertotal,finalmaterialwidth,finalm,finalroll,finaltotal,orderno)' +
                    ' values(@slitingdate,@part,@materialname,@classification,@materialwidth,@m,@roll,@total,@aftermaterialwidth,@afterm,@afterroll,@aftertotal,@finalmaterialwidth,@finalm,@finalroll,@finaltotal,@orderno)'


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
                    "  SELECT  " +
                    "    orderid,  " +
                    "    OL.productdate,  " +
                    "    OL.lotno,  " +
                    "    BOM.bomno,  " +
                    "    BOM.model,  " +
                    "    BOM.itemname,  " +
                    "    BOM.materialname,  " +
                    "    BOM.swidth,  " +
                    "    FORMAT(SUM(OL.quantity * BOM.mwidth / iteminfo.cavity / 1000 * 1.03), 'N0') AS soyo,  " +
                    "    FORMAT(COALESCE(SUM(MI.quantity), 0), 'N0') AS materialnum,  " +
                    "    FORMAT(  " +
                    "        CASE  " +
                    "            WHEN BOM.materialname = MI.materialname AND BOM.swidth = MI.materialwidth  " +
                    "            THEN SUM(OL.quantity * BOM.mwidth / iteminfo.cavity / 1000 * 1.03) - COALESCE(SUM(MI.quantity), 0)  " +
                    "            ELSE SUM(OL.quantity * BOM.mwidth / iteminfo.cavity / 1000 * 1.03)  " +
                    "        END,  " +
                    "        'N0'  " +
                    "    ) AS diff,  " +
                    "    CASE  " +
                    "        WHEN SUM(OL.quantity * BOM.mwidth / iteminfo.cavity / 1000 * 1.03) > COALESCE(SUM(MI.quantity), 0) THEN '부족'  " +
                    "        WHEN SUM(OL.quantity * BOM.mwidth / iteminfo.cavity / 1000 * 1.03) <= COALESCE(SUM(MI.quantity), 0) THEN '가능'  " +
                    "        ELSE NULL  " +
                    "    END AS condition  " +
                    "FROM   " +
                    "    bommanagement AS BOM  " +
                    "    INNER JOIN (  " +
                    "        SELECT   " +
                    "            orderid,  " +
                    "            productdate,  " +
                    "            lotno,  " +
                    "            itemname,   " +
                    "            SUM(CASE WHEN [status] = 'true' THEN [quantity] ELSE 0 END) AS quantity  " +
                    "        FROM  " +
                    "            orderlist   " +
                    "        GROUP BY  " +
                    "            lotno, itemname, productdate, orderid   " +
                    "    ) AS OL ON BOM.itemname = OL.itemname  " +
                    "    LEFT JOIN (  " +
                    "        SELECT  " +
                    "            materialname,  " +
                    "            materialwidth,  " +
                    "            SUM(quantity) AS quantity  " +
                    "        FROM  " +
                    "            materialinput  " +
                    "        GROUP BY  " +
                    "            materialname, materialwidth  " +
                    "    ) AS MI ON BOM.materialname = MI.materialname AND BOM.swidth = MI.materialwidth  " +
                    "    LEFT JOIN (" +
                    "        SELECT itemname, cavity " +
                    "        FROM iteminfo " +
                    "    ) AS iteminfo ON BOM.itemname = iteminfo.itemname " +
                    "WHERE BOM.status = 'true'  " +
                    "GROUP BY " +
                    "    orderid, OL.productdate, OL.lotno, BOM.bomno, BOM.model, BOM.itemname, BOM.materialname, BOM.swidth, iteminfo.cavity,MI.materialname,MI.materialwidth " +
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
                    "  SELECT " +
                    "    materialname, " +
                    "    materialwidth,lotno, " +
                    "    SUM( " +
                    "        CASE " +
                    "            WHEN input = '원자재출고' THEN -quantity " +
                    "            ELSE quantity " +
                    "        END " +
                    "    ) AS totalcount, " +
                    "        SUM(roll) AS totalroll " +
                    "FROM " +
                    "    materialinput " +
                    "WHERE " +
                    "    materialname = @materialname " +
                    "    AND materialwidth > @materialwidth " +
                    "GROUP BY " +
                    "    materialname, materialwidth,lotno order by materialwidth asc")
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish
    // **** start       
    sql.connect(config).then(pool => {
        app.post('/api/selectmaterialinput', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()

                .input('materialname', sql.NVarChar, req.body.materialname)
                .input('materialwidth', sql.Int, req.body.materialwidth)
                .input('lotno', sql.NVarChar, req.body.lotno)

                .query(
                    "SELECT  " +
                    " materialname, " +
                    " materialwidth, " +
                    " lotno, " +
                    " roll,quantity " +
                    " from " +
                    " materialinput " +
                    " where  " +
                    "  materialname = @materialname   " +
                    " AND materialwidth = @materialwidth " +
                    " AND lotno = @lotno " +
                    " order by materialwidth asc ")
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish
    // **** start       
    sql.connect(config).then(pool => {
        app.post('/api/searchingmaterialname', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()

                .input('materialname', sql.NVarChar, req.body.materialname)


                .query(
                    "SELECT * FROM materialinfoinformation WHERE materialname LIKE '%' + @materialname + '%' order by materialname,num asc")
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish
    // **** start       
    sql.connect(config).then(pool => {
        app.post('/api/searchingmaterialname1', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()

                .input('materialname', sql.NVarChar, req.body.materialname)


                .query(
                    "SELECT * FROM vetnammaterialinfo WHERE materialname LIKE '%' + @materialname + '%' order by materialname asc")
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish
    // **** start       
    sql.connect(config).then(pool => {
        app.post('/api/suppliername', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()

                .input('materialname', sql.NVarChar, '%' + req.body.materialname + '%')
                .query(
                    "SELECT supplier " +
                    "FROM materialinfoinformation  " +
                    "WHERE supplier LIKE @materialname  " +
                    "GROUP BY supplier  " +
                    "ORDER BY supplier ASC;"
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
        app.post('/api/searchbomno', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()

                .input('itemcode', sql.NVarChar, req.body.itemcode)


                .query(
                    "SELECT * FROM iteminfo WHERE itemcode LIKE '%' + @itemcode + '%' order by itemcode asc")
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish
    // **** start       
    sql.connect(config).then(pool => {
        app.post('/api/bomno', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()

                .query(
                    "SELECT * FROM iteminfo  order by itemcode asc")
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });


    });
    // **** finish
    // **** start       
    sql.connect(config).then(pool => {
        app.post('/api/selectbomnoaccountinput', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()
                .input('itemcode', sql.NVarChar, '%' + req.body.itemcode + '%')
                .input('bomno', sql.NVarChar, '%' + req.body.itemcode + '%')
                .input('modelname', sql.NVarChar, '%' + req.body.itemcode + '%')
                .input('itemname', sql.NVarChar, '%' + req.body.itemcode + '%')
                .input('customer', sql.NVarChar, '%' + req.body.itemcode + '%')
                .query(
                    "SELECT * " +
                    "FROM iteminfo " +
                    "WHERE " +
                    "itemcode LIKE @itemcode OR " +
                    "bomno LIKE @bomno OR " +
                    "modelname LIKE @modelname OR " +
                    "itemname LIKE @itemname OR " +
                    "customer LIKE @customer " +
                    "ORDER BY itemcode ASC"
                )
                .then(result => {
                    res.json(result.recordset);
                    res.end();
                })
                .catch(err => {
                    console.error('SQL error', err);
                    res.status(500).send('Server error');
                });
        });
    });
    // **** start       
    // **** start       
    sql.connect(config).then(pool => {
        app.post('/api/selectbommanagementsearch', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()
                .input('itemcode', sql.NVarChar, '%' + req.body.input + '%')
                .input('bomno', sql.NVarChar, '%' + req.body.input + '%')
                .input('modelname', sql.NVarChar, '%' + req.body.input + '%')
                .input('itemname', sql.NVarChar, '%' + req.body.input + '%')
                .input('customer', sql.NVarChar, '%' + req.body.input + '%')
                .query(
                    "SELECT * " +
                    "FROM iteminfo " +
                    "WHERE " +
                    "itemcode LIKE @itemcode OR " +
                    "bomno LIKE @bomno OR " +
                    "modelname LIKE @modelname OR " +
                    "itemname LIKE @itemname OR " +
                    "customer LIKE @customer " +
                    "ORDER BY itemcode ASC"
                )
                .then(result => {
                    res.json(result.recordset);
                    res.end();
                })
                .catch(err => {
                    console.error('SQL error', err);
                    res.status(500).send('Server error');
                });
        });
    });
    // **** start       
    sql.connect(config).then(pool => {
        app.post('/api/selecttoolcodesearch', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()
                .input('toolcode', sql.NVarChar, '%' + req.body.toolcode + '%')
                .query(
                    "SELECT * " +
                    "FROM sampleorder " +
                    "WHERE " +
                    "toolcode LIKE @toolcode ORDER BY TOOLCODE ASC "

                )
                .then(result => {
                    res.json(result.recordset);
                    res.end();
                })
                .catch(err => {
                    console.error('SQL error', err);
                    res.status(500).send('Server error');
                });
        });
    });
    // **** start       
    sql.connect(config).then(pool => {
        app.post('/api/selectcustomername', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()
                .input('customername', sql.NVarChar, '%' + req.body.customername + '%')

                .query(
                    "SELECT * " +
                    "FROM customerinformation " +
                    "WHERE " +
                    "customername LIKE @customername order by customername asc "

                )
                .then(result => {
                    res.json(result.recordset);
                    res.end();
                })
                .catch(err => {
                    console.error('SQL error', err);
                    res.status(500).send('Server error');
                });
        });
    });


    // **** finish
    // **** start       
    sql.connect(config).then(pool => {
        app.post('/api/selectbommaterial', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()
                .input('materialname', sql.NVarChar, '%' + req.body.materialname + '%')

                .query(
                    "SELECT * " +
                    "FROM materialinfoinformation2 " +
                    "WHERE " +
                    "materialname LIKE @materialname  " +

                    "ORDER BY materialname ASC"
                )
                .then(result => {
                    res.json(result.recordset);
                    res.end();
                })
                .catch(err => {
                    console.error('SQL error', err);
                    res.status(500).send('Server error');
                });
        });
    });


    // **** finish
    // **** start       
    sql.connect(config).then(pool => {
        app.post('/api/searchingcustomername', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()

                .input('customername', sql.NVarChar, req.body.customername)


                .query(
                    "SELECT * FROM customerinformation WHERE customername LIKE '%' + @customername + '%' order by customername asc")
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish
    // **** start       
    sql.connect(config).then(pool => {
        app.post('/api/searchbomnosampleorder', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()

                .input('bomno', sql.NVarChar, req.body.bomno)


                .query(
                    "SELECT * FROM iteminfo where part='샘플' and bomno LIKE '%@bomno%' order by bomno asc")
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish
    // **** start       
    sql.connect(config).then(pool => {
        app.post('/api/searchbomnosampleorder', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()

                .input('bomno', sql.NVarChar, req.body.bomno)


                .query(
                    "SELECT * FROM iteminfo where part='샘플' and bomno LIKE '%@bomno%' order by bomno asc")
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish
    // **** start       
    sql.connect(config).then(pool => {
        app.post('/api/selectcodenumber2', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()

                .input('codenumber', sql.NVarChar, req.body.codenumber)


                .query(
                    "SELECT * FROM materialinput WHERE codenumber=@codenumber and status is null and materialwidth>300 order by expirationdate asc ")
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish
    // **** start       
    sql.connect(config).then(pool => {
        app.post('/api/updateslt', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()

                .input('id', sql.Int, req.body.id)
                .input('status', sql.NVarChar, req.body.status)


                .query(
                    "update materialinput set status=@status where id=@id")
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish
    // **** start       
    sql.connect(config).then(pool => {
        app.post('/api/searchingbomno', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()

                .input('bomno', sql.NVarChar, req.body.bomno)


                .query(
                    "SELECT * FROM iteminfo WHERE bomno LIKE '%' + @bomno + '%' order by bomno asc")
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish
    // **** start       
    sql.connect(config).then(pool => {
        app.post('/api/searchingcustomer', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()

                .input('supplier', sql.NVarChar, req.body.supplier)


                .query(
                    " SELECT DISTINCT supplier " +
                    "  FROM materialinfoinformation " +
                    "  WHERE supplier LIKE '%' + @supplier + '%' " +
                    " ORDER BY supplier ASC;")
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
                .input('lotno', sql.NVarChar, req.body.lotno)
                .input('roll', sql.Float, req.body.roll)
                .input('total', sql.Float, req.body.total)
                .input('afterm', sql.Float, req.body.afterm)
                .input('afterlotno', sql.NVarChar, req.body.afterlotno)
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
                    'insert into slitingplan(slitingdate,part,materialname,lotno,classification,materialwidth,m,roll,total,afterlotno,afterm,aftermaterialwidth,afterroll,aftertotal,finalmaterialwidth,finalm,finalroll,finaltotal,orderno,trash)' +
                    ' values(@slitingdate,@part,@materialname,@lotno,@classification,@materialwidth,@m,@roll,@total,@afterlotno,@afterm,@aftermaterialwidth,@afterroll,@aftertotal,@finalmaterialwidth,@finalm,@finalroll,@finaltotal,@orderno,@trash)'
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
        app.post('/api/bommasssaveiteminfo', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()




                .input('insertdate', sql.NVarChar, req.body.insertdate)
                .input('updatedate', sql.NVarChar, req.body.updatedate)
                .input('bomno', sql.NVarChar, req.body.bomno)
                .input('customer', sql.NVarChar, req.body.customer)
                .input('modelname', sql.NVarChar, req.body.modelname)
                .input('itemname', sql.NVarChar, req.body.itemname)
                .input('pcs', sql.NVarChar, req.body.pcs)
                .input('cavity', sql.Float, req.body.cavity)
                .input('itemcode', sql.NVarChar, req.body.itemcode)
                .input('part', sql.NVarChar, req.body.part)
                .input('working', sql.NVarChar, req.body.working)
                .input('direction', sql.NVarChar, req.body.direction)
                .input('cost', sql.Float, req.body.cost)
                .input('ordercount', sql.Float, req.body.ordercount)
                .input('workpart', sql.NVarChar, req.body.workpart)
                .input('additionalnotes', sql.NVarChar, req.body.additionalnotes)
                .input('itemprice', sql.Float, req.body.itemprice)
                .input('type', sql.NVarChar, req.body.type)


                .query(
                    'insert into iteminfo(itemprice,updatedate, bomno, customer, modelname, itemname, pcs, cavity, itemcode, part, working, direction, cost, ordercount, additionalnotes,workpart,type)' +
                    ' values(@itemprice,@updatedate, @bomno, @customer, @modelname, @itemname, @pcs, @cavity, @itemcode, @part, @working, @direction, @cost, @ordercount, @additionalnotes,@workpart,@type)'
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
        app.post('/api/bommasssaveiteminfo1', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()




                .input('insertdate', sql.NVarChar, req.body.insertdate)
                .input('updatedate', sql.NVarChar, req.body.updatedate)
                .input('bomno', sql.NVarChar, req.body.bomno)
                .input('customer', sql.NVarChar, req.body.customer)
                .input('modelname', sql.NVarChar, req.body.modelname)
                .input('itemname', sql.NVarChar, req.body.itemname)
                .input('pcs', sql.NVarChar, req.body.pcs)
                .input('cavity', sql.Float, req.body.cavity)
                .input('itemcode', sql.NVarChar, req.body.itemcode)
                .input('part', sql.NVarChar, req.body.part)
                .input('working', sql.NVarChar, req.body.working)
                .input('direction', sql.NVarChar, req.body.direction)
                .input('cost', sql.Float, req.body.cost)
                .input('ordercount', sql.Float, req.body.ordercount)
                .input('workpart', sql.NVarChar, req.body.workpart)
                .input('additionalnotes', sql.NVarChar, req.body.additionalnotes)
                .input('itemprice', sql.Float, req.body.itemprice)
                .input('type', sql.NVarChar, req.body.type)


                .query(
                    'insert into vntiteminfo(itemprice,updatedate, bomno, customer, modelname, itemname, pcs, cavity, itemcode, part, working, direction, cost, ordercount, additionalnotes,workpart,type)' +
                    ' values(@itemprice,@updatedate, @bomno, @customer, @modelname, @itemname, @pcs, @cavity, @itemcode, @part, @working, @direction, @cost, @ordercount, @additionalnotes,@workpart,@type)'
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
        app.post('/api/bommasssavebommanagement', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()

                .input('savedate', sql.NVarChar, req.body.savedate)
                .input('main', sql.NVarChar, req.body.main)
                .input('bomno', sql.NVarChar, req.body.bomno)
                .input('model', sql.NVarChar, req.body.model)
                .input('itemname', sql.NVarChar, req.body.itemname)
                .input('materialname', sql.NVarChar, req.body.materialname)
                .input('status', sql.NVarChar, req.body.status)
                .input('char', sql.NVarChar, req.body.char)
                .input('etc', sql.NVarChar, req.body.etc)
                .input('materialwidth', sql.Float, req.body.materialwidth)
                .input('using', sql.NVarChar, req.body.using)
                .input('onepid', sql.Float, req.body.onepid)
                .input('twopid', sql.Float, req.body.twopid)
                .input('soyo', sql.Float, req.body.soyo)
                .input('ta', sql.Float, req.body.ta)
                .input('allta', sql.Float, req.body.allta)
                .input('talength', sql.Float, req.body.talength)
                .input('loss', sql.Float, req.body.loss)
                .input('cost', sql.Float, req.body.cost)
                .input('rlcut', sql.Float, req.body.rlcut)
                .input('rlproduct', sql.Float, req.body.rlproduct)
                .input('width', sql.Float, req.body.width)
                .input('length', sql.Float, req.body.length)
                .input('sqmprice', sql.Float, req.body.sqmprice)
                .input('rollprice', sql.Float, req.body.rollprice)
                .input('unit', sql.NVarChar, req.body.unit)
                .input('manufacterer', sql.NVarChar, req.body.manufacterer)
                .input('supplier', sql.NVarChar, req.body.supplier)
                .input('codenumber', sql.NVarChar, req.body.codenumber)
                .input('usewidth', sql.Float, req.body.usewidth)
                .input('num', sql.Float, req.body.num)
                .input('materialclassification', sql.NVarChar, req.body.materialclassification)
                .input('cavity', sql.NVarChar, req.body.cavity)
                .input('useable', sql.NVarChar, req.body.useable)
                .input('bomid', sql.NVarChar, req.body.bomid)
                .input('costloss', sql.Float, req.body.costloss)
                .input('chk1', sql.NVarChar, req.body.chk1)
                .input('chk2', sql.NVarChar, req.body.chk2)
                .input('chk3', sql.NVarChar, req.body.chk3)




                .query(
                    'insert into bommanagement(bomid,useable,materialclassification,num,usewidth,main,savedate, bomno, model, itemname, materialname, status, char, etc, materialwidth, using, onepid, twopid, soyo, ta, allta, talength, loss, cost, rlcut, rlproduct, width, length, sqmprice, rollprice, unit, manufacterer, supplier , codenumber,cavity,costloss,chk1,chk2,chk3)' +
                    ' values(@bomid,@useable,@materialclassification ,@num,@usewidth,@main,@savedate, @bomno, @model, @itemname, @materialname, @status, @char, @etc, @materialwidth, @using, @onepid, @twopid, @soyo, @ta, @allta, @talength, @loss, @cost, @rlcut, @rlproduct, @width, @length, @sqmprice, @rollprice, @unit, @manufacterer, @supplier ,@codenumber,@cavity,@costloss,@chk1,@chk2,@chk3)'
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
        app.post('/api/bommasssavebommanagement1', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()

                .input('savedate', sql.NVarChar, req.body.savedate)
                .input('main', sql.NVarChar, req.body.main)
                .input('bomno', sql.NVarChar, req.body.bomno)
                .input('model', sql.NVarChar, req.body.model)
                .input('itemname', sql.NVarChar, req.body.itemname)
                .input('materialname', sql.NVarChar, req.body.materialname)
                .input('status', sql.NVarChar, req.body.status)
                .input('char', sql.NVarChar, req.body.char)
                .input('etc', sql.NVarChar, req.body.etc)
                .input('materialwidth', sql.Float, req.body.materialwidth)
                .input('using', sql.NVarChar, req.body.using)
                .input('onepid', sql.Float, req.body.onepid)
                .input('twopid', sql.Float, req.body.twopid)
                .input('soyo', sql.Float, req.body.soyo)
                .input('ta', sql.Float, req.body.ta)
                .input('allta', sql.Float, req.body.allta)
                .input('talength', sql.Float, req.body.talength)
                .input('loss', sql.Float, req.body.loss)
                .input('cost', sql.Float, req.body.cost)
                .input('rlcut', sql.Float, req.body.rlcut)
                .input('rlproduct', sql.Float, req.body.rlproduct)
                .input('width', sql.Float, req.body.width)
                .input('length', sql.Float, req.body.length)
                .input('sqmprice', sql.Float, req.body.sqmprice)
                .input('rollprice', sql.Float, req.body.rollprice)
                .input('unit', sql.NVarChar, req.body.unit)
                .input('manufacterer', sql.NVarChar, req.body.manufacterer)
                .input('supplier', sql.NVarChar, req.body.supplier)
                .input('codenumber', sql.NVarChar, req.body.codenumber)
                .input('usewidth', sql.Float, req.body.usewidth)
                .input('num', sql.Float, req.body.num)
                .input('materialclassification', sql.NVarChar, req.body.materialclassification)
                .input('cavity', sql.NVarChar, req.body.cavity)
                .input('useable', sql.NVarChar, req.body.useable)
                .input('bomid', sql.NVarChar, req.body.bomid)
                .input('costloss', sql.Float, req.body.costloss)




                .query(
                    'insert into vntbommanagement(bomid,useable,materialclassification,num,usewidth,main,savedate, bomno, model, itemname, materialname, status, char, etc, materialwidth, using, onepid, twopid, soyo, ta, allta, talength, loss, cost, rlcut, rlproduct, width, length, sqmprice, rollprice, unit, manufacterer, supplier , codenumber,cavity,costloss)' +
                    ' values(@bomid,@useable,@materialclassification ,@num,@usewidth,@main,@savedate, @bomno, @model, @itemname, @materialname, @status, @char, @etc, @materialwidth, @using, @onepid, @twopid, @soyo, @ta, @allta, @talength, @loss, @cost, @rlcut, @rlproduct, @width, @length, @sqmprice, @rollprice, @unit, @manufacterer, @supplier ,@codenumber,@cavity,@costloss)'
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
        app.post('/api/bomsamplesavebommanagement', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()

                .input('savedate', sql.NVarChar, req.body.savedate)
                .input('main', sql.NVarChar, req.body.main)
                .input('bomno', sql.NVarChar, req.body.bomno)
                .input('model', sql.NVarChar, req.body.model)
                .input('itemname', sql.NVarChar, req.body.itemname)
                .input('materialname', sql.NVarChar, req.body.materialname)
                .input('status', sql.NVarChar, req.body.status)
                .input('char', sql.NVarChar, req.body.char)
                .input('etc', sql.NVarChar, req.body.etc)
                .input('materialwidth', sql.Float, req.body.materialwidth)
                .input('using', sql.NVarChar, req.body.using)
                .input('onepid', sql.Float, req.body.onepid)
                .input('twopid', sql.Float, req.body.twopid)
                .input('soyo', sql.Float, req.body.soyo)
                .input('ta', sql.Float, req.body.ta)
                .input('allta', sql.Float, req.body.allta)
                .input('talength', sql.Float, req.body.talength)
                .input('loss', sql.Float, req.body.loss)
                .input('cost', sql.Float, req.body.cost)
                .input('rlcut', sql.Float, req.body.rlcut)
                .input('rlproduct', sql.Float, req.body.rlproduct)
                .input('width', sql.Float, req.body.width)
                .input('length', sql.Float, req.body.length)
                .input('sqmprice', sql.Float, req.body.sqmprice)
                .input('rollprice', sql.Float, req.body.rollprice)
                .input('unit', sql.NVarChar, req.body.unit)
                .input('manufacterer', sql.NVarChar, req.body.manufacterer)
                .input('supplier', sql.NVarChar, req.body.supplier)
                .input('codenumber', sql.NVarChar, req.body.codenumber)
                .input('usewidth', sql.Float, req.body.usewidth)
                .input('num', sql.Float, req.body.num)
                .input('materialclassification', sql.NVarChar, req.body.materialclassification)
                .input('cavity', sql.NVarChar, req.body.cavity)
                .input('useable', sql.NVarChar, req.body.useable)
                .input('bomid', sql.NVarChar, req.body.bomid)




                .query(
                    'insert into bommanagementsample(bomid,useable,materialclassification,num,usewidth,main,savedate, bomno, model, itemname, materialname, status, char, etc, materialwidth, using, onepid, twopid, soyo, ta, allta, talength, loss, cost, rlcut, rlproduct, width, length, sqmprice, rollprice, unit, manufacterer, supplier , codenumber,cavity)' +
                    ' values(@bomid,@useable,@materialclassification ,@num,@usewidth,@main,@savedate, @bomno, @model, @itemname, @materialname, @status, @char, @etc, @materialwidth, @using, @onepid, @twopid, @soyo, @ta, @allta, @talength, @loss, @cost, @rlcut, @rlproduct, @width, @length, @sqmprice, @rollprice, @unit, @manufacterer, @supplier ,@codenumber,@cavity)'
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
        app.post('/api/bommasssavebommanagementsample', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()

                .input('savedate', sql.NVarChar, req.body.savedate)
                .input('main', sql.NVarChar, req.body.main)
                .input('bomno', sql.NVarChar, req.body.bomno)
                .input('model', sql.NVarChar, req.body.model)
                .input('itemname', sql.NVarChar, req.body.itemname)
                .input('materialname', sql.NVarChar, req.body.materialname)
                .input('status', sql.NVarChar, req.body.status)
                .input('char', sql.NVarChar, req.body.char)
                .input('etc', sql.NVarChar, req.body.etc)
                .input('materialwidth', sql.Float, req.body.materialwidth)
                .input('using', sql.NVarChar, req.body.using)
                .input('onepid', sql.Float, req.body.onepid)
                .input('twopid', sql.Float, req.body.twopid)
                .input('soyo', sql.Float, req.body.soyo)
                .input('ta', sql.Float, req.body.ta)
                .input('allta', sql.Float, req.body.allta)
                .input('talength', sql.Float, req.body.talength)
                .input('loss', sql.Float, req.body.loss)
                .input('cost', sql.Float, req.body.cost)
                .input('rlcut', sql.Float, req.body.rlcut)
                .input('rlproduct', sql.Float, req.body.rlproduct)
                .input('width', sql.Float, req.body.width)
                .input('length', sql.Float, req.body.length)
                .input('sqmprice', sql.Float, req.body.sqmprice)
                .input('rollprice', sql.Float, req.body.rollprice)
                .input('unit', sql.NVarChar, req.body.unit)
                .input('manufacterer', sql.NVarChar, req.body.manufacterer)
                .input('supplier', sql.NVarChar, req.body.supplier)
                .input('codenumber', sql.NVarChar, req.body.codenumber)
                .input('usewidth', sql.Float, req.body.usewidth)
                .input('num', sql.Float, req.body.num)
                .input('materialclassification', sql.NVarChar, req.body.materialclassification)
                .input('cavity', sql.NVarChar, req.body.cavity)
                .input('useable', sql.NVarChar, req.body.useable)
                .input('bomid', sql.NVarChar, req.body.bomid)




                .query(
                    'insert into bommanagementsample(bomid,useable,materialclassification,num,usewidth,main,savedate, bomno, model, itemname, materialname, status, char, etc, materialwidth, using, onepid, twopid, soyo, ta, allta, talength, loss, cost, rlcut, rlproduct, width, length, sqmprice, rollprice, unit, manufacterer, supplier , codenumber,cavity)' +
                    ' values(@bomid,@useable,@materialclassification ,@num,@usewidth,@main,@savedate, @bomno, @model, @itemname, @materialname, @status, @char, @etc, @materialwidth, @using, @onepid, @twopid, @soyo, @ta, @allta, @talength, @loss, @cost, @rlcut, @rlproduct, @width, @length, @sqmprice, @rollprice, @unit, @manufacterer, @supplier ,@codenumber,@cavity)'
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
        app.post('/api/bommassupdatebommanagement', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()
                .input('savedate', sql.NVarChar, req.body.savedate)
                .input('main', sql.NVarChar, req.body.main)
                .input('bomno', sql.NVarChar, req.body.bomno)
                .input('model', sql.NVarChar, req.body.model)
                .input('itemname', sql.NVarChar, req.body.itemname)
                .input('materialname', sql.NVarChar, req.body.materialname)
                .input('status', sql.NVarChar, req.body.status)
                .input('char', sql.NVarChar, req.body.char)
                .input('etc', sql.NVarChar, req.body.etc)
                .input('materialwidth', sql.Float, req.body.materialwidth)
                .input('using', sql.NVarChar, req.body.using)
                .input('onepid', sql.Float, req.body.onepid)
                .input('twopid', sql.Float, req.body.twopid)
                .input('soyo', sql.Float, req.body.soyo)
                .input('ta', sql.Float, req.body.ta)
                .input('allta', sql.Float, req.body.allta)
                .input('talength', sql.Float, req.body.talength)
                .input('loss', sql.Float, req.body.loss)
                .input('cost', sql.Float, req.body.cost)
                .input('rlcut', sql.Float, req.body.rlcut)
                .input('rlproduct', sql.Float, req.body.rlproduct)
                .input('width', sql.Float, req.body.width)
                .input('length', sql.Float, req.body.length)
                .input('sqmprice', sql.Float, req.body.sqmprice)
                .input('rollprice', sql.Float, req.body.rollprice)
                .input('unit', sql.NVarChar, req.body.unit)
                .input('manufacterer', sql.NVarChar, req.body.manufacterer)
                .input('supplier', sql.NVarChar, req.body.supplier)
                .input('codenumber', sql.NVarChar, req.body.codenumber)
                .input('id', sql.Int, req.body.id)



                .query(
                    "UPDATE bommanagement " +
                    " SET savedate = @savedate, " +
                    "     main = @main, " +
                    "     model = @model, " +
                    "     itemname = @itemname, " +
                    "     materialname = @materialname, " +
                    "     status = @status, " +
                    "     char = @char, " +
                    "     etc = @etc, " +
                    "     materialwidth = @materialwidth, " +
                    "     using = @using," +
                    "     onepid = @onepid," +
                    "     twopid = @twopid," +
                    "     soyo = @soyo," +
                    "     ta = @ta," +
                    "     allta = @allta," +
                    "     talength = @talength," +
                    "     loss = @loss," +
                    "     cost = @cost," +
                    "     rlcut = @rlcut," +
                    "     rlproduct = @rlproduct," +
                    "     width = @width," +
                    "     length = @length," +
                    "     sqmprice = @sqmprice," +
                    "     rollprice = @rollprice, " +
                    "     unit = @unit," +
                    "     manufacterer = @manufacterer, " +
                    "     supplier = @supplier, " +
                    "     codenumber = @codenumber " +
                    " WHERE id = @id; "

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

                    "WITH cte AS (  " +
                    "	SELECT  " +
                    "		a.ad,  " +
                    "		a.contentname,  " +
                    "		a.deliverydate,  " +
                    "		a.customer,   " +
                    "		a.modelname,  " +
                    "		a.itemname,  " +
                    "		a.quantity, " +
                    "		a.bomno,   " +
                    "		a.itemcode,  " +
                    "		a.orderid,a.part,  " +
                    "		SUM(ISNULL(i.quantity, 0)) AS total_quantity,  " +
                    "		ROW_NUMBER() OVER (PARTITION BY a.modelname, a.itemname ORDER BY a.deliverydate ASC) AS row_num   " +
                    "	FROM accountinput a  " +
                    "	LEFT JOIN iteminput i ON a.modelname = i.modelname AND a.itemname = i.itemname  " +
                    "	GROUP BY  " +
                    "		a.ad,  " +
                    "		a.contentname,  " +
                    "		a.modelname,  " +
                    "		a.itemname,  " +
                    "		a.quantity,  " +
                    "		a.deliverydate,  " +
                    "		a.customer,  " +
                    "		a.bomno,  " +
                    "		a.itemcode,  " +
                    "		a.orderid,a.part  " +
                    "), recursive_cte AS (  " +
                    "   SELECT  " +
                    "	   c.ad,  " +
                    "	   c.bomno,  " +
                    "	   c.contentname,  " +
                    "	   c.deliverydate,  " +
                    "	   c.customer,  " +
                    "	   c.modelname,  " +
                    "	   c.itemname,  " +
                    "	   c.quantity,  " +
                    "	   c.itemcode,  " +
                    "	   c.orderid,c.part,  " +
                    "	   c.total_quantity,  " +
                    "	   total_quantity - quantity AS difference,  " +
                    "	   row_num  " +
                    "   FROM cte c  " +
                    "   where row_num ='1' " +
                    "   UNION ALL   " +
                    " " +
                    "   SELECT   " +
                    "	   c.ad,   " +
                    "	   c.bomno,   " +
                    "	   c.contentname,   " +
                    "	   c.deliverydate,   " +
                    "	   c.customer,  " +
                    "	   c.modelname,   " +
                    "	   c.itemname,  " +
                    "	   c.quantity,  " +
                    "	   c.itemcode,  " +
                    "	   c.orderid,c.part,  " +
                    "	   c.total_quantity,  " +
                    "	   rc.difference - c.quantity AS difference,  " +
                    "	   c.row_num  " +
                    "   FROM cte c  " +
                    "   JOIN recursive_cte rc ON c.modelname = rc.modelname AND c.itemname = rc.itemname AND c.row_num = rc.row_num + 1 " +
                    "), RecursiveResult AS ( " +
                    "   SELECT " +
                    "	   rc.contentname, " +
                    "	   rc.bomno, " +
                    "	   rc.deliverydate, " +
                    "	   rc.customer, " +
                    "	   rc.modelname, " +
                    "	   rc.itemname, " +
                    "	   rc.itemcode, " +
                    "	   rc.orderid,rc.part, " +
                    "	   FORMAT(rc.quantity, '#,0') AS quantity, " +
                    "	   FORMAT(rc.difference, '#,0') AS difference, " +
                    "	   FORMAT(rc.total_quantity, '#,0') AS total_quantity, " +
                    "	   CASE WHEN (rc.difference) >= 0 THEN '가능' ELSE '부족' END AS possible, " +
                    "	   rc.ad, " +
                    "	   CASE WHEN EXISTS ( " +
                    "			   SELECT 1 " +
                    "			   FROM [Techon].[dbo].[orderlist] o " +
                    "			   WHERE o.bomno = rc.bomno AND o.qrno = rc.orderid " +
                    "	   ) THEN 'Y' ELSE 'N' END AS exists1, " +
                    "	   ISNULL(ol_total.total_quantity, 0) AS a " +
                    "   FROM recursive_cte rc " +
                    "   LEFT JOIN ( " +
                    "	   SELECT " +
                    "		   qrno, " +
                    "		   SUM(quantity) AS total_quantity " +
                    "	   FROM orderlist " +
                    "	   GROUP BY qrno " +
                    "   ) ol_total ON rc.orderid = ol_total.qrno " +
                    ") " +
                    " " +
                    "SELECT * FROM RecursiveResult;             ")
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish

    // // **** start      재고 조회 쿼리 
    // sql.connect(config).then(pool => {
    //     app.post('/api/materialstock', function (req, res) {
    //         res.header("Access-Control-Allow-Origin", "*");
    //         console.log("11", req)
    //         return pool.request()
    //             .query(
    //                 "select codenumber,materialname,width" +
    //                 ",  format(convert(int,Isnull(SUM(count),0)),'##,##0')'stock' " +

    //                 " From warehouse  GROUP BY  codenumber, materialname, width ")
    //             .then(result => {

    //                 res.json(result.recordset);
    //                 res.end();
    //             });
    //     });

    // });
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
    // **** start 영업진행 조회 쿼리 
    sql.connect(config).then(pool => {
        app.post('/api/selectpurchasestatusmodel', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");

            return pool.request()
                .query(
                    "WITH PriceChangeWithRowNumber AS ( " +
                    "    SELECT " +
                    "        bomno, " +
                    "        modelname, " +
                    "        itemname,  " +
                    "        customer, " +
                    "        savedate, " +
                    "        price, " +
                    "        ROW_NUMBER() OVER (PARTITION BY bomno ORDER BY savedate ASC) AS row_num_asc, " +
                    "        ROW_NUMBER() OVER (PARTITION BY bomno ORDER BY savedate DESC) AS row_num_desc " +
                    "    FROM " +
                    "        pricechange " +
                    "), " +
                    "BomCostSummary AS ( " +
                    "    SELECT " +
                    "        bomno, " +
                    "        model,  " +
                    "        itemname, " +
                    "        SUM(cost) AS total_cost " +
                    "    FROM " +
                    "        bommanagement " +
                    "    GROUP BY " +
                    "        bomno, model, itemname " +
                    ") " +
                    "SELECT " +
                    "    bm.bomno, " +
                    "    pc_first.customer, " +
                    "    COUNT(bm.bomno) AS bomnocount, " +
                    "    pc_first.price AS firstprice, " +
                    "    ROUND(bcs.total_cost / pc_first.price * 100, 1) AS 'firstpercent', " +
                    "    pc_last.price AS nowprice, " +
                    "    bcs.total_cost AS 'nowcost', " +
                    "    ROUND(bcs.total_cost / pc_last.price * 100, 1) AS 'nowpercent' " +
                    "FROM " +
                    "    bommanagement bm " +
                    "LEFT JOIN " +
                    "    PriceChangeWithRowNumber pc_first ON bm.bomno = pc_first.bomno AND pc_first.row_num_asc = 1 " +
                    "LEFT JOIN " +
                    "    PriceChangeWithRowNumber pc_last ON bm.bomno = pc_last.bomno AND pc_last.row_num_desc = 1 " +
                    "LEFT JOIN " +
                    "    BomCostSummary bcs ON bm.bomno = bcs.bomno " +
                    "GROUP BY " +
                    "    bm.bomno, bcs.total_cost, pc_first.price, pc_last.price ,pc_first.customer;")
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish
    // **** start 영업진행 조회 쿼리 
    sql.connect(config).then(pool => {
        app.post('/api/slitinginputdata', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");

            return pool.request()
                .input('orderno', sql.NVarChar, req.body.orderno)

                .query(
                    "select " +
                    "aftermaterialwidth, " +
                    "afterm, " +
                    "afterroll, " +
                    "aftertotal " +
                    "from " +
                    "slitingplan " +
                    "where " +
                    "orderno = @orderno")
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
        app.post('/api/updatebomstatus', function (req, res) {

            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()
                //.input('변수',값 형식, 값)
                .input('status', sql.NVarChar, req.body.status)
                .input('bomid', sql.NVarChar, req.body.bomid)



                .query(
                    'update bommanagement set status=@status where bomid=@bomid'
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
        app.post('/api/updatebomstatus1', function (req, res) {

            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()
                //.input('변수',값 형식, 값)
                .input('status', sql.NVarChar, req.body.status)
                .input('bomid', sql.NVarChar, req.body.bomid)



                .query(
                    'update vntbommanagement set status=@status where bomid=@bomid'
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
        app.post('/api/updatebomstatussample', function (req, res) {

            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()
                //.input('변수',값 형식, 값)
                .input('status', sql.NVarChar, req.body.status)
                .input('bomid', sql.NVarChar, req.body.bomid)



                .query(
                    'update bommanagementsample set status=@status where bomid=@bomid'
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
        app.post('/api/updatebomstatussample', function (req, res) {

            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()

                .input('status', sql.NVarChar, req.body.status)
                .input('bomid', sql.NVarChar, req.body.bomid)

                .query(
                    'update bommanagementsample set status=@status where bomid=@bomid'
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
        app.post('/api/updatebomstatussample', function (req, res) {

            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()
                //.input('변수',값 형식, 값)
                .input('status', sql.NVarChar, req.body.status)
                .input('bomid', sql.NVarChar, req.body.bomid)



                .query(
                    'update bommanagementsample set status=@status where bomid=@bomid'
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
        app.post('/api/updateaccountstatus', function (req, res) {


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
        app.post('/api/deleteaccountstatus', function (req, res) {


            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()

                .input('id', sql.Int, req.body.id)
                // .input('orderstatus', sql.NVarChar, req.body.orderstatus)


                .query(
                    'delete from  orderlist where id=@id'
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
        app.post('/api/updateiteminfoitemprice', function (req, res) {


            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()



                .input('bomno', sql.NVarChar, req.body.bomno)
                .input('class', sql.NVarChar, req.body.class)
                .input('itemprice', sql.Float, req.body.itemprice)


                .query(
                    'update iteminfo set itemprice=@itemprice,class=@class where bomno=@bomno'
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
        app.post('/api/updateiteminfoitemprice1', function (req, res) {


            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()



                .input('bomno', sql.NVarChar, req.body.bomno)
                .input('class', sql.NVarChar, req.body.class)
                .input('itemprice', sql.Float, req.body.itemprice)


                .query(
                    'update vntiteminfo set itemprice=@itemprice,class=@class where bomno=@bomno'
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
        app.post('/api/updateiteminformation', function (req, res) {


            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()



                .input('bomno', sql.NVarChar, req.body.bomno)
                .input('modelname', sql.NVarChar, req.body.modelname)
                .input('itemname', sql.NVarChar, req.body.itemname)
                .input('customer', sql.NVarChar, req.body.customer)
                .input('itemcode', sql.NVarChar, req.body.itemcode)
                .input('pcs', sql.Float, req.body.pcs)
                .input('cavity', sql.Int, req.body.cavity)
                .input('direction', sql.NVarChar, req.body.direction)
                .input('workpart', sql.NVarChar, req.body.workpart)
                .input('ordercount', sql.Float, req.body.ordercount)
                .input('additionalnotes', sql.NVarChar, req.body.additionalnotes)
                .input('working', sql.NVarChar, req.body.working)
                .input('type', sql.NVarChar, req.body.type)

                // 
                .query(
                    'update iteminfo set modelname=@modelname,itemname=@itemname,customer=@customer,itemcode=@itemcode,pcs=@pcs,cavity=@cavity,direction=@direction,workpart=@workpart,ordercount=@ordercount,additionalnotes=@additionalnotes,working=@working,type=@type where bomno=@bomno'
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
        app.post('/api/updateiteminformation1', function (req, res) {


            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()



                .input('bomno', sql.NVarChar, req.body.bomno)
                .input('modelname', sql.NVarChar, req.body.modelname)
                .input('itemname', sql.NVarChar, req.body.itemname)
                .input('customer', sql.NVarChar, req.body.customer)
                .input('itemcode', sql.NVarChar, req.body.itemcode)
                .input('pcs', sql.Float, req.body.pcs)
                .input('cavity', sql.Int, req.body.cavity)
                .input('direction', sql.NVarChar, req.body.direction)
                .input('workpart', sql.NVarChar, req.body.workpart)
                .input('ordercount', sql.Float, req.body.ordercount)
                .input('additionalnotes', sql.NVarChar, req.body.additionalnotes)
                .input('working', sql.NVarChar, req.body.working)
                .input('type', sql.NVarChar, req.body.type)

                // 
                .query(
                    'update vntiteminfo set modelname=@modelname,itemname=@itemname,customer=@customer,itemcode=@itemcode,pcs=@pcs,cavity=@cavity,direction=@direction,workpart=@workpart,ordercount=@ordercount,additionalnotes=@additionalnotes,working=@working,type=@type where bomno=@bomno'
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
        app.post('/api/updateeqdata', function (req, res) {


            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()
                //.input('변수',값 형식, 값)
                .input('id', sql.Int, req.body.id)
                .input('codenumber', sql.NVarChar, req.body.codenumber)
                .input('equipmentname', sql.NVarChar, req.body.equipmentname)
                .input('eqname', sql.NVarChar, req.body.eqname)
                .input('part', sql.NVarChar, req.body.part)
                .input('size', sql.NVarChar, req.body.size)
                .input('num', sql.NVarChar, req.body.num)
                .input('customer', sql.NVarChar, req.body.customer)
                .input('serialno', sql.NVarChar, req.body.serialno)
                .input('manudate', sql.NVarChar, req.body.manudate)
                .input('position', sql.NVarChar, req.body.position)


                .query(
                    'update equipment set codenumber=@codenumber,equipmentname=@equipmentname,eqname=@eqname,part=@part,size=@size,num=@num,serialno=@serialno,customer=@customer,position=@position,manudate=@manudate where id=@id'
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
    // sql.connect(config).then(pool => {
    //     app.post('/api/houseinsertdata', function (req, res) {
    //         res.header("Access-Control-Allow-Origin", "*");
    //         console.log('Received POST request at /api/houseinsertdata');

    //         return pool.request()
    //             .input('housecode', sql.NVarChar, req.body.housecode)
    //             .input('housename', sql.NVarChar, req.body.housename)
    //             .input('part', sql.NVarChar, req.body.part)
    //             .input('partname', sql.NVarChar, req.body.partname)
    //             .input('filedata', sql.VarBinary, req.body.filedata)
    //             .query(
    //                 'INSERT INTO house (housecode, housename, part, partname, filedata)' +
    //                 ' VALUES (@housecode, @housename, @part, @partname, @filedata)'
    //             )
    //             .then(result => {
    //                 res.json(result.recordset);
    //                 res.end();
    //             });
    //     });
    // });

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
    // **** start  창고삭제쿼리     
    sql.connect(config).then(pool => {
        app.post('/api/wondeletedata', function (req, res) {

            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()
                //.input('변수',값 형식, 값)
                .input('id', sql.Int, req.body.id)


                .query(
                    'delete from won where id=@id'
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
        app.post('/api/deleteeqdata', function (req, res) {

            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()
                //.input('변수',값 형식, 값)
                .input('id', sql.Int, req.body.id)


                .query(
                    'delete from equipment where id=@id'
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
                .input('bomno', sql.NVarChar, req.body.bomno)


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
                    "    WHERE [bomno] = @bomno " +
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

    // **** start  사원정보등록쿼리    
    sql.connect(config).then(pool => {
        app.post('/api/selectpricechange1', function (req, res) {

            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()


                .query(
                    "WITH PriceChangeCount AS ( " +
                    "     SELECT " +
                    "         bomno, " +
                    "         COUNT(*) AS change_count" +
                    "     FROM " +
                    "         pricechange " +
                    "     GROUP BY " +
                    "         bomno " +
                    " ) " +
                    " SELECT " +
                    "     ii.bomno," +
                    "     ii.modelname," +
                    "     ii.itemname," +
                    "     ii.customer," +
                    "     ii.updatedate," +
                    "     COALESCE(pcc.change_count, 0) AS pricechange" +
                    " FROM" +
                    "     iteminfo ii" +
                    " LEFT JOIN" +
                    "     PriceChangeCount pcc ON ii.bomno = pcc.bomno; "
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
        app.post('/api/wonupdatedata', function (req, res) {

            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()
                //.input('변수',값 형식, 값)
                .input('id', sql.Int, req.body.id)
                .input('startdate', sql.NVarChar, req.body.startdate)
                .input('finishdate', sql.NVarChar, req.body.finishdate)
                .input('currencycode', sql.NVarChar, req.body.currencycode)
                .input('currencyname', sql.NVarChar, req.body.currencyname)
                .input('currencyprice', sql.NVarChar, req.body.currencyprice)


                .query(
                    'update won set startdate=@startdate,finishdate=@finishdate,currencycode=@currencycode,currencyname=@currencyname,currencyprice=@currencyprice where id=@id'
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
                    " select   " +
                    " contentname,  " +
                    " bomno,  " +
                    " modelname,  " +
                    " itemname,  " +
                    " customer,  " +
                    " quantity,  " +
                    " itemcode,  " +
                    " quantity * itemprice AS totalprice,  " +
                    " itemprice,  " +
                    " price,  " +
                    " deliverydate,id,etc,shipmentdate  " +
                    " from  " +
                    " accountinput  " +
                    " where " +
                    " deliverydate between @start and @finish " +
                    " order by deliverydate asc"
                )
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    sql.connect(config).then(pool => {
        app.post('/api/selectaccountinput1', function (req, res) {

            res.header("Access-Control-Allow-Origin", "*");

            return pool.request()
                .input('start', sql.NVarChar, req.body.start)
                .input('finish', sql.NVarChar, req.body.finish)

                .query(
                    " select   " +
                    " contentname,  " +
                    " bomno,  " +
                    " modelname,  " +
                    " itemname,  " +
                    " customer,  " +
                    " quantity,  " +
                    " itemcode,  " +
                    " quantity * itemprice AS totalprice,  " +
                    " itemprice,  " +
                    " price,  " +
                    " deliverydate,id,etc,shipmentdate  " +
                    " from  " +
                    " accountinput  " +
                    " where " +
                    " deliverydate between @start and @finish " +
                    " order by deliverydate asc"
                )
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    sql.connect(config).then(pool => {
        app.post('/api/selectsalesinput', function (req, res) {

            res.header("Access-Control-Allow-Origin", "*");

            return pool.request()
                .input('start', sql.NVarChar, req.body.start)
                .input('finish', sql.NVarChar, req.body.finish)

                .query(
                    " select   " +
                    " bomno,  " +
                    " modelname,  " +
                    " itemname,  " +
                    " customer,  " +
                    " quantity,  " +
                    " itemcode,  " +
                    " quantity * itemprice AS totalprice,  " +
                    " itemprice,  " +
                    " saledate  " +
                    " from  " +
                    " saleinput  " +
                    " where " +
                    " saledate between @start and @finish " +
                    " order by saledate asc"
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
        app.post('/api/selectaccountinput', function (req, res) {

            res.header("Access-Control-Allow-Origin", "*");

            return pool.request()
                .input('start', sql.NVarChar, req.body.start)
                .input('finish', sql.NVarChar, req.body.finish)

                .query(
                    " select   " +
                    "   bomno,  " +
                    "   modelname,  " +
                    "   itemname,  " +
                    "   customer,  " +
                    "   quantity,  " +
                    "   itemcode,  " +
                    "   quantity * itemprice AS totalprice,  " +
                    "   itemprice,  " +
                    "   price,  " +
                    "   deliverydate,id,etc  " +
                    "   from  " +
                    "   accountinput " +


                    "   order by deliverydate asc  "

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
        app.post('/api/aaaa', function (req, res) {

            res.header("Access-Control-Allow-Origin", "*");

            return pool.request()
                // .input('start', sql.NVarChar, req.body.start)
                // .input('finish', sql.NVarChar, req.body.finish)

                .query(
                    "SELECT * FROM aaaa "
                )
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish
    // **** start material combobox group 쿼리      
    app.post('/api/deletedata', function (req, res) {
        res.header("Access-Control-Allow-Origin", "*");
        var ids = req.body.ids; // 클라이언트로부터 받은 ID 배열

        // 각 ID에 대해 삭제 쿼리를 실행합니다.
        Promise.all(ids.map(id => {
            return pool.request()
                .input('id', sql.Int, id)
                .query("DELETE FROM aaaa WHERE id=@id");
        }))
            .then(results => {
                // 모든 삭제 작업이 완료되면 결과를 클라이언트로 응답합니다.
                res.json(results.map(result => result.recordset));
            })
            .catch(err => {
                res.status(500).send(err.message);
            });   // 오류가 발생한 경우 오류 메시지를 클라이언트에게 보냅니다.

    });

    // **** finish
    // **** start material combobox group 쿼리      
    app.post('/api/deleteaccount', function (req, res) {
        res.header("Access-Control-Allow-Origin", "*");

        var ids = req.body.ids; // 클라이언트로부터 받은 ID 배열

        // 각 ID에 대해 삭제 쿼리를 실행합니다.
        Promise.all(ids.map(id => {
            return pool.request()
                .input('id', sql.Int, id)
                .query("DELETE FROM accountinput WHERE id=@id");
        }))
            .then(results => {
                // 모든 삭제 작업이 완료되면 결과를 클라이언트로 응답합니다.
                res.json(results.map(result => result.recordset));
            })
            .catch(err => {
                // 오류가 발생한 경우 오류 메시지를 클라이언트에게 보냅니다.
                res.status(500).send(err.message);
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
        app.post('/api/selectslitingplantest', function (req, res) {

            res.header("Access-Control-Allow-Origin", "*");

            return pool.request()
                // .input('itemname', sql.NVarChar, req.body.itemname)
                // .input('materialwidth', sql.Int, req.body.materialwidth)

                .query(
                    "select " +
                    " * " +
                    " from " +
                    " sliting "
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
                    " select * from " +

                    " iteminfo"
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
        app.post('/api/accountshipment', function (req, res) {

            res.header("Access-Control-Allow-Origin", "*");

            return pool.request()


                .query(
                    " select * from " +

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
        app.post('/api/accountshipment1', function (req, res) {

            res.header("Access-Control-Allow-Origin", "*");

            return pool.request()


                .query(
                    " SELECT " +
                    "     customer," +
                    "     itemcode," +
                    "     bomno," +
                    "     modelname," +
                    "     itemname" +
                    "   " +
                    " FROM" +
                    "     accountinput" +
                    " group by" +
                    " customer," +
                    "     itemcode," +
                    "     bomno," +
                    "     modelname," +
                    "     itemname                "
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
        app.post('/api/selectaccountiteminfo', function (req, res) {

            res.header("Access-Control-Allow-Origin", "*");

            return pool.request()


                .query(
                    "SELECT " +
                    "     id, " +
                    "     customer," +
                    "     modelname," +
                    "     itemname," +
                    "     itemcode," +
                    "     pcs," +
                    "     cavity," +
                    "     direction," +
                    "     workpart," +
                    "     type," +
                    "     processname," +
                    "     bucakcustomer" +
                    " FROM" +
                    "     iteminfo order by customer asc;                             "
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
        app.post('/api/updateaccountiteminfo', function (req, res) {

            res.header("Access-Control-Allow-Origin", "*");

            return pool.request()
                .input('id', sql.NVarChar, req.body.id)
                .input('processname', sql.NVarChar, req.body.processname)
                .input('bucakcustomer', sql.NVarChar, req.body.bucakcustomer)

                .query(
                    "update iteminfo set processname=@processname,bucakcustomer=@bucakcustomer where id=@id")
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish
    // **** start itemname,materialwidth변수로  chk확인 쿼리      
    sql.connect(config).then(pool => {
        app.post('/api/selectprocessname', function (req, res) {

            res.header("Access-Control-Allow-Origin", "*");

            return pool.request()
                // .input('id', sql.NVarChar, req.body.id)
                // .input('processname', sql.NVarChar, req.body.processname)
                // .input('bucakcustomer', sql.NVarChar, req.body.bucakcustomer)

                .query(
                    "select * from processname")
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** start itemname,materialwidth변수로  chk확인 쿼리      
    sql.connect(config).then(pool => {
        app.post('/api/selectbucakcustomer', function (req, res) {

            res.header("Access-Control-Allow-Origin", "*");

            return pool.request()
                // .input('id', sql.NVarChar, req.body.id)
                // .input('processname', sql.NVarChar, req.body.processname)
                // .input('bucakcustomer', sql.NVarChar, req.body.bucakcustomer)

                .query(
                    "select * from bucakcustomer")
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish
    // **** start itemname,materialwidth변수로  chk확인 쿼리      
    sql.connect(config).then(pool => {
        app.post('/api/shipmentorderplan', function (req, res) {

            res.header("Access-Control-Allow-Origin", "*");

            return pool.request()
                .input('year', sql.NVarChar, req.body.year)
                .input('month', sql.NVarChar, req.body.month)
                .input('bomno', sql.NVarChar, req.body.bomno)


                .query(
                    " select" +
                    " deliverydate," +
                    " bomno," +
                    " sum(quantity) as quantity" +
                    " from" +
                    " accountinput" +
                    " WHERE YEAR(deliverydate) = @year AND MONTH(deliverydate) = @month AND bomno = @bomno" +
                    " group by" +
                    " deliverydate," +
                    " bomno " +
                    " order by deliverydate asc               "
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
        app.post('/api/selectaccountplan', function (req, res) {

            res.header("Access-Control-Allow-Origin", "*");

            return pool.request()
                .input('bomno', sql.NVarChar, req.body.bomno)
                .input('year', sql.NVarChar, req.body.year)
                .input('month', sql.NVarChar, req.body.month)


                .query(
                    " SELECT " +
                    " plandate," +
                    " bomno," +
                    " modelname," +
                    " itemname," +
                    " SUM(quantity) AS quantity" +
                    " FROM" +
                    " accountplan " +
                    " WHERE YEAR(plandate) = @year AND MONTH(plandate) = @month AND bomno = @bomno" +
                    " GROUP BY " +
                    " plandate, " +
                    " bomno, " +
                    " modelname, " +
                    " itemname"
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
        app.post('/api/selectsaleinput', function (req, res) {

            res.header("Access-Control-Allow-Origin", "*");

            return pool.request()
                .input('bomno', sql.NVarChar, req.body.bomno)
                .input('year', sql.NVarChar, req.body.year)
                .input('month', sql.NVarChar, req.body.month)


                .query(
                    " SELECT " +
                    " saledate," +
                    " bomno," +
                    " modelname," +
                    " itemname," +
                    " SUM(quantity) AS quantity" +
                    " FROM" +
                    " saleinput " +
                    " WHERE YEAR(saledate) = @year AND MONTH(saledate) = @month AND bomno = @bomno" +
                    " GROUP BY " +
                    " saledate, " +
                    " bomno, " +
                    " modelname, " +
                    " itemname"
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
        app.post('/api/shipmentinput', function (req, res) {

            res.header("Access-Control-Allow-Origin", "*");

            return pool.request()


                .query(
                    " SELECT " +
                    "     customer, " +
                    "     bomno, " +
                    "     modelname, " +
                    "     itemname, " +
                    "     itemprice,  " +
                    "     prevrevcount, " +
                    "     prevrevprice/1000000.0'prevrevprice', " +
                    "     nowrevcount, " +
                    "     nowrevprice/1000000.0'nowrevprice', " +
                    "     rev1count, " +
                    "     rev1price, " +
                    "     CASE WHEN rev1count = 0 THEN 0 ELSE nowrevcount / rev1count * 100 END AS rev1countratio, " +
                    "     rev2count, " +
                    "     rev2price, " +
                    "     CASE WHEN rev2count = 0 THEN 0 ELSE nowrevcount / rev2count * 100 END AS rev2countratio, " +
                    "     rev3count, " +
                    "     rev3price, " +
                    "     CASE WHEN rev3count = 0 THEN 0 ELSE nowrevcount / rev3count * 100 END AS rev3countratio, " +
                    "     rev4count, " +
                    "     rev4price, " +
                    "     CASE WHEN rev4count = 0 THEN 0 ELSE nowrevcount / rev4count * 100 END AS rev4countratio, " +
                    "     rev5count, " +
                    "     rev5price, " +
                    "     CASE WHEN rev5count = 0 THEN 0 ELSE nowrevcount / rev5count * 100 END AS rev5countratio " +
                    " FROM ( " +
                    "     SELECT " +
                    "         customer, " +
                    "         bomno, " +
                    "         modelname, " +
                    "         itemname, " +
                    "         itemprice, " +
                    "         SUM(CASE WHEN CONVERT(DATE, month, 23) BETWEEN '2023-11-01' AND '2023-11-30' THEN revcount ELSE 0 END) AS prevrevcount, " +
                    "         SUM(CASE WHEN CONVERT(DATE, month, 23) BETWEEN '2023-11-01' AND '2023-11-30' THEN revprice ELSE 0 END) AS prevrevprice, " +
                    "         SUM(CASE WHEN CONVERT(DATE, month, 23) BETWEEN '2023-12-01' AND '2023-12-31' THEN revcount ELSE 0 END) AS nowrevcount, " +
                    "         SUM(CASE WHEN CONVERT(DATE, month, 23) BETWEEN '2023-12-01' AND '2023-12-31' THEN revprice ELSE 0 END) AS nowrevprice, " +
                    "         SUM(CASE WHEN CONVERT(DATE, month, 23) BETWEEN '2023-12-01' AND '2023-12-31' AND revnum = 231201 THEN revcount  ELSE 0 END) AS rev1count, " +
                    "         SUM(CASE WHEN CONVERT(DATE, month, 23) BETWEEN '2023-12-01' AND '2023-12-31' AND revnum = 231201 THEN revprice / 1000000.0 ELSE 0 END) AS rev1price, " +
                    "         SUM(CASE WHEN CONVERT(DATE, month, 23) BETWEEN '2023-12-01' AND '2023-12-31' AND revnum = 231202 THEN revcount ELSE 0 END) AS rev2count, " +
                    "         SUM(CASE WHEN CONVERT(DATE, month, 23) BETWEEN '2023-12-01' AND '2023-12-31' AND revnum = 231202 THEN revprice / 1000000.0 ELSE 0 END) AS rev2price, " +
                    "         SUM(CASE WHEN CONVERT(DATE, month, 23) BETWEEN '2023-12-01' AND '2023-12-31' AND revnum = 231203 THEN revcount ELSE 0 END) AS rev3count, " +
                    "         SUM(CASE WHEN CONVERT(DATE, month, 23) BETWEEN '2023-12-01' AND '2023-12-31' AND revnum = 231203 THEN revprice / 1000000.0 ELSE 0 END) AS rev3price, " +
                    "         SUM(CASE WHEN CONVERT(DATE, month, 23) BETWEEN '2023-12-01' AND '2023-12-31' AND revnum = 231204 THEN revcount ELSE 0 END) AS rev4count, " +
                    "         SUM(CASE WHEN CONVERT(DATE, month, 23) BETWEEN '2023-12-01' AND '2023-12-31' AND revnum = 231204 THEN revprice / 1000000.0 ELSE 0 END) AS rev4price, " +
                    "         SUM(CASE WHEN CONVERT(DATE, month, 23) BETWEEN '2023-12-01' AND '2023-12-31' AND revnum = 231205 THEN revcount ELSE 0 END) AS rev5count, " +
                    "         SUM(CASE WHEN CONVERT(DATE, month, 23) BETWEEN '2023-12-01' AND '2023-12-31' AND revnum = 231205 THEN revprice / 1000000.0 ELSE 0 END) AS rev5price " +
                    "     FROM shipmentinput " +
                    "     GROUP BY itemname, customer, bomno, modelname, itemprice " +
                    " ) AS subquery "

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
        app.post('/api/shipmentinput1', function (req, res) {

            res.header("Access-Control-Allow-Origin", "*");

            return pool.request()


                .query(
                    "SELECT " +
                    "     customer, " +
                    "     bomno, " +
                    "     modelname, " +
                    "     itemname, " +
                    "     itemprice, " +
                    "     prevrevcount, " +
                    "     prevrevprice/1000000.0'prevrevprice', " +
                    "     nowrevcount, " +
                    "     nowrevprice/1000000.0'nowrevprice', " +
                    "     rev1count,   " +
                    "     rev1price,  " +
                    "     rev2count,  " +
                    "     rev2price,  " +
                    "     rev3count,  " +
                    "     rev3price,  " +
                    "     rev4count,  " +
                    "     rev4price  " +
                    " FROM (  " +
                    "     SELECT " +
                    "         customer, " +
                    "         bomno, " +
                    "         modelname, " +
                    "         itemname, " +
                    "         itemprice, " +
                    "         SUM(CASE WHEN CONVERT(DATE, month, 23) BETWEEN '2023-11-01' AND '2023-11-30' THEN revcount ELSE 0 END) AS prevrevcount, " +
                    "         SUM(CASE WHEN CONVERT(DATE, month, 23) BETWEEN '2023-11-01' AND '2023-11-30' THEN revprice ELSE 0 END) AS prevrevprice, " +
                    "         SUM(CASE WHEN CONVERT(DATE, month, 23) BETWEEN '2023-12-01' AND '2023-12-31' THEN revcount ELSE 0 END) AS nowrevcount, " +
                    "         SUM(CASE WHEN CONVERT(DATE, month, 23) BETWEEN '2023-12-01' AND '2023-12-31' THEN revprice ELSE 0 END) AS nowrevprice, " +
                    "         SUM(CASE WHEN CONVERT(DATE, month, 23) BETWEEN '2023-12-01' AND '2023-12-31' AND revnum = 231201 THEN revcount  ELSE 0 END) AS rev1count, " +
                    "         SUM(CASE WHEN CONVERT(DATE, month, 23) BETWEEN '2023-12-01' AND '2023-12-31' AND revnum = 231201 THEN revprice / 1000000.0 ELSE 0 END) AS rev1price, " +
                    "         SUM(CASE WHEN CONVERT(DATE, month, 23) BETWEEN '2023-12-01' AND '2023-12-31' AND revnum = 240101 THEN revcount ELSE 0 END) AS rev2count, " +
                    "         SUM(CASE WHEN CONVERT(DATE, month, 23) BETWEEN '2023-12-01' AND '2023-12-31' AND revnum = 240101 THEN revprice / 1000000.0 ELSE 0 END) AS rev2price, " +
                    "         SUM(CASE WHEN CONVERT(DATE, month, 23) BETWEEN '2023-12-01' AND '2023-12-31' AND revnum = 240201 THEN revcount ELSE 0 END) AS rev3count, " +
                    "         SUM(CASE WHEN CONVERT(DATE, month, 23) BETWEEN '2023-12-01' AND '2023-12-31' AND revnum = 240201 THEN revprice / 1000000.0 ELSE 0 END) AS rev3price, " +
                    "         SUM(CASE WHEN CONVERT(DATE, month, 23) BETWEEN '2023-12-01' AND '2023-12-31' AND revnum = 240301 THEN revcount ELSE 0 END) AS rev4count, " +
                    "         SUM(CASE WHEN CONVERT(DATE, month, 23) BETWEEN '2023-12-01' AND '2023-12-31' AND revnum = 240301 THEN revprice / 1000000.0 ELSE 0 END) AS rev4price, " +
                    "         SUM(CASE WHEN CONVERT(DATE, month, 23) BETWEEN '2023-12-01' AND '2023-12-31' AND revnum = 240401 THEN revcount ELSE 0 END) AS rev5count, " +
                    "         SUM(CASE WHEN CONVERT(DATE, month, 23) BETWEEN '2023-12-01' AND '2023-12-31' AND revnum = 240401 THEN revprice / 1000000.0 ELSE 0 END) AS rev5price " +
                    "     FROM shipmentinput " +
                    "     GROUP BY itemname, customer, bomno, modelname, itemprice " +
                    " ) AS subquery                 "
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
        app.post('/api/businessplan', function (req, res) {

            res.header("Access-Control-Allow-Origin", "*");

            return pool.request()
                .input('rev', sql.NVarChar, req.body.rev)


                .query(
                    " select  " +
                    " site, " +
                    " customer, " +
                    " codenumber, " +
                    " bomno, " +
                    " modelname, " +
                    " itemname, " +
                    " team, " +
                    " aea, " +
                    " aprice, " +
                    " aea*aprice/1000000'acost'," +
                    " bea, " +
                    " bprice, " +
                    " bea*bprice/1000000'bcost'," +
                    " cea, " +
                    " cprice, " +
                    " cea*cprice/1000000'ccost'," +
                    " dea, " +
                    " dprice, " +
                    " dea*dprice/1000000'dcost'," +
                    " eea, " +
                    " eprice, " +
                    " eea*eprice/1000000'ecost'," +
                    " fea, " +
                    " fprice, " +
                    " fea*fprice/1000000'fcost'," +
                    " gea, " +
                    " gprice, " +
                    " gea*gprice/1000000'gcost'," +
                    " hea, " +
                    " hprice, " +
                    " hea*hprice/1000000'hcost'," +
                    " iea, " +
                    " iprice, " +
                    " iea*iprice/1000000'icost'," +
                    " jea, " +
                    " jprice, " +
                    " jea*jprice/1000000'jcost'," +
                    " kea, " +
                    " kprice, " +
                    " kea*kprice/1000000'kcost'," +
                    " lea, " +
                    " lprice, " +
                    " lea*lprice/1000000'lcost'" +
                    " from " +
                    " businessplan"
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
        app.post('/api/businessplanrev', function (req, res) {

            res.header("Access-Control-Allow-Origin", "*");

            return pool.request()


                .query(
                    "SELECT " +
                    "     COALESCE(s.customer, b.customer) AS customer, " +
                    "     COALESCE(b.total_lcost, 0) AS total_lcost, " +
                    "     COALESCE(s.total_revprice_231201, 0) AS total_revprice_231201, " +
                    "     COALESCE(s.total_revprice_231202, 0) AS total_revprice_231202, " +
                    "     COALESCE(s.total_revprice_231203, 0) AS total_revprice_231203, " +
                    "     COALESCE(s.total_revprice_231204, 0) AS total_revprice_231204, " +
                    "     COALESCE(s.total_revprice_231205, 0) AS total_revprice_231205, " +
                    "     COALESCE(r.total_revprice_for_renum_1, 0) AS total_revprice_for_renum_1 " +
                    " FROM " +
                    "     (SELECT " +
                    "         customer, " +
                    "         SUM(CASE WHEN revnum = '231201' THEN revprice ELSE 0 END)/1000000 AS total_revprice_231201, " +
                    "         SUM(CASE WHEN revnum = '231202' THEN revprice ELSE 0 END)/1000000 AS total_revprice_231202, " +
                    "         SUM(CASE WHEN revnum = '231203' THEN revprice ELSE 0 END)/1000000 AS total_revprice_231203, " +
                    "         SUM(CASE WHEN revnum = '231204' THEN revprice ELSE 0 END)/1000000 AS total_revprice_231204, " +
                    "         SUM(CASE WHEN revnum = '231205' THEN revprice ELSE 0 END)/1000000 AS total_revprice_231205 " +
                    "     FROM " +
                    "         shipmentinput " +
                    "     WHERE " +
                    "         revnum IN ('231201', '231202', '231203', '231204', '231205') " +
                    "     GROUP BY " +
                    "         customer) AS s " +
                    " FULL OUTER JOIN " +
                    "     (SELECT " +
                    "         customer, " +
                    "         SUM(lea*lprice)/1000000 AS total_lcost " +
                    "     FROM " +
                    "         businessplan " +
                    "     GROUP BY " +
                    "         customer, site, codenumber) AS b " +
                    " ON " +
                    "     s.customer = b.customer " +
                    " LEFT JOIN " +
                    "     (SELECT " +
                    "         customer, " +
                    "         SUM(revprice)/1000000 AS total_revprice_for_renum_1 " +
                    "     FROM " +
                    "         shipmentinput " +
                    "     WHERE " +
                    "         revnum = '1' " +
                    "     GROUP BY " +
                    "         customer) AS r " +
                    " ON " +
                    "     COALESCE(s.customer, b.customer) = r.customer " +
                    " ORDER BY " +
                    "     total_lcost DESC               "
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
        app.post('/api/businessplanyear', function (req, res) {

            res.header("Access-Control-Allow-Origin", "*");

            return pool.request()


                .query(
                    "SELECT   " +
                    "   '사업계획_한국' AS 'site', " +
                    "     SUM(aea * aprice)/1000000 AS 'a',  " +
                    "     SUM(bea * bprice)/1000000 AS 'b',  " +
                    "     SUM(cea * cprice)/1000000 AS 'c',  " +
                    "     SUM(dea * dprice)/1000000 AS 'd',  " +
                    "     SUM(eea * eprice)/1000000 AS 'e',  " +
                    "     SUM(fea * fprice)/1000000 AS 'f',  " +
                    "     SUM(gea * gprice)/1000000 AS 'g',  " +
                    "     SUM(hea * hprice)/1000000 AS 'h',  " +
                    "     SUM(iea * iprice)/1000000 AS 'i',  " +
                    "     SUM(jea * jprice)/1000000 AS 'j',  " +
                    "     SUM(kea * kprice)/1000000 AS 'k',  " +
                    "     SUM(lea * lprice)/1000000 AS 'l'   " +
                    " FROM   " +
                    "     businessplan " +
                    "  " +
                    " UNION ALL " +
                    "  " +
                    " SELECT  " +
                    "     '판매실적' AS 'site', " +
                    "     COALESCE(SUM(CASE WHEN month BETWEEN '2023-01-01' AND '2023-01-31' THEN revprice ELSE 0 END), 0)/1000000 AS 'a',  " +
                    "     COALESCE(SUM(CASE WHEN month BETWEEN '2023-02-01' AND '2023-02-28' THEN revprice ELSE 0 END), 0)/1000000 AS 'b',  " +
                    "     COALESCE(SUM(CASE WHEN month BETWEEN '2023-03-01' AND '2023-03-31' THEN revprice ELSE 0 END), 0)/1000000 AS 'c',  " +
                    "     COALESCE(SUM(CASE WHEN month BETWEEN '2023-04-01' AND '2023-04-30' THEN revprice ELSE 0 END), 0)/1000000 AS 'd',  " +
                    "     COALESCE(SUM(CASE WHEN month BETWEEN '2023-05-01' AND '2023-05-31' THEN revprice ELSE 0 END), 0)/1000000 AS 'e',  " +
                    "     COALESCE(SUM(CASE WHEN month BETWEEN '2023-06-01' AND '2023-06-30' THEN revprice ELSE 0 END), 0)/1000000 AS 'f',  " +
                    "     COALESCE(SUM(CASE WHEN month BETWEEN '2023-07-01' AND '2023-07-31' THEN revprice ELSE 0 END), 0)/1000000 AS 'g',  " +
                    "     COALESCE(SUM(CASE WHEN month BETWEEN '2023-08-01' AND '2023-08-31' THEN revprice ELSE 0 END), 0)/1000000 AS 'h',  " +
                    "     COALESCE(SUM(CASE WHEN month BETWEEN '2023-09-01' AND '2023-09-30' THEN revprice ELSE 0 END), 0)/1000000 AS 'i',  " +
                    "     COALESCE(SUM(CASE WHEN month BETWEEN '2023-10-01' AND '2023-10-31' THEN revprice ELSE 0 END), 0)/1000000 AS 'j',  " +
                    "     COALESCE(SUM(CASE WHEN month BETWEEN '2023-11-01' AND '2023-11-30' THEN revprice ELSE 0 END), 0)/1000000 AS 'k',  " +
                    "     COALESCE(SUM(CASE WHEN month BETWEEN '2023-12-01' AND '2023-12-31' THEN revprice ELSE 0 END), 0)/1000000 AS 'l'   " +
                    " FROM   " +
                    "     shipmentinput   " +
                    " WHERE   " +
                    "     revnum = '1'   " +
                    "     AND month BETWEEN '2023-01-01' AND '2023-12-31' " +

                    " UNION ALL " +

                    " SELECT  " +
                    "     '판매실적' AS 'site'," +
                    "     COALESCE(SUM(CASE WHEN month BETWEEN '2022-01-01' AND '2022-01-31' THEN revprice ELSE 0 END), 0)/1000000 AS 'a',  " +
                    "     COALESCE(SUM(CASE WHEN month BETWEEN '2022-02-01' AND '2022-02-28' THEN revprice ELSE 0 END), 0)/1000000 AS 'b',  " +
                    "     COALESCE(SUM(CASE WHEN month BETWEEN '2022-03-01' AND '2022-03-31' THEN revprice ELSE 0 END), 0)/1000000 AS 'c',  " +
                    "     COALESCE(SUM(CASE WHEN month BETWEEN '2022-04-01' AND '2022-04-30' THEN revprice ELSE 0 END), 0)/1000000 AS 'd',  " +
                    "     COALESCE(SUM(CASE WHEN month BETWEEN '2022-05-01' AND '2022-05-31' THEN revprice ELSE 0 END), 0)/1000000 AS 'e',  " +
                    "     COALESCE(SUM(CASE WHEN month BETWEEN '2022-06-01' AND '2022-06-30' THEN revprice ELSE 0 END), 0)/1000000 AS 'f',  " +
                    "     COALESCE(SUM(CASE WHEN month BETWEEN '2022-07-01' AND '2022-07-31' THEN revprice ELSE 0 END), 0)/1000000 AS 'g',  " +
                    "     COALESCE(SUM(CASE WHEN month BETWEEN '2022-08-01' AND '2022-08-31' THEN revprice ELSE 0 END), 0)/1000000 AS 'h',  " +
                    "     COALESCE(SUM(CASE WHEN month BETWEEN '2022-09-01' AND '2022-09-30' THEN revprice ELSE 0 END), 0)/1000000 AS 'i',  " +
                    "     COALESCE(SUM(CASE WHEN month BETWEEN '2022-10-01' AND '2022-10-31' THEN revprice ELSE 0 END), 0)/1000000 AS 'j',  " +
                    "     COALESCE(SUM(CASE WHEN month BETWEEN '2022-11-01' AND '2022-11-30' THEN revprice ELSE 0 END), 0)/1000000 AS 'k',  " +
                    "     COALESCE(SUM(CASE WHEN month BETWEEN '2022-12-01' AND '2022-12-31' THEN revprice ELSE 0 END), 0)/1000000 AS 'l'   " +
                    " FROM   " +
                    "     shipmentinput   " +
                    " WHERE   " +
                    "     revnum = '1'   " +
                    "     AND month BETWEEN '2022-01-01' AND '2022-12-31'; "

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
        app.post('/api/businessplanyearsiljok', function (req, res) {

            res.header("Access-Control-Allow-Origin", "*");

            return pool.request()


                .query(
                    "SELECT " +
                    "     SUM(CASE WHEN month BETWEEN '2023-01-01' AND '2023-01-31' THEN revprice ELSE 0 END)/1000000 AS 'aa', " +
                    "     SUM(CASE WHEN month BETWEEN '2023-02-01' AND '2023-02-28' THEN revprice ELSE 0 END)/1000000 AS 'ab', " +
                    "     SUM(CASE WHEN month BETWEEN '2023-03-01' AND '2023-03-31' THEN revprice ELSE 0 END)/1000000 AS 'ac', " +
                    "     SUM(CASE WHEN month BETWEEN '2023-04-01' AND '2023-04-30' THEN revprice ELSE 0 END)/1000000 AS 'ad', " +
                    "     SUM(CASE WHEN month BETWEEN '2023-05-01' AND '2023-05-31' THEN revprice ELSE 0 END)/1000000 AS 'ae', " +
                    "     SUM(CASE WHEN month BETWEEN '2023-06-01' AND '2023-06-30' THEN revprice ELSE 0 END)/1000000 AS 'af', " +
                    "     SUM(CASE WHEN month BETWEEN '2023-07-01' AND '2023-07-31' THEN revprice ELSE 0 END)/1000000 AS 'ag', " +
                    "     SUM(CASE WHEN month BETWEEN '2023-08-01' AND '2023-08-31' THEN revprice ELSE 0 END)/1000000 AS 'ah', " +
                    "     SUM(CASE WHEN month BETWEEN '2023-09-01' AND '2023-09-30' THEN revprice ELSE 0 END)/1000000 AS 'ai', " +
                    "     SUM(CASE WHEN month BETWEEN '2023-10-01' AND '2023-10-31' THEN revprice ELSE 0 END)/1000000 AS 'aj', " +
                    "     SUM(CASE WHEN month BETWEEN '2023-11-01' AND '2023-11-30' THEN revprice ELSE 0 END)/1000000 AS 'ak', " +
                    "     SUM(CASE WHEN month BETWEEN '2023-12-01' AND '2023-12-31' THEN revprice ELSE 0 END)/1000000 AS 'al' " +
                    " FROM " +
                    "     shipmentinput " +
                    " WHERE " +
                    "     revnum = '1' " +
                    "     AND month BETWEEN '2023-01-01' AND '2023-12-31';"
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
        app.post('/api/businessplanyearprev', function (req, res) {

            res.header("Access-Control-Allow-Origin", "*");

            return pool.request()


                .query(
                    "SELECT " +
                    "     SUM(CASE WHEN month BETWEEN '2022-01-01' AND '2022-01-31' THEN revprice ELSE 0 END)/1000000 AS 'aaa', " +
                    "     SUM(CASE WHEN month BETWEEN '2022-02-01' AND '2022-02-28' THEN revprice ELSE 0 END)/1000000 AS 'aab', " +
                    "     SUM(CASE WHEN month BETWEEN '2022-03-01' AND '2022-03-31' THEN revprice ELSE 0 END)/1000000 AS 'aac', " +
                    "     SUM(CASE WHEN month BETWEEN '2022-04-01' AND '2022-04-30' THEN revprice ELSE 0 END)/1000000 AS 'aad', " +
                    "     SUM(CASE WHEN month BETWEEN '2022-05-01' AND '2022-05-31' THEN revprice ELSE 0 END)/1000000 AS 'aae', " +
                    "     SUM(CASE WHEN month BETWEEN '2022-06-01' AND '2022-06-30' THEN revprice ELSE 0 END)/1000000 AS 'aaf', " +
                    "     SUM(CASE WHEN month BETWEEN '2022-07-01' AND '2022-07-31' THEN revprice ELSE 0 END)/1000000 AS 'aag', " +
                    "     SUM(CASE WHEN month BETWEEN '2022-08-01' AND '2022-08-31' THEN revprice ELSE 0 END)/1000000 AS 'aah', " +
                    "     SUM(CASE WHEN month BETWEEN '2022-09-01' AND '2022-09-30' THEN revprice ELSE 0 END)/1000000 AS 'aai', " +
                    "     SUM(CASE WHEN month BETWEEN '2022-10-01' AND '2022-10-31' THEN revprice ELSE 0 END)/1000000 AS 'aaj', " +
                    "     SUM(CASE WHEN month BETWEEN '2022-11-01' AND '2022-11-30' THEN revprice ELSE 0 END)/1000000 AS 'aak', " +
                    "     SUM(CASE WHEN month BETWEEN '2022-12-01' AND '2022-12-31' THEN revprice ELSE 0 END)/1000000 AS 'aal' " +
                    " FROM " +
                    "     shipmentinput " +
                    " WHERE " +
                    "     revnum = '1' " +
                    "     AND month BETWEEN '2022-01-01' AND '2022-12-31';"
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
        app.post('/api/sampleorder', function (req, res) {

            res.header("Access-Control-Allow-Origin", "*");

            return pool.request()


                .query(
                    "select * from sampleorder order by bomno,partcustomer,toolcode asc"
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
        app.post('/api/searchingtoolcode', function (req, res) {

            res.header("Access-Control-Allow-Origin", "*");

            return pool.request()
                .input('searchText', sql.NVarChar, req.body.searchText)

                .query(
                    "select * from sampleorder where toolcode LIKE '%' + @searchText + '%'"
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
        app.post('/api/searchingsamplebomno', function (req, res) {

            res.header("Access-Control-Allow-Origin", "*");

            return pool.request()
                .input('searchText', sql.NVarChar, req.body.searchText)

                .query(
                    "select * from iteminfo where part ='샘플' and bomno LIKE '%' + @searchText + '%'"
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
        app.post('/api/insertaccountplan', function (req, res) {

            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()
                //.input('변수',값 형식, 값)


                .input('plandate', sql.NVarChar, req.body.plandate)
                .input('bomno', sql.NVarChar, req.body.bomno)
                .input('quantity', sql.NVarChar, req.body.quantity)


                .query(
                    'insert into accountplan(plandate,bomno,quantity)' +
                    ' values(@plandate,@bomno,@quantity)'
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
        app.post('/api/deleteaccountplan', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");

            const { bomno, year, month } = req.body;

            pool.request()
                .input('bomno', sql.NVarChar, bomno)
                .input('year', sql.NVarChar, year)
                .input('month', sql.NVarChar, month)
                .query(
                    "DELETE FROM accountplan WHERE YEAR(plandate) = @year AND MONTH(plandate) = @month AND bomno = @bomno"
                )
                .then(result => {
                    res.json(result.recordset);
                })
                .catch(err => {
                    console.error("Error executing SQL query:", err);
                    res.status(500).send("An error occurred while deleting the account plan.");
                });
        });
    });

    // **** finish
    // **** start  품질검사 등록 쿼리    
    sql.connect(config).then(pool => {
        app.post('/api/insertprocessname', function (req, res) {

            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()
                //.input('변수',값 형식, 값)


                .input('processname', sql.NVarChar, req.body.processname)

                .query(
                    'insert into processname(processname)' +
                    ' values(@processname)'
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
        app.post('/api/insertbucakcustomer', function (req, res) {

            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()
                //.input('변수',값 형식, 값)


                .input('bucakcustomer', sql.NVarChar, req.body.bucakcustomer)

                .query(
                    'insert into bucakcustomer(bucakcustomer)' +
                    ' values(@bucakcustomer)'
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
        app.post('/api/insertpinacle', function (req, res) {

            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()
                //.input('변수',값 형식, 값)


                .input('insertdate', sql.NVarChar, req.body.insertdate)
                .input('toolcode', sql.NVarChar, req.body.toolcode)
                .input('madedate', sql.NVarChar, req.body.madedate)
                .input('bomno', sql.NVarChar, req.body.bomno)
                .input('customer', sql.NVarChar, req.body.customer)
                .input('modelname', sql.NVarChar, req.body.modelname)
                .input('itemname', sql.NVarChar, req.body.itemname)
                .input('char', sql.NVarChar, req.body.char)
                .input('part', sql.NVarChar, req.body.part)
                .input('inputprice', sql.Float, req.body.inputprice)
                .input('outputprice', sql.Float, req.body.outputprice)
                .input('partcustomer', sql.NVarChar, req.body.partcustomer)
                .input('etc', sql.NVarChar, req.body.etc)
                .input('classification', sql.NVarChar, req.body.classification)


                .query(
                    'insert into sampleorder(insertdate,toolcode,madedate,bomno,customer,modelname,itemname,char,part,inputprice,outputprice,partcustomer,etc,classification)' +
                    ' values(@insertdate,@toolcode,@madedate,@bomno,@customer,@modelname,@itemname,@char,@part,@inputprice,@outputprice,@partcustomer,@etc,@classification)'
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
        app.post('/api/inputexcelshipmentsiljok', function (req, res) {

            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()
                //.input('변수',값 형식, 값)


                .input('month', sql.NVarChar, req.body.month)
                .input('customer', sql.NVarChar, req.body.customer)
                .input('bomno', sql.NVarChar, req.body.bomno)
                .input('modelname', sql.NVarChar, req.body.modelname)
                .input('itemname', sql.NVarChar, req.body.itemname)
                .input('itemprice', sql.Float, req.body.itemprice)
                .input('revnum', sql.Float, req.body.revnum)
                .input('revcount', sql.Float, req.body.revcount)
                .input('revprice', sql.Float, req.body.revprice)


                .query(
                    'insert into shipmentinput(month,customer,bomno,modelname,itemname,itemprice,revnum,revcount,revprice)' +
                    ' values(@month,@customer,@bomno,@modelname,@itemname,@itemprice,@revnum,@revcount,@revprice)'
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


    // **** start  품질검사 등록 쿼리    
    sql.connect(config).then(pool => {
        app.post('/api/vntinsertmaterial', function (req, res) {

            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()
                //.input('변수',값 형식, 값)


                .input('codenumber', sql.NVarChar, req.body.codenumber)
                .input('materialname', sql.NVarChar, req.body.materialname)
                .input('width', sql.Float, req.body.width)
                .input('length', sql.Float, req.body.length)
                .input('usewidth', sql.Float, req.body.usewidth)
                .input('sqmprice', sql.Float, req.body.sqmprice)
                .input('rollprice', sql.Float, req.body.rollprice)
                .input('unit', sql.NVarChar, req.body.unit)
                .input('manufacterer', sql.NVarChar, req.body.manufacterer)
                .input('supplier', sql.NVarChar, req.body.supplier)


                .query(
                    " INSERT INTO vetnammaterialinfo (codenumber, materialname, width, length, usewidth, sqmprice, rollprice, unit, manufacterer, supplier) " +
                    " VALUES (@codenumber,@materialname,@width,@length,@usewidth,@sqmprice,@rollprice,@unit,@manufacterer,@supplier)"
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
        app.post('/api/vntselectmaterial', function (req, res) {

            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()

                .query(
                    " select " +
                    " codenumber, " +
                    " materialname, " +
                    " width, " +
                    " length, " +
                    " usewidth, " +
                    " sqmprice, " +
                    " rollprice, " +
                    " unit, " +
                    " manufacterer, " +
                    " supplier " +
                    " from " +
                    " vetnammaterialinfo ORDER BY  CAST(codenumber AS INTEGER) ASC"
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
        app.post('/api/vntupdatematerial', function (req, res) {

            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()

                .query(
                    " select " +
                    " codenumber, " +
                    " materialname, " +
                    " width, " +
                    " length, " +
                    " usewidth, " +
                    " sqmprice, " +
                    " rollprice, " +
                    " unit, " +
                    " manufacterer, " +
                    " supplier " +
                    " from " +
                    " vetnammaterialinfo  order by materialname asc"
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


