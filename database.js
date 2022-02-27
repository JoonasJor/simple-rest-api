const { Connection, Request } = require("tedious")
const secrets = require('./secrets.json')

// database config
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

function connectDatabase(){
    return new Promise((resolve, reject) => {
        // Connect to database
        connection.on("connect", err => {
            if (err) {
                console.error(err.message)
                reject(err)
            } 
            else {
            console.log("Successfully connected to database")
            resolve()
            }
        })

        connection.connect();
    })
}

function disconnectDatabase(){
    connection.close();
}

function queryDatabase(r)  {
    return new Promise((resolve, reject) => {
        console.log(r)

        const request = new Request(r, (err, rowCount) => {
            if (err) {
                console.error(err.message)
            } 
            else {
                console.log(`${rowCount} row(s) returned`)
                // resolve with rowcount if no json or id response from db
                // and use it to determine if the operation was succesful
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

module.exports = { queryDatabase, connectDatabase, disconnectDatabase }