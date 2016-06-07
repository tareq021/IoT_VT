var GPSSensor = require('jsupm_ublox6');
var myGPSSensor = new GPSSensor.Ublox6(0);
// var nmea = require('node-nmea');
nmea = require('nmea-0183')
var stringSearcher = require('string-search');
var GPGGA_VALUE = "";

if (!myGPSSensor.setupTty(GPSSensor.int_B9600)) {
	console.log("Failed to setup tty port parameters");
	process.exit(0);
}

var bufferLength = 256;
var nmeaBuffer = new GPSSensor.charArray(bufferLength);

function getGPSInfo() {
	if (myGPSSensor.dataAvailable()) {
		var rv = myGPSSensor.readData(nmeaBuffer, bufferLength);

		var GPSData, dataCharCode, isNewLine, lastNewLine;
		var numlines = 0;
		if (rv > 0) {
			GPSData = "";
			for (var x = 0; x < rv; x++) {
				GPSData += nmeaBuffer.getitem(x);
			}
			stringSearcher.find(GPSData, 'GPGGA').then(function (resultArr) {
				if (GPSData.indexOf('$GPGGA') > -1) {
					GPGGA_VALUE = nmea.parse(resultArr[0].text);
					// console.log(JSON.stringify(GPGGA_VALUE, null, 2));
					console.log(GPGGA_VALUE.id);
				}
			});
		}

		if (rv < 0) // some sort of read error occured
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
