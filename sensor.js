// Required Modules
var GPSSensor = require('jsupm_ublox6');
var nmea = require('nmea-0183')
var stringSearcher = require('string-search');

var GPSSensor = new GPSSensor.Ublox6(0);
var variable_value = "";
var variable_name = 'GPGGA'; // GPGGA, GPRMC, GPGSA, GPGSV, GPVTG

if (!GPSSensor.setupTty(GPSSensor.int_B9600)) {
	console.log("Failed to setup tty port parameters");
	process.exit(0);
}

var bufferLength = 256;
var nmeaBuffer = new GPSSensor.charArray(bufferLength);

function getGPSInfo() {
	if (GPSSensor.dataAvailable()) {
		var read_value = GPSSensor.readData(nmeaBuffer, bufferLength);

		var GPSData;

		var numlines = 0;
		if (read_value > 0) {
			GPSData = "";
			for (var x = 0; x < read_value; x++) {
				GPSData += nmeaBuffer.getitem(x);
			}
			stringSearcher.find(GPSData, variable_name).then(function (resultArr) {
				if (GPSData.indexOf('$' + variable_name) > -1) {
					variable_value = nmea.parse(resultArr[0].text);
					console.log(JSON.stringify(variable_value, null, 2));
					// console.log(variable_value.id);
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

setInterval(getGPSInfo, 10);

// Print message when exiting
process.on('SIGINT', function () {
	console.log("Exiting...");
	process.exit(0);
});
