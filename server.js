const express = require('express')
const bodyParser = require('body-parser')
const vehicles = require("./routes/vehicles.js")
const users = require("./routes/users.js")

const app = express()
const port = process.env.PORT || 8080


app.use(bodyParser.json())

app.get("/", function (req, res) {
    res.send("b")
})

app.use("/vehicles", vehicles)

app.use("/users", users)

let serverInstance = null

function start(){
    serverInstance = app.listen(port, () => {
        console.log("listening on http://localhost:" + port)
    })        
}

function close(){
    serverInstance.close()
}

module.exports = { start, close }