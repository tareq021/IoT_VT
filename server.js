const mqtt = require('mqtt');
const express = require("express");
var app = express();
var cons = require('consolidate');
var url = 'mongodb://vtdata:vtdata@ds147069.mlab.com:47069/vt';
const bodyParser = require('body-parser');
const mongodb = require("mongodb");
const mongoose = require('mongoose');
var DATA_COLLECTION = 'gpsData';
var moment = require('moment');
var momentTimezone = require('moment-timezone');
var broker = 'mqtt://test.mosquitto.org';
//var broker='mqtt://broker.hivemq.com';

// MQTT Subscribe
// Data updates autometically
const mqttClient = mqtt.connect(broker);
mqttClient.subscribe('GPSData');
mqttClient.on('message', function(topic, dataFromSensor) {

    var sensorData = JSON.parse(dataFromSensor);
    saveSensorDataToDb(sensorData);
});

//Database operation starts here
mongoose.connect(url, function(err, dataBase) {

    console.log("Database Connected");
});

var dataBaseSchema = new mongoose.Schema({

    deviceID: String,
    deviceTime: String,
    deviceDate: String,
    receiveTime: String,
    receiveDate: String,
    latitude: String,
    longitude: String,
    fix: Number,
    satellites: Number,
    altitude: Number,
    deviceSpeed: Number,
    devicecourse: Number,
    deviceVariation: Number

});

var GPSDataSchemaModel = mongoose.model(DATA_COLLECTION, dataBaseSchema);

function saveSensorDataToDb(sensorData) {

    var saveToDb = new GPSDataSchemaModel({

        deviceID: sensorData.GPGGA.sensorId,
        deviceTime: sensorData.GPGGA.time,
        deviceDate: sensorData.GPGGA.date,
        receiveTime: moment().tz("Asia/Dhaka").format('HH:mm:ss'),
        receiveDate: moment().tz("Asia/Dhaka").format('YYYY/MM/DD'),
        latitude: sensorData.GPGGA.latitude,
        longitude: sensorData.GPGGA.longitude,
        fix: sensorData.GPGGA.fix,
        satellites: sensorData.GPGGA.satellites,
        altitude: sensorData.GPGGA.altitude,
        deviceSpeed: sensorData.GPRMC.speed,
        devicecourse: sensorData.GPRMC.course,
        deviceVariation: sensorData.GPRMC.variation
    });

    saveToDb.save(function(err) {
        if (err) {
            console.log("Error in saving : " + err);
        } else {
            console.log("Saved Data :" + saveToDb)
        }
    })
}


// User operation

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.engine('html', cons.ejs);
app.set('view engine', 'html');

app.get("/getDataByDeviceId/:query", function(req, res) {

    var query = req.params.query;

    GPSDataSchemaModel.find({
        'deviceID': query
    }, function(err, result) {
        if (err) throw err;
        if (result) {

            res.render("index.ejs", {
                dbData: result
            });
        } else {
            res.send(JSON.stringify({
                error: 'Error'
            }))
        }
    })
})

app.get("/getAllData", function(req, res) {

    GPSDataSchemaModel.find({}, function(err, result) {
        if (err) throw err;
        if (result) {
            res.render("index.ejs", {
                dbData: result
            });
        } else {
            res.send(JSON.stringify({
                error: 'Error'
            }));
        };
    });
});

app.get("/onmap", function(req, res) {
    res.render("singleplot.ejs", {
        lat: req.query.latitude,
        lng: req.query.longitude,
        // lat: 23.7739,
        // lng: 90.3663,
    });
});

var server = app.listen(3000, function() {});