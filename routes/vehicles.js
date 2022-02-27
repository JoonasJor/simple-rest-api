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

// authentication
const secrets = require('../secrets.json')
const passport = require("passport")
const JwtStrategy = require('passport-jwt').Strategy,
      ExtractJwt = require('passport-jwt').ExtractJwt
let jwtValidationOptions = {}
jwtValidationOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken()
jwtValidationOptions.secretOrKey = secrets.jwtSignKey

// database
const db = require('../database.js')

// auth with jwt
passport.use(new JwtStrategy(jwtValidationOptions, function(jwt_payload, done) {
    db.queryDatabase(`EXEC findUser @username = ${jwt_payload.username}`)
    .then((response) => {
        console.log(response)
        if(response == 0){
            done(null, false)
        }
        else {
            // user matching token found
            done(null, true)   
        }
    })
}))

// jwt auth not working currently
router.get('/'/*, passport.authenticate("jwt", {session: false})*/, (req, res) => {
    if(Object.keys(req.query).length == 0){
        db.queryDatabase(`EXEC getVehicles @id = ${-1}`)
        .then((response) => {
            let parsedResponse=JSON.parse(response);
            res.json(parsedResponse)
        })
    }
    else {
        db.queryDatabase(`EXEC queryVehicles
                        @brand = '${req.query.brand}', 
                        @model = '${req.query.model}', 
                        @licencePlate = '${req.query.licencePlate}'`)
        .then((response) => {
            let parsedResponse=JSON.parse(response);
            res.json(parsedResponse)
        })
    }
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