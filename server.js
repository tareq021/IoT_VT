const mqtt = require('mqtt');
const app = require("express")();
// var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var cons = require('consolidate');
var dbUrl = 'mongodb://vtdata:vtdata@ds147069.mlab.com:47069/vt';
const bodyParser = require('body-parser');
const mongodb = require("mongodb");
var mongoose = require('mongoose');
var GPS_DATA = 'gpsData';
var VEHICLE_DATA = 'vehicleData';
var RFID_DATA = 'rfidData';
var moment = require('moment');
var momentTimezone = require('moment-timezone');
// var broker = 'mqtt://test.mosquitto.org';
var broker='mqtt://broker.hivemq.com';

// MQTT Subscribe
// Data updates autometically
const gpsMqttClient = mqtt.connect(broker);
const noGpsMqttClient = mqtt.connect(broker);

gpsMqttClient.subscribe('GPSData');
gpsMqttClient.on('message', function (topic, dataFromSensor) {

    var sensorData = JSON.parse(dataFromSensor);
    saveSensorDataToDb(sensorData);
});

noGpsMqttClient.on('connect', function () {
    console.log("Server Connected to MQTT broker");
    noGpsMqttClient.subscribe('noGpsCoverageInfo');
    noGpsMqttClient.on('message', function (topic, dataFromSensor) {

        var rfidLocationData = JSON.parse(dataFromSensor);

        console.log('Before WS : ' + rfidLocationData.rfid);

        io.on('connection', function (socket) {
            console.log('After WS : ' + rfidLocationData.rfid);
            socket.emit('announcements', { message: rfidLocationData.rfid });
        });

        // saveRfidDataToDb(rfidLocationData);
    });

})


//Database operation starts here
mongoose.connect(dbUrl, function (err, dataBase) {

    console.log("GPS Database Connected");
});

var gpsSchema = new mongoose.Schema({

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

var deviceSchema = new mongoose.Schema({

    deviceID: String,
    rfid: String,
    vehicleType: String,
    vehicleModel: String,
    vehicleRegNo: String,
    vehicleChesisNo: String,
    vehiclePermission: String,
});

var rfidSchema = new mongoose.Schema({

    rfid: String,
    stationID: String,
    stationName: String,
    stationLatitude: String,
    stationLongitude: String,
    stationTime: String,
    stationDate: String,
});

var GPSDataSchemaModel = mongoose.model(GPS_DATA, gpsSchema);
var vehicleSchemaModel = mongoose.model(VEHICLE_DATA, deviceSchema);
var rfidSchemaModel = mongoose.model(RFID_DATA, rfidSchema);

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

    saveToDb.save(function (err) {
        if (err) {
            console.log("Error in saving : " + err);
        } else {
            console.log("Saved Data :" + saveToDb)
        }
    })
}

function saveVehicleDataToDb(deviceData) {

    var saveToDb = new vehicleSchemaModel({

        deviceID: deviceData.deviceID,
        rfid: deviceData.rfid,
        vehicleType: deviceData.vehicleType,
        vehicleModel: deviceData.vehicleModel,
        vehicleRegNo: deviceData.vehicleRegNo,
        vehicleChesisNo: deviceData.vehicleChesisNo,
        vehiclePermission: deviceData.vehiclePermission,
    });

    saveToDb.save(function (err) {
        if (err) {
            console.log("Error in saving : " + err);
        } else {
            console.log("Saved Data :" + saveToDb)
        }
    })
}

function saveRfidDataToDb(rfidData) {

    var saveToDb = new rfidSchemaModel({

        rfid: rfidData.rfid,
        stationID: rfidData.stationID,
        stationName: rfidData.stationName,
        stationLatitude: rfidData.stationLatitude,
        stationLongitude: rfidData.stationLongitude,
        stationTime: rfidData.stationTime,
        stationDate: rfidData.stationDate,
    });

    saveToDb.save(function (err) {
        if (err) {
            console.log("Error in saving : " + err);
        } else {
            console.log("Saved Data :" + saveToDb)
        }
    })
}

// User operation

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.engine('html', cons.ejs);
app.set('view engine', 'html');

app.get("/vehicleDetail", function (req, res) {

    res.sendFile(__dirname + "/views/vehicledetail.html", {
        // title: "Vehicle Detail"
    });
});

// io.on('connection', function (socket) {
//     console.log('a user connected');
//     socket.emit('announcements', { message: 'A new user has joined!' });
// });

app.get("/addDevice", function (req, res) {

    res.render("addvehicle.ejs", {
        title: "Add Device"
    });
});

app.post("/addDevice", function (req, res) {

    saveVehicleDataToDb(req.body);
    res.redirect("/devices");
});

app.get("/deleteDevice/:query", function (req, res) {

    var query = req.params.query;

    // This also works
    // vehicleSchemaModel.remove({ deviceID: query })
    //     .then(returned => res.redirect("/devices"))
    //     .catch(err => { console.log(err) })

    vehicleSchemaModel.remove({ deviceID: query }, function (err, doc) {
        if (err) console.log(err);
        res.redirect("/devices")
    })
});

app.get("/devices", function (req, res) {

    vehicleSchemaModel.find().distinct('deviceID', function (error, ids) {
        res.render("devices.ejs", {
            devices: ids,
            title: "Device List"
        });
    });
});

app.get("/getDataByDeviceId/:query", function (req, res) {

    var query = req.params.query;

    GPSDataSchemaModel.find({
        'deviceID': query
    }, function (err, result) {
        if (err) throw err;
        if (result) {

            res.render("gpsdata.ejs", {
                dbData: result,
                title: "GPS Data : " + query
            });
        } else {
            res.send(JSON.stringify({
                error: 'Error'
            }));
        }
    });
});

app.get("/getAllData", function (req, res) {

    GPSDataSchemaModel.find({}, function (err, result) {
        if (err) throw err;
        if (result) {
            res.render("gpsdata.ejs", {
                dbData: result,
                title: "GPS Data of All Device"
            });
        } else {
            res.send(JSON.stringify({
                error: 'Error'
            }));
        };
    });
});

app.get("/onmap", function (req, res) {
    res.render("singleplot.ejs", {
        lat: req.query.latitude,
        lng: req.query.longitude,
    });
});

// var server = app.listen(3000, function () { });

server.listen(3000);