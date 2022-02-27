const server = require('./server.js')
const db = require('./database.js')
server.start()
db.connectDatabase()