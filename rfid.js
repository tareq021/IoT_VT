require('events').EventEmitter.prototype._maxListeners = 1000;
var mraa = require('mraa'); //require mraa
const mqtt = require('mqtt');
var moment = require('moment');
var momentTimezone = require('moment-timezone');
var broker = 'mqtt://test.mosquitto.org';
// var broker = 'mqtt://broker.hivemq.com';

console.log('MRAA Version: ' + mraa.getVersion()); //print out the mraa version in IoT XDK console
u = new mraa.Uart(0); //Default
var serialPath = u.getDevicePath(); //Default general purpose port "/dev/ttyMFD1" - Intel(R) Edison; "/dev/ttyS0" - Intel(R) Galileo
var SerialPort = require("serialport");
var serialPort = new SerialPort(serialPath, {
    baudrate: 9600
});

var stationID = "Station-1";
var stationName = "Army Golf Club";
var stationLatitude = 23.821547;
var stationLongitude = 90.414219;
var stationTime = moment().tz("Asia/Dhaka").format('HH:mm:ss');
var stationDate = moment().tz("Asia/Dhaka").format('YYYY/MM/DD');

function connectRfidReceiver() {
    serialPort.on("open", function () {
        console.log("Serial Port opened.");
        readData();
    });
}

function readData() {

    serialPort.on("data", function (data) { //Read available data from serial port

        var rfid = parseInt(data.slice(5, 11), 16).toString(); // Extracts the card number
        if (rfid.length == 7) {
            console.log("Card No : " + rfid)

            var noGpsCoverageInfo = {

                "rfid": rfid,
                "stationID": stationID,
                "stationName": stationName,
                "stationLatitude": stationLatitude,
                "stationLongitude": stationLongitude,
                "stationTime": stationTime,
                "stationDate": stationDate,
            }

            const client = mqtt.connect(broker);
            client.on('connect', function () {

                console.log("Station Connected to MQTT Server. Sending Data...");
                client.publish('noGpsCoverageInfo', JSON.stringify(noGpsCoverageInfo))
            })
        }
    });
}

connectRfidReceiver();

serialPort.on("close", function () {

    console.log("Serial Port Closed!!! Attempting to reopen...  ");
    connectRfidReceiver();
});