const express = require('express')
const router = express.Router()

// authentication
const bcrypt = require("bcryptjs")
const passport = require("passport")
const basicStrategy = require("passport-http").BasicStrategy
const secrets = require('../secrets.json')

// login with http basic
passport.use(new basicStrategy(
    function(username, password, done) {
        db.queryDatabase(`EXEC login @username = '${username}'`)
        .then((response) => {
            if(response == 0) {
                done(null, false)  
            }
            else{
                let hash = response[0]
                bcrypt.compare(password, hash).then(function(result) {
                    if(result == true){
                        done(null, true)
                    }
                    else {
                        done(null, false) 
                    }
                })
            }
        })    
    }
))

// database
const db = require('../database.js')

router.post('/', (req, res) => { 
    if(req.body.adminUsername == secrets.username && req.body.adminPassword == secrets.password) {
        // only admin can create users
        // admin's username and password are currently stored locally
        //
        // store password as hash
        bcrypt.hash(req.body.password, 10).then(function(hash) {
            db.queryDatabase(`EXEC insertUser 
                            @username = '${req.body.username}', 
                            @password = '${hash}'`)
            .then((response) => {
                res.status(201).json(response[0])
            }) 
        })
    }
    else {
        res.sendStatus(401)
    }
})

const jwt = require('jsonwebtoken')

router.post('/login', passport.authenticate("basic", {session: false}), (req, res) => {
    // generate and return JWT upon succesful login
    // use the token for future authentication
    const payloadData = {
        username: getUsernameFromAuthHeader(req)
    }
    const token = jwt.sign(payloadData, secrets.jwtSignKey)

    res.json({token: token})
})

function getUsernameFromAuthHeader(req){
    let header = req.headers.authorization || ''       // get the auth header
    let token = header.split(/\s+/).pop() || '';       // and the encoded auth token
    let auth = Buffer.from(token, 'base64').toString() // convert from base64
    let parts = auth.split(/:/);                       // split on colon
    return username = parts.shift()
}

module.exports = router