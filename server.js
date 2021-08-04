const express = require('express');
const bodyParser = require('body-parser');
const db = require('mssql');
const app = express();
const port = process.env.PORT || 3000; //รับค่าPROT ในระบบ (ใช้กับHEROKU) หรือ 3000  

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const config = {
    user: 'sa',
    password: 'so6,ko123',
    server: '192.168.1.205',
    database: 'DB_UAT',
    options: {
        trustServerCertificate: true,
        cryptoCredentialsDetails: {
            minVersion: 'TLSv1'
        } // ค่า Config server
    }
}

app.get('/', (req, res) => {
    res.send({ error: false, message: 'Welcome to RESTful APIs by NodeJs.' });
});

//--------------------ใส่ Code-------------------------------
app.get('/api/v1/employees', async (req, res) => {
    //let limits = req.body.limits;
    // let sql = `SELECT TOP (${limits}) * FROM [10_MATERIAL_HEADER]`;
    let sql = `SELECT * FROM [EMPLOYEES]`;
    await db.connect(config);
    let result = await db.query(sql);
    if (result === undefined || result.recordset.length == 0) { // recordset คือก้อนข้อมูล
        res.send({ error: true, message: 'Data is not found.' });
    } else {
        res.send({ error: false, message: 'Successfully.', data: result.recordset });
    }
    //res.send({error:false,message:'Welcome to RESTful APIs by NodeJs.'});
});

//add data 
app.post('/api/v1/employee', async (req, res) => {
    let empId = req.body.empId;
    let firstName = req.body.firstName;
    let lastName = req.body.lastName;
    let section = req.body.section;
    if (!empId || !firstName || !lastName || !section) {
        return res.send({ error: false, message: 'Please provide employee data' });
    } else {
        try {
            let sql = 'INSERT INTO [EMPLOYEES] (EMP_ID ,FIRST_NAME , LAST_NAME , SECTION)  VALUES (?,?,?,?)';
            await db.connect(config);
            let results = await db.query(sql, [empId, firstName, lastName, section]);

            return res.send({ error: false, data: results, message: 'Employee successfully added.' });
        } catch (ex) {
            return res.send({ error: true, message: ex.message });
        }

    }
});

//update data
app.put('/api/v1/employee', async (req, res) => {
    let empId = req.body.empId;
    let firstName = req.body.firstName;
    let lastName = req.body.lastName;
    let section = req.body.section;
    if (!empId || !firstName || !lastName || !section) {
        return res.send({ error: false, message: 'Please provide employee data' });
    } else {
        try {
            let sql = `UPDATE [EMPLOYEES] SET FIRST_NAME = '${firstName}' , LAST_NAME ='${lastName}' , SECTION = '${section}'  WHERE EMP_ID = '${empId}'`;
            await db.connect(config);
            let results = await db.query(sql);

            return res.send({ error: false, data: results, message: 'Employee successfully updeted.' });
        } catch (ex) {
            return res.send({ error: true, message: ex.message });
        }
    }
});

//delete data
app.delete('/api/v1/employee', async (req, res) => {
    let empId = req.body.empId;
    if (!empId) {
        return res.send({ error: false, message: 'Please employee id' });
    } else {
        let sql = `DELETE FROM [EMPLOYEES] WHERE EMP_ID = '${empId}'`;
        await db.connect(config);
        let results = await db.query(sql);

        let message = '';
        if (results.affectedRows == 0) { //ถ้าหา id  ของ user ไม่เจอ
            message = 'Employee data is not found.';
        } else {
            message = 'Successfully Employee deleted.'
        }

        return res.send({ error: false, data: results, message: message });
    }
});

//----------------------------------------------------------

app.listen(port, () => {
    console.log(`Server is running on port ${port}.`);
});

module.exports = app;