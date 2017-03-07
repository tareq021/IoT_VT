var mraa = require('mraa'); //require mraa
console.log('MRAA Version: ' + mraa.getVersion()); //print out the mraa version in IoT XDK console
u = new mraa.Uart(0); //Default
var serialPath = u.getDevicePath(); //Default general purpose port "/dev/ttyMFD1" - Intel(R) Edison; "/dev/ttyS0" - Intel(R) Galileo
var SerialPort = require("serialport");
var serialPort = new SerialPort(serialPath, {
    baudrate: 9600
});

function connectRfidReceiver() {
    serialPort.on("open", function () {
        readData();
    });
}

function readData() {

    serialPort.on("data", function (data) { //Read available data from serial port

        var cardNo = parseInt(data.slice(5, 11), 16).toString(); // Extracts the card number
        if (cardNo.length == 7) {
            console.log("Card No : " + cardNo)
        }
    });
}

connectRfidReceiver();