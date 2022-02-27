const chai = require('chai')
const expect = chai.expect
const { assert } = require('chai')
const chaiHttp = require('chai-http')
chai.use(chaiHttp)
const server = require('../server')
const db = require('../database.js')
const chaiJsonSchemaAjv = require('chai-json-schema-ajv')
chai.use(chaiJsonSchemaAjv)

const serverAddress = "http://localhost:8080"
const vehicleInfoArraySchema = require('../schemas/vehicleArray.schema.json')
const vehicleInfoSchema = require('../schemas/vehicle.schema.json')


describe('Vehicle tests', function () {
    var vehicleId = -1

    before(async function() {
        server.start()
        await db.connectDatabase()
    })

    after(function () {
        server.close()
        db.disconnectDatabase()
    })

    //Get
    //
    describe('Get all vehicles - GET /vehicles', function() {
        it("should return all vehicle data", function(done) {
        // send http request
        chai.request(serverAddress)
            .get('/vehicles')
            .end(function (err, res) {
                expect(err).to.be.null 
                // check response status
                expect(res.statusCode).to.equal(200)
                // check response data structure
                expect(res.body).to.be.jsonSchema(vehicleInfoArraySchema)
                
                vehicleId = res.body[0].id
                done()
            })
        })
    }).timeout(10000)

    describe('Get single vehicle - GET /vehicle/:id', function() {
        it("should return vehicle data", function(done) {
        chai.request(serverAddress)
            .get(`/vehicles/${vehicleId}`)
            .end(function (err, res) {
                expect(err).to.be.null 
                expect(res.statusCode).to.equal(200)

                expect(res.body).to.be.jsonSchema(vehicleInfoSchema)
                done()
            })
        })
    }).timeout(10000)

    //POST 
    //
    describe("Add new vehicle - POST /items", function() {
        it("should accept vehicle data when data is correct", function(done){
        chai.request(serverAddress)
            .post("/vehicles")
            //.set("Authorization", "Bearer " + token)
            .send({
                "brand": "Saab",
                "model": "900",
                "licencePlate": "JGR-645"
            })
            .end(function(err,res){
                expect(err).to.be.null
                expect(res.statusCode).to.equal(201)

                vehicleId = res.body
                done()
            })
        })
        it("should reject request with missing field from data structure", function(done){
        chai.request(serverAddress)
            .post("/vehicles")
            //.set("Authorization", "Bearer " + token)
            .send({
                "model": "900",
                "licencePlate": "JGR-645"
            })
            .end(function(err,res){
                expect(err).to.be.null
                expect(res.statusCode).to.equal(400)
                done()
            })

        })
        it("should reject request with incorrect data types", function(done){
        chai.request(serverAddress)
            .post("/vehicles")
            //.set("Authorization", "Bearer " + token)
            .send({
                "brand": "Saab",
                "model": "900",
                "licencePlate": true
            })
            .end(function(err,res){
                expect(err).to.be.null
                expect(res.statusCode).to.equal(400)
            })
        chai.request(serverAddress)
            .post("/vehicles")
            //.set("Authorization", "Bearer " + token)
            .send({
                "brand": "Saab",
                "model": 900,
                "licencePlate": "JGR-645"
            })
            .end(function(err,res){
                expect(err).to.be.null
                expect(res.statusCode).to.equal(400)
                done()
            })
        })
        it("should reject empty post requests", function(done){
        chai.request(serverAddress)
            .post("/vehicles")
            .end(function(err,res){
                expect(err).to.be.null
                expect(res.statusCode).to.equal(400)
                done()
            })
        })
        it("should contain added item data", function(done){
        chai.request(serverAddress)
            .get(`/vehicles/${vehicleId}`)
            .end(function (err, res) {
                expect(err).to.be.null 
                expect(res.statusCode).to.equal(200)
                
                // check response data structure
                if(res.body.id == vehicleId && res.body.brand == "Saab" && res.body.model == "900" && res.body.licencePlate == "JGR-645") { 
                    done()
                }
                else {
                    assert.fail("Data not saved")
                }         
            })
        })
    })

    //PUT 
    //
    describe("Update vehicle data - PUT /vehicles/:id", function() {
        it("should accept updated vehicle data when data is correct", function(done){
        chai.request(serverAddress)
            .put(`/vehicles/${vehicleId}`)
            //.set("Authorization", "Bearer " + token)
            .send({
                "brand": "updatedSaab",
                "model": "9000",
                "licencePlate": "JGR-555"
            })
            .end(function(err,res){
                expect(err).to.be.null
                expect(res.statusCode).to.equal(200)

                done()
            })
        })
        it("should reject request with missing field from data structure", function(done){
        chai.request(serverAddress)
            .put(`/vehicles/${vehicleId}`)
            //.set("Authorization", "Bearer " + token)
            .send({
                "model": "9000",
                "licencePlate": "JGR-555"
            })
            .end(function(err,res){
                expect(err).to.be.null
                expect(res.statusCode).to.equal(400)
                done()
            })
        })
        it("should reject request with incorrect data types", function(done){
        chai.request(serverAddress)
            .put(`/vehicles/${vehicleId}`)
            //.set("Authorization", "Bearer " + token)
            .send({
                "brand": "updatedSaab",
                "model": 9000,
                "licencePlate": "JGR-555"
            })
            .end(function(err,res){
                expect(err).to.be.null
                expect(res.statusCode).to.equal(400)
            })
        chai.request(serverAddress)
            .put(`/vehicles/${vehicleId}`)
            //.set("Authorization", "Bearer " + token)
            .send({
                "brand": "updatedSaab",
                "model": "9000",
                "licencePlate": true
            })
            .end(function(err,res){
                expect(err).to.be.null
                expect(res.statusCode).to.equal(400)
                done()
            })
        })
        it("should reject empty put requests", function(done){
        chai.request(serverAddress)
            .put(`/vehicles/${vehicleId}`)
            //.set("Authorization", "Bearer " + token)
            .end(function(err,res){
                expect(err).to.be.null
                expect(res.statusCode).to.equal(400)
                done()
            })
        })
        it("should contain added item data", function(done){
        chai.request(serverAddress)
            .get(`/vehicles/${vehicleId}`)
            .end(function (err, res) {
                expect(err).to.be.null 
                expect(res.statusCode).to.equal(200)
                
                // check response data structure
                if(res.body.id == vehicleId && res.body.brand == "updatedSaab" && res.body.model == "9000" && res.body.licencePlate == "JGR-555") { 
                    done()
                }
                else {
                    assert.fail("Data not updated")
                }  
            })
        })
    })

    //DELETE
    //
    describe("Delete vehicle - Delete /vehicles/:id", function() {
        it("should accept request", function(done){
        chai.request(serverAddress)
            .delete(`/vehicles/${vehicleId}`)
            //.set("Authorization", "Bearer " + token)
            .end(function(err,res){
                expect(err).to.be.null
                expect(res.statusCode).to.equal(200)

                done()
            })
        })
        it("should reject request without parameter", function(done){
            chai.request(serverAddress)
                .delete(`/vehicles`)
                //.set("Authorization", "Bearer " + token)
                .end(function(err,res){
                    expect(err).to.be.null
                    expect(res.statusCode).to.equal(404)
                    done()
                })
            })
        it("should delete vehicle data", function(done){
        chai.request(serverAddress)
            .get(`/vehicles/${vehicleId}`)
            .end(function (err, res) {
                expect(err).to.be.null 
                expect(res.statusCode).to.equal(404)
                
                done()
            })
        })
    })
})