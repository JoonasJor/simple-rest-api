const express = require('express')
const router = express.Router()

// json validator
const Ajv = require('ajv')
const ajv = new Ajv()
const vehicleSchema = require('../schemas/vehicle.schema.json');

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

const db = require('../database.js')

router.get('/', (req, res) => {
    db.queryDatabase(`EXEC getVehicles @id = ${-1}`)
    .then((response) => {
        let parsedResponse=JSON.parse(response);
        res.json(parsedResponse)
    })
})

router.get('/:id', (req, res) => {
    db.queryDatabase(`EXEC getVehicles @id = ${req.params.id}`)
    .then((response) => {
        if(response == 0){
            res.sendStatus(404)
        }
        else{
            let parsedResponse=JSON.parse(response);
            res.json(parsedResponse[0])
        } 
    })
})

router.post('/', vehicleInfoValidateMw, (req, res) =>  {
    db.queryDatabase(`EXEC insertVehicle 
                    @brand = '${req.body.brand}', 
                    @model = '${req.body.model}', 
                    @licencePlate = '${req.body.licencePlate}'`)
    .then((response) => {
        res.status(201).json(response[0])
    }) 
})


router.put('/:id', vehicleInfoValidateMw, (req, res) => {
    db.queryDatabase(`EXEC updateVehicle 
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

router.delete('/:id', (req, res) => {
    db.queryDatabase(`EXEC deleteVehicle @id = ${req.params.id}`)
    .then((response) => {
        if(response == 0){
            res.sendStatus(404)
        }
        else{
            res.sendStatus(200)
        } 
    })
})

module.exports = router