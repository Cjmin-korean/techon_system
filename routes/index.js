// routes/index.jsvert
const multer = require('multer');
const xlsx = require('xlsx');
const fs = require('fs');
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
                    'name ' +

                    'FROM member where nameid = @nameid')
                .then(result => {

                    console.log('이름 :', result.recordset[0].name)
                    var judgment = 'NG';
                    if (password == result.recordset[0].password) {
                        judgment = 'OK';
                    }

                    res.json({ judgment: judgment });
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

                    'SELECT ' +
                    '* ' +
                    'FROM finalpercent')

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
        app.post('/api/materialbase', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");



            return pool.request()

                .query(

                    "   select " +
                    "   id," +
                    "   materialname," +
                    "   codenumber," +
                    "   classification," +
                    "   format(convert(int,Isnull(fullwidth,0)),'##,##0')'fullwidth'," +
                    "   format(convert(int,Isnull(swidth,0)),'##,##0')'swidth'," +
                    "   customer," +
                    "   format(convert(int,Isnull(sqmprice,0)),'##,##0')'sqmprice'," +
                    "   format(convert(int,Isnull(rollprice,0)),'##,##0')'rollprice'," +
                    "   day " +
                    "   from materialbase order by materialname asc")

                .then(result => {

                    // console.log('내가보고싶은거', result.recordset)


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

                    'SELECT ' +
                    '* ' +
                    'FROM accountmanagement')

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


    // **** start  BOM정보 띄우기  
    sql.connect(config).then(pool => {
        app.post('/api/bommanagement1', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()
                .input('bomno', sql.NVarChar, req.body.bomno)
                .query(

                    " SELECT  bomno,materialname,swidth,mwidth " +
                    "  FROM bommanagement " +
                    "  WHERE  bomno=@bomno ")

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

                    "   select " +
                    "   id," +
                    "   itemcode," +
                    "   bomno," +
                    "   modelname," +
                    "   itemname," +
                    "   customer," +
                    "   size," +
                    "   format(convert(int,Isnull(itemprice,0)),'##,##0')'itemprice'," +
                    "   quantity" +
                    "    from iteminfo"
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
                    "marchine," +
                    "modelname," +
                    "itemname," +
                    "customer," +
                    "pcs," +
                    "working," +
                    "cavity," +
                    "onepidding," +
                    "twopidding," +
                    "rev" +
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
                    "id,equipmentname" +
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

                .query(
                    'insert into materialinput(date,input,materialname,codenumber,lotno,manufacturedate,expirationdate,materialwidth,quantity,roll,sum,price,accountnumber,contents)' +
                    ' values(@date,@input,@materialname,@codenumber,@lotno,@manufacturedate,@expirationdate,@materialwidth,@quantity,@roll,@sum,@price,@accountnumber,@contents)'
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
                //.input('변수',값 형식, 값)
                .input('equipmentname', sql.NVarChar, req.body.equipmentname)


                .query(
                    'insert into equipment(equipmentname)' +
                    ' values(@equipmentname)'
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
                    "date," +
                    "materialname," +
                    "lotno," +
                    "manufacturedate," +
                    "expirationdate," +
                    "format(convert(int,Isnull(materialwidth,0)),'##,##0')'materialwidth'," +
                    "format(convert(int,Isnull(quantity,0)),'##,##0')'quantity'," +
                    "roll," +
                    "sum" +

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
                    "select materialname,lotno,manufacturedate,expirationdate,materialwidth,sum(quantity)'quantity' from materialinput group by materialname,lotno,manufacturedate,expirationdate,materialwidth")


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
    // **** start  기초관리-품목정보창 띄우기  

    // **** start       
    sql.connect(config).then(pool => {
        app.post('/api/openinsertdata', function (req, res) {

            console.log("11", req)
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
                .input('itemprice', sql.NVarChar, req.body.itemprice)
                .input('quantity', sql.Int, req.body.quantity)
                .input('price', sql.Int, req.body.price)
                .input('salesorder', sql.NVarChar, req.body.accountdate)
                .input('contentname', sql.NVarChar, req.body.contentname)
                .input('countsum', sql.NVarChar, req.body.countsum)
                .input('pricesum', sql.NVarChar, req.body.pricesum)
                .query(
                    'insert into accountinput(accountdate,deliverydate,customer,itemcode,bomno,modelname,itemname,size,itemprice,quantity,price,salesorder,contentname,countsum,pricesum)' +
                    ' values(@accountdate,@deliverydate,@customer,@itemcode,@bomno,@modelname,@itemname,@size,@itemprice,@quantity,@price,@salesorder,@contentname,@countsum,@pricesum)'
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
                    'select * from orderlist')
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
                .input('itemname', sql.NVarChar, req.body.itemname)
                .input('lotno', sql.NVarChar, req.body.lotno)
                .input('marchine', sql.NVarChar, req.body.marchine)
                .input('quantity', sql.Int, req.body.quantity)
                .input('productdate', sql.NVarChar, req.body.productdate)
                .input('status', sql.NVarChar, req.body.status)

                .query(
                    'insert into orderlist(modelname,itemname,lotno,marchine,quantity,productdate,status)' +
                    ' values(@modelname,@itemname,@lotno,@marchine,@quantity,@productdate,@status)'
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
        app.post('/api/materialsoyo', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");

            return pool.request()
                .query(

                    // "     SELECT " +
                    // "      OL.productdate, " +
                    // "     BOM.bomno, " +
                    // "     BOM.model, " +
                    // "     BOM.itemname, " +
                    // "     BOM.materialname, " +
                    // "     BOM.swidth, " +
                    // "     BOM.mwidth * OL.quantity AS soyo " +
                    // " FROM  " +
                    // "     bommanagement AS BOM " +
                    // " INNER JOIN " +
                    // "     ( " +
                    // "         SELECT  " +
                    // "             productdate, " +
                    // "             itemname, " +
                    // "         SUM(CASE WHEN[status] = 'true' THEN[quantity] ELSE 0 END) AS quantity " +
                    // "         FROM  " +
                    // "             orderlist  " +
                    // "         GROUP BY  " +
                    // "             itemname,productdate " +
                    // "     ) AS OL ON BOM.itemname = OL.itemname "
                            "                     SELECT "+
                            "     OL.productdate, "+
                            "     OL.lotno, "+
                            "     BOM.bomno, "+
                            "     BOM.model, "+
                            "     BOM.itemname, "+
                            "     BOM.materialname, "+
                            "     BOM.swidth, "+
                            "     FORMAT(BOM.mwidth * OL.quantity, 'N0') AS soyo, "+
                            "     FORMAT(COALESCE(MI.quantity, 0), 'N0') AS materialnum, "+
                            "     FORMAT( "+
                            "         CASE "+
                            "             WHEN BOM.materialname = MI.materialname AND BOM.swidth = MI.materialwidth "+
                            "             THEN COALESCE(MI.quantity, 0) - BOM.mwidth * OL.quantity "+
                            "             ELSE -BOM.mwidth * OL.quantity "+
                            "         END, "+
                            "         'N0' "+
                            "     ) AS diff, "+
                            "     CASE "+
                            "         WHEN BOM.mwidth * OL.quantity > COALESCE(MI.quantity, 0) THEN '부족' "+
                            "         WHEN BOM.mwidth * OL.quantity <= COALESCE(MI.quantity, 0) THEN '가능' "+
                            "         ELSE NULL "+
                            "     END AS condition "+
                            " FROM  "+
                            "     bommanagement AS BOM "+
                            "     INNER JOIN ( "+
                            "         SELECT  "+
                            "             productdate, "+
                            "             lotno, "+
                            "             itemname,  "+
                            "             SUM(CASE WHEN [status] = 'true' THEN [quantity] ELSE 0 END) AS quantity "+
                            "         FROM "+
                            "             orderlist  "+
                            "         GROUP BY "+
                            "             lotno, itemname, productdate "+
                            "     ) AS OL ON BOM.itemname = OL.itemname "+
                            "     LEFT JOIN ( "+
                            "         SELECT "+
                            "             materialname, "+
                            "             materialwidth, "+
                            "             SUM(quantity) AS quantity "+
                            "         FROM "+
                            "             materialinput "+
                            "         GROUP BY "+
                            "             materialname, "+
                            "             materialwidth "+
                            "     ) AS MI ON BOM.materialname = MI.materialname AND BOM.swidth = MI.materialwidth"
                )
                // .query(

                //     " SELECT " +
                //     "        T.bomno, " +
                //     "        T.model, " +
                //     "        T.itemname, " +
                //     "        T.materialname,  " +
                //     "        T.swidth, " +
                //     "        (T.mwidth)* sum(quantity)'materialsoyo' " +

                //     "  FROM " +
                //     "      ( " +
                //     "          SELECT  " +
                //     "                 b.bomno, " +
                //     "                 b.model, " +
                //     "                 b.itemname, " +
                //     "                 b.materialname, " +
                //     "                 b.swidth, " +
                //     "                 b.mwidth, " +
                //     "                  o.quantity " +
                //     "          FROM orderlist AS o " +
                //     "                   RIGHT OUTER JOIN bommanagement AS b " +
                //     "                                    ON b.itemname = o.itemname " +

                //     "      ) as T group by T.bomno,T.model,T.itemname,T.materialname,T.swidth,T.mwidth")
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
            console.log("11", req)
            return pool.request()
                // .query(



                //     " 	SELECT " +
                //     "    T.deliverydate, " +
                //     "    T.customer, " +
                //     "    T.modelname, " +
                //     "    T.itemname, " +
                //     "    T.aQuantity, " +
                //     "    T.iQuantity, " +
                //     "    sum(T.oQuantity)'oQuantity', " +
                //     "    T.possible " +
                //     "    FROM " +
                //     "    (SELECT " +
                //     "    TB.deliverydate, " +
                //     "    TB.customer, " +
                //     "    tb.modelname, " +
                //     "    tb.itemname, " +
                //     "    tb.quantity as aQuantity, " +
                //     "    case when tb.iQuantity is null then 0 else tb.iQuantity end as iQuantity, " +
                //     "    case when o.quantity is null then 0 else o.quantity end as oQuantity, " +
                //     "    case when (tb.QUANTITY)<=(tb.iQuantity+ o.quantity)  then '가능' else '부족' end as possible  " +
                //     "    FROM " +
                //     "        (	 " +
                //     "            SELECT A.id, " +
                //     "                   A.deliverydate, " +
                //     "                   A.customer, " +
                //     "                   A.MODELNAME, " +
                //     "                   A.ITEMNAME, " +
                //     "                   A.QUANTITY, " +
                //     "                   i.quantity as iQuantity " +
                //     "            FROM ITEMINPUT AS I " +
                //     "                     RIGHT OUTER JOIN ACCOUNTINPUT AS A " +
                //     "                                      ON I.itemname = A.itemname " +

                //     "    )TB LEFT JOIN ORDERLIST AS O " +
                //     "                                  ON TB.itemname = O.itemname) as T " +
                //     "                                  group by 	T.deliverydate,	T.customer,	T.modelname,T.itemname,T.aQuantity,T.iQuantity,T.possible")
                .query(
                    "  WITH cte AS ( " +
                    "      SELECT " +
                    "        a.deliverydate, a.customer,a.modelname, a.itemname, a.quantity, a.bomno, " +
                    "        SUM(i.quantity) AS total_quantity, " +
                    "        ROW_NUMBER() OVER (PARTITION BY a.modelname, a.itemname ORDER BY a.deliverydate ASC) AS row_num " +
                    "      FROM accountinput a " +
                    "      JOIN iteminput i ON a.modelname = i.modelname AND a.itemname = i.itemname  " +
                    "      GROUP BY a.modelname, a.itemname, a.quantity , a.deliverydate ,a.customer, a.bomno " +
                    "    ), recursive_cte AS ( " +
                    "      SELECT " +
                    "       deliverydate,customer,modelname, itemname, quantity, total_quantity, " +
                    "          total_quantity - quantity AS difference, " +
                    "        row_num " +
                    "      FROM cte " +
                    "      WHERE row_num = 1 " +
                    "      UNION ALL  " +
                    "      SELECT " +
                    "        c.deliverydate,c.customer, c.modelname, c.itemname, c.quantity, c.total_quantity, " +
                    "        rc.difference - c.quantity AS difference, " +
                    "        c.row_num " +
                    "      FROM cte c " +
                    "      JOIN recursive_cte rc " +
                    "        ON c.modelname = rc.modelname  " +
                    "        AND c.itemname = rc.itemname  " +
                    "        AND c.row_num = rc.row_num + 1 " +
                    "    ) " +
                    "    SELECT deliverydate,customer,modelname, itemname, quantity, difference, " +
                    "     case when (difference)>=0  then '가능' else '부족' end as possible  " +
                    "    FROM recursive_cte  "
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
                    " quantity, " +
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


                .query(
                    'insert into Accountmanagement(accountcode,accountname,representativename,phone,adress)' +
                    ' values(@accountcode,@accountname,@representativename,@phone,@adress)'
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
                .input('adress', sql.NVarChar, req.body.adress)


                .query(
                    "update accountmanagement set accountcode=@accountcode,accountname=@accountname,representativename=@representativename,phone=@phone,adress=@adress where id=@id "

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
            console.log("res", res)
            console.log("req", req)

            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()
                //.input('변수',값 형식, 값)
                .input('id', sql.Int, req.body.id)
                .input('equipmentname', sql.NVarChar, req.body.equipmentname)



                .query(
                    'update equipment set equipmentname=@equipmentname where id=@id'

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
                //.input('변수',값 형식, 값)
                .input('itemcode', sql.NVarChar, req.body.itemcode)
                .input('bomno', sql.NVarChar, req.body.bomno)
                .input('modelname', sql.NVarChar, req.body.modelname)
                .input('itemname', sql.NVarChar, req.body.itemname)
                .input('customer', sql.NVarChar, req.body.customer)
                .input('size', sql.NVarChar, req.body.size)
                .input('itemprice', sql.Int, req.body.itemprice)




                .query(
                    'insert into iteminfo(itemcode,bomno,modelname,itemname,customer,size,itemprice)' +
                    ' values(@itemcode,@bomno,@modelname,@itemname,@customer,@size,@itemprice)'
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
                .input('size', sql.NVarChar, req.body.size)
                .input('itemprice', sql.Int, req.body.itemprice)



                .query(
                    'update iteminfo set itemcode=@itemcode,bomno=@bomno,modelname=@modelname,itemname=@itemname,size=@size,itemprice=@itemprice where id=@id'

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
    // **** finish

    // **** start material combobox group 쿼리      
    sql.connect(config).then(pool => {
        app.post('/api/accountnamegroup', function (req, res) {

            res.header("Access-Control-Allow-Origin", "*");

            return pool.request()

                .query(
                    " Select" +
                    "  accountname" +
                    "  from accountmanagement" +
                    "  WHERE accountname not in ('Null','')" +
                    "  group by accountname " +
                    " order by accountname asc "
                )
                .then(result => {

                    res.json(result.recordset);
                    res.end();
                });
        });

    });
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



                .query(
                    'insert into materialinput(date,materialname,codenumber,lotno,manufacturedate,expirationdate,materialwidth,quantity,roll,sum,price)' +
                    ' values(@date,@materialname,@codenumber,@lotno,@manufacturedate,@expirationdate,@materialwidth,@quantity,@roll,@sum,@price)'
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
    var express = require('express');


    /* GET users listing. */
    module.exports = app => {
        var router = express.Router();

        app.use('/order', router);

        router.get('/', function (req, res, next) {
            app.db.models.partner.findAll({
            }).then((result) => {
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


