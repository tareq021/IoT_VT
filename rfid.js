var mraa = require('mraa'); //require mraa
console.log('MRAA Version: ' + mraa.getVersion()); //print out the mraa version in IoT XDK console
u = new mraa.Uart(0); //Default
var format = require('util').format;
var serialPath = u.getDevicePath(); //Default general purpose port "/dev/ttyMFD1" - Intel(R) Edison; "/dev/ttyS0" - Intel(R) Galileo
var document;

//Serialport NodeJS module declared in package.json
// var SerialPort = require("serialport").SerialPort;
var SerialPort = require("serialport");
var serialPort = new SerialPort(serialPath, {
    baudrate: 9600
});

serialPort.on("open", function() {
    console.log("open");
    console.log("Connected to " + serialPath);
    serialPort.on("data", function(data) { //Read available data from serial port
        
        console.log("data received: " + parseInt(data.slice(5,11),16));
    });
    serialPort.write("This is a test.\n", function(err, results) { //Write data
        console.log("err " + err);
        console.log("results " + results);
    });
});