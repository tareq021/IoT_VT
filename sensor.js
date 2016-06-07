// Required Modules
var GPSSensor = require('jsupm_ublox6');
var nmea = require('nmea-0183');
var stringSearcher = require('string-search');
const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://broker.hivemq.com')

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

// Gets the final data
function getFinalGPSData() {
	console.log(GPSExpectedValue); // returns JSON format data
}

setInterval(getGPSInfo, 10);
setInterval(getFinalGPSData, 1000);

// Print message when exiting
process.on('SIGINT', function () {
	console.log("Exiting...");
	process.exit(0);
});