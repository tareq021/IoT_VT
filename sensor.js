// Required Modules
// require('events').EventEmitter.defaultMaxListeners = Infinity;
// require('events').EventEmitter.prototype._maxListeners = Infinity;
var GPSSensor = require('jsupm_ublox6');
var nmea = require('nmea-0183');
var stringSearcher = require('string-search');
const mqtt = require('mqtt');
// var events = require('events');
var broker='mqtt://test.mosquitto.org';
//var broker='mqtt://broker.hivemq.com';
const client = mqtt.connect(broker);

var GPSSensorType = new GPSSensor.Ublox6(0);
var variable_name = 'GPGGA'; // GPGGA, GPRMC, GPGSA, GPGSV, GPVTG
var GPSExpectedValue = "";

var bufferLength = 256;
var nmeaBuffer = new GPSSensor.charArray(bufferLength);

if (!GPSSensorType.setupTty(GPSSensor.int_B9600)) {
	console.log("Failed to setup tty port parameters");
	process.exit(0);
}

// Reads data from GPS
function getGPSInfo() {
	if (GPSSensorType.dataAvailable()) {
		var read_value = GPSSensorType.readData(nmeaBuffer, bufferLength);

		var GPSRawData;

		if (read_value > 0) {
			GPSRawData = "";
			for (var x = 0; x < read_value; x++) {
				GPSRawData += nmeaBuffer.getitem(x);
			}
			stringSearcher.find(GPSRawData, variable_name).then(function (resultArr) {
				if (GPSRawData.indexOf('$' + variable_name) > -1) {

					GPSExpectedValue = nmea.parse(resultArr[0].text);
				}
			});
		}

		if (read_value < 0) // some sort of read error occured
		{
			console.log("Port read error.");
			process.exit(0);
		}
	}
}

// For Example only
// Prints the final GPS data
function getFinalGPSData() {
	console.log(GPSExpectedValue); // returns JSON format data
}

// MQTT Publish
function publishToBroker() {
	// client.on('connect', function () {
		// client.publish('GPSData', "FROM SENSOR")
		getGPSInfo();
		client.publish('GPSData', JSON.stringify(GPSExpectedValue))
		// client.publish('GPSData', GPSExpectedValue.id)
	// });
}

setInterval(publishToBroker, 5000);
// setInterval(getFinalGPSData, 500);
//setInterval(publishToBroker, 2);

// Print message when exiting
process.on('SIGINT', function () {
	console.log("Exiting...");
	process.exit(0);
});