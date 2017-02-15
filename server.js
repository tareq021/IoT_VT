const mqtt = require('mqtt');
const request = require('request');
const express = require("express");
const bodyParser = require('body-parser');
const mongodb = require("mongodb");
const path = require("path");
const mongoose = require('mongoose');
// var ObjectID = mongodb.ObjectID;
var broker = 'mqtt://test.mosquitto.org';
//var broker='mqtt://broker.hivemq.com';

// MQTT Subscribe
const client = mqtt.connect(broker);
client.subscribe('GPSData');
client.on('message', function (topic, dataFromSensor) {

    var sensorData = JSON.parse(dataFromSensor);
    saveToDb(sensorData);
});

//Database operation starts here
mongoose.connect('mongodb://vtdata:vtdata@ds147069.mlab.com:47069/vt');

var dataBaseSchema = new mongoose.Schema({

    deviceID: String,
    deviceTime: String,
    deviceDate: String,
    latitude: String,
    longitude: String,
    fix: Number,
    satellites: Number,
    altitude: Number,
    deviceSpeed: Number,
    devicecourse: Number,
    deviceVariation: Number

});

var gpsData = mongoose.model('gpsData', dataBaseSchema);

function saveToDb(sensorData) {

    var saveToDb = new gpsData({
        
        deviceID: sensorData.GPGGA.sensorId,
        deviceTime: sensorData.GPGGA.time,
        deviceDate: sensorData.GPGGA.date,
        latitude: sensorData.GPGGA.latitude,
        longitude: sensorData.GPGGA.longitude,
        fix: sensorData.GPGGA.fix,
        satellites: sensorData.GPGGA.satellites,
        altitude: sensorData.GPGGA.altitude,
        deviceSpeed: sensorData.GPRMC.speed,
        devicecourse: sensorData.GPRMC.course,
        deviceVariation: sensorData.GPRMC.variation
    });

    saveToDb.save(function (err) {
        if (err) {
            console.log("Error in saving : " + err);
        }
        else {
            console.log("Saved Data :" + saveToDb)
        }
    })
}