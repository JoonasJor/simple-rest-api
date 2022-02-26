const express = require('express')
const bodyParser = require('body-parser')

const app = express()
const port = process.env.PORT || 8080

// database
const { Connection, Request } = require("tedious");

// Create connection to database
const secrets = require('./secrets.json')
const config = {
    authentication: {
    options: {
        userName: secrets.username,
        password: secrets.password
    },
    type: "default"
    },
    server: secrets.server,
    options: {
        database: secrets.database,
        encrypt: true
    }
};

const connection = new Connection(config);

// Connect to database
connection.on("connect", err => {
    if (err) {
        console.error(err.message);
    } 
    else {
    console.log("Successfully connected to database")
    }
})

connection.connect();

function queryDatabase(r) {
    return new Promise((resolve, reject) => {
        console.log(r)

        const request = new Request(r, (err, rowCount) => {
            if (err) {
                console.error(err.message)
            } 
            else {
                console.log(`${rowCount} row(s) returned`)
                // update operation doesnt send json or id back so
                // resolve with rowcount and use it to determine
                // if the operation was succesful
                resolve(rowCount)
            }
        })     
        request.on("row", function(columns) {
                // db response
                let response = columns.map(column => column.value)
                console.log(response)
                resolve(response)
        })   
        connection.execSql(request)
    })
}

app.use(bodyParser.json())

app.get("/", function (req, res) {
    res.send("b")
})

// json validator
const Ajv = require('ajv')
const ajv = new Ajv()
const vehicleSchema = require('./schemas/vehicle.schema.json');
const { send } = require('express/lib/response');

const vehicleInfoValidator = ajv.compile(vehicleSchema)
const vehicleInfoValidateMw = function (req, res, next) {
    const validationResult = vehicleInfoValidator(req.body)
    if(validationResult) {
        next()
    }
    else {
        res.status(400).json({
            errorDescription: vehicleInfoValidator.errors[0].message,
            errorinfo: vehicleInfoValidator.errors[0].instancePath
        })
    }
}

app.get('/vehicles', (req, res) => {
    //${req.query.id}, ${req.query.brand}, ${req.query.model}, ${req.query.licencePlate},
    queryDatabase(`SELECT * FROM vehicles FOR JSON PATH`)
    .then((response) => {
        let parsedResponse=JSON.parse(response);
        res.json(parsedResponse)
    })
})

app.post('/vehicles', vehicleInfoValidateMw, (req, res) => {
    queryDatabase(`EXEC insertVehicle 
                    @brand = '${req.body.brand}', 
                    @model = '${req.body.model}', 
                    @licencePlate = '${req.body.licencePlate}'`)
    .then((response) => {
        let parsedResponse=JSON.parse(response);
        res.json(parsedResponse)
    }) 
})

app.put('/vehicles/:id', vehicleInfoValidateMw, (req, res) => {
    queryDatabase(`EXEC updateVehicle 
                    @id = '${req.params.id}',
                    @brand = '${req.body.brand}', 
                    @model = '${req.body.model}', 
                    @licencePlate = '${req.body.licencePlate}'`)
    .then((response) => {
        if(response == 0){
            res.sendStatus(404)
        }
        else{
            res.sendStatus(200)
        }     
    })
})














let serverInstance = null

module.exports = {
    start: function(){
        serverInstance = app.listen(port, () => {
            console.log("listening on http://localhost:" + port)
        })
    },
    close: function(){
        serverInstance.close()
    }
}