// routes/index.js
module.exports = function (app) {
    const sql = require('mssql');
    var config = {
        user: 'pswel1',
        password: '1234',
        server: '221.154.8.88',
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
                    'password ' +
                    'FROM member where nameid = @nameid')
                .then(result => {
                    console.log('result.recordset', result.recordset[0].password)
                    console.log('result.recordset1', password)
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

    // **** start       
    sql.connect(config).then(pool => {
        app.post('/api/iteminfo', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");



            return pool.request()

                .query(

                    'SELECT ' +
                    '* ' +
                    'FROM iteminfo')

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
        app.post('/api/materialinfo', function (req, res) {
            res.header("Access-Control-Allow-Origin", "*");



            return pool.request()

                .query(

                    'SELECT ' +
                    '* ' +
                    'FROM materialinfo')

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
                    'Codenumber,' +
                    'Itemname,' +
                    'Classfication,' +
                    'Materialwidth,' +
                    'Koreancustomer,' +
                    'Sqmprice,' +
                    'Rollprice,' +
                    'Widthclassficaiton,' +
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
                .input('materialwidth', sql.NVarChar, req.body.materialwidth)
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
        app.post('/api/materialoption', function (req, res) {
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
        app.post('/api/iteminfo', function (req, res) {
            console.log("req", req)
            res.header("Access-Control-Allow-Origin", "*");
            return pool.request()
                .query(
                    "   select " +
                    "   itemcode," +
                    "   bomno," +
                    "   modelname," +
                    "   itemname," +
                    "   size," +
                    "   format(convert(int,Isnull(itemprice,0)),'##,##0')'itemprice" +
                    "   ,quantity" +
                    "    from iteminfo"
                )
                .then(result => {
                    console.log(result)
              
                    res.json(result.recordset);
                    res.end();
                });
        });

    });
    // **** finish
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
                .input('itemprice', sql.Int, req.body.itemprice)
                .input('quantity', sql.Int, req.body.quantity)


                .query(
                    'insert into accountinput(accountdate,deliverydate,customer,itemcode,bomno,modelname,itemname,size,itemprice,quantity)' +
                    ' values(@accountdate,@deliverydate,@customer,@itemcode,@bomno,@modelname,@itemname,@size,@itemprice,@quantity)'
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
        app.post('/api/productorder', function (req, res) {
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
}



