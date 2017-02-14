// Required Modules
var GPSSensor = require('jsupm_ublox6');
var GPSSensorId = "group-6-GPS";
var nmea = require('nmea-0183');
var stringSearcher = require('string-search');
const mqtt = require('mqtt');
var moment = require('moment');
var momentTimezone = require('moment-timezone');
var broker = 'mqtt://test.mosquitto.org';
//var broker='mqtt://broker.hivemq.com';
const client = mqtt.connect(broker);

var GPSSensorType = new GPSSensor.Ublox6(0);
var variable_GPGGA = 'GPGGA'; // GPGGA, GPRMC, GPGSA, GPGSV, GPVTG
var variable_GPRMC = 'GPRMC'; // GPGGA, GPRMC, GPGSA, GPGSV, GPVTG
var GPGGAValue = "";
var GPRMCValue = "";

var bufferLength = 256;
var nmeaBuffer = new GPSSensor.charArray(bufferLength);

var currentTime = moment().tz("Asia/Dhaka").format('YYYY/MM/DD HH:mm:ss');

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

			stringSearcher.find(GPSRawData, variable_GPGGA).then(function (resultArr) {
				if (GPSRawData.indexOf('$' + variable_GPGGA) > -1) {

					GPGGAValue = nmea.parse(resultArr[0].text);
				}
			});

			stringSearcher.find(GPSRawData, variable_GPRMC).then(function (resultArr) {
				if (GPSRawData.indexOf('$' + variable_GPRMC) > -1) {

					GPRMCValue = nmea.parse(resultArr[0].text);
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
function printFinalGPSData() {
	console.log(GPGGAValue); // returns JSON format data
	console.log(currentTime)
}

// MQTT Publish
function publishToBroker() {
	getGPSInfo();
	var currentDate = moment().tz("Asia/Dhaka").format('YYYY/MM/DD');
	var currentTime = moment().tz("Asia/Dhaka").format('HH:mm:ss');
	GPGGAValue.date = currentDate;
	GPGGAValue.time = currentTime;
	GPGGAValue.sensorId = GPSSensorId;
	var combineTwo = {
		"GPGGA": GPGGAValue,
		"GPRMC": GPRMCValue,
	}
	// client.publish('GPSData', JSON.stringify(GPGGAValue+GPRMCValue))
	client.publish('GPSData', JSON.stringify(combineTwo))
}

setInterval(publishToBroker, 2000);
//setInterval(printFinalGPSData, 5000);
//setInterval(getGPSInfo, 2);

// Print message when exiting
process.on('SIGINT', function () {
	console.log("Exiting...");
	process.exit(0);
});